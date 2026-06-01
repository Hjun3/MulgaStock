package com.pricemarket.external.ecos;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "external-api.ecos")
@Getter
@Setter
public class EcosProperties {

    private String baseUrl;
    private String apiKey;

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && !"dummy".equals(apiKey);
    }
}
