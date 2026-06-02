package com.pricemarket.external.kamis;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "external-api.kamis")
@Getter
@Setter
public class KamisProperties {

    private String baseUrl;
    private String certKey;
    private String certId;
    private int timeoutMs = 15000;

    public boolean isConfigured() {
        return certKey != null && !certKey.isBlank()
                && certId != null && !certId.isBlank()
                && !"your_kamis_cert_key_here".equals(certKey);
    }
}
