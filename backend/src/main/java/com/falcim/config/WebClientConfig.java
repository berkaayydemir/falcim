package com.falcim.config;

import com.falcim.config.props.ClaudeProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;

@Configuration
public class WebClientConfig {

    /**
     * Claude API için önceden yapılandırılmış WebClient.
     * API anahtarı ve versiyon başlıkları burada set edilir; anahtar sunucuda kalır.
     */
    @Bean
    public WebClient claudeWebClient(ClaudeProperties props) {
        HttpClient httpClient = HttpClient.create()
                .responseTimeout(Duration.ofSeconds(props.timeoutSeconds()));

        return WebClient.builder()
                .baseUrl(props.baseUrl())
                .clientConnector(new ReactorClientHttpConnector(httpClient))
                .defaultHeader("anthropic-version", props.version())
                .codecs(cfg -> cfg.defaultCodecs().maxInMemorySize(10 * 1024 * 1024)) // 10MB (base64 görsel)
                .build();
    }
}
