package com.falcim.ai;

import com.falcim.config.props.ClaudeProperties;
import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.ArrayList;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Claude (Anthropic) Messages API için ince istemci. API anahtarı yalnızca sunucuda kalır.
 * Metin ve opsiyonel görsel içeren tek turluk bir istek gönderip metin yanıt döner.
 */
@Component
public class ClaudeClient {

    private static final Logger log = LoggerFactory.getLogger(ClaudeClient.class);
    private static final String MESSAGES_PATH = "/v1/messages";

    private final WebClient claudeWebClient;
    private final ClaudeProperties props;

    public ClaudeClient(WebClient claudeWebClient, ClaudeProperties props) {
        this.claudeWebClient = claudeWebClient;
        this.props = props;
    }

    /**
     * @param systemPrompt sistem talimatı
     * @param userText     kullanıcı mesajı metni
     * @param imageBytes   opsiyonel görsel (null olabilir)
     * @param mediaType    görsel MIME tipi (imageBytes varsa)
     * @return modelin ürettiği metin
     */
    public String complete(String systemPrompt, String userText, byte[] imageBytes, String mediaType) {
        if (!props.isConfigured()) {
            throw new ClaudeException("Claude API anahtarı yapılandırılmamış (CLAUDE_API_KEY).");
        }

        Map<String, Object> body = buildRequestBody(systemPrompt, userText, imageBytes, mediaType);

        try {
            JsonNode response = claudeWebClient.post()
                    .uri(MESSAGES_PATH)
                    .header("x-api-key", props.apiKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return extractText(response);
        } catch (WebClientResponseException ex) {
            log.error("Claude API hata durumu {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new ClaudeException("Claude API hatası: " + ex.getStatusCode(), ex);
        } catch (ClaudeException ex) {
            throw ex;
        } catch (Exception ex) {
            log.error("Claude API çağrısı başarısız", ex);
            throw new ClaudeException("Claude API çağrısı başarısız oldu.", ex);
        }
    }

    private Map<String, Object> buildRequestBody(String systemPrompt, String userText,
                                                 byte[] imageBytes, String mediaType) {
        List<Map<String, Object>> content = new ArrayList<>();

        if (imageBytes != null && imageBytes.length > 0) {
            String base64 = Base64.getEncoder().encodeToString(imageBytes);
            Map<String, Object> source = new LinkedHashMap<>();
            source.put("type", "base64");
            source.put("media_type", mediaType == null ? "image/jpeg" : mediaType);
            source.put("data", base64);

            Map<String, Object> imageBlock = new LinkedHashMap<>();
            imageBlock.put("type", "image");
            imageBlock.put("source", source);
            content.add(imageBlock);
        }

        Map<String, Object> textBlock = new LinkedHashMap<>();
        textBlock.put("type", "text");
        textBlock.put("text", userText);
        content.add(textBlock);

        Map<String, Object> message = new LinkedHashMap<>();
        message.put("role", "user");
        message.put("content", content);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("model", props.model());
        body.put("max_tokens", props.maxTokens());
        body.put("system", systemPrompt);
        body.put("messages", List.of(message));
        return body;
    }

    private String extractText(JsonNode response) {
        if (response == null || !response.has("content") || !response.get("content").isArray()) {
            throw new ClaudeException("Claude API beklenmeyen yanıt döndürdü.");
        }
        for (JsonNode block : response.get("content")) {
            if ("text".equals(block.path("type").asText()) && block.hasNonNull("text")) {
                String text = block.get("text").asText().trim();
                if (!text.isBlank()) {
                    return text;
                }
            }
        }
        throw new ClaudeException("Claude API boş yanıt döndürdü.");
    }
}
