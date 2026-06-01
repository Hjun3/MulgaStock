package com.pricemarket.external.opinet;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "external-api.opinet")
@Getter
@Setter
public class OpinetProperties {

    private String baseUrl;
    private String apiKey;
    private int timeoutMs = 10000;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank();
    }
}
