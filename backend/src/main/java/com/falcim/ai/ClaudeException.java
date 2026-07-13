package com.falcim.ai;

/**
 * Claude API çağrısı başarısız olduğunda fırlatılır. Sağlayıcılar bunu yakalayıp
 * kullanıcıya fallback sonuç gösterir.
 */
public class ClaudeException extends RuntimeException {

    public ClaudeException(String message) {
        super(message);
    }

    public ClaudeException(String message, Throwable cause) {
        super(message, cause);
    }
}
