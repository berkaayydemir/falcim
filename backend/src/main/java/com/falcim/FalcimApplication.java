package com.falcim;

import com.falcim.config.props.ClaudeProperties;
import com.falcim.config.props.CorsProperties;
import com.falcim.config.props.JwtProperties;
import com.falcim.config.props.QuotaProperties;
import com.falcim.config.props.RateLimitProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties({
        JwtProperties.class,
        ClaudeProperties.class,
        CorsProperties.class,
        QuotaProperties.class,
        RateLimitProperties.class
})
public class FalcimApplication {

    public static void main(String[] args) {
        SpringApplication.run(FalcimApplication.class, args);
    }
}
