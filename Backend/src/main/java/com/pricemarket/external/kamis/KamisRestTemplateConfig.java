package com.pricemarket.external.kamis;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;

@Configuration
public class KamisRestTemplateConfig {

    private static final String USER_AGENT =
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    @Bean("kamisRestTemplate")
    public RestTemplate kamisRestTemplate(RestTemplateBuilder builder) {
        RestTemplate restTemplate = builder
                .setConnectTimeout(Duration.ofSeconds(15))
                .setReadTimeout(Duration.ofSeconds(30))
                .additionalInterceptors((request, body, execution) -> {
                    request.getHeaders().set("User-Agent", USER_AGENT);
                    request.getHeaders().set("Referer", "https://www.kamis.or.kr/");
                    request.getHeaders().set("Accept", "application/json, application/xml, */*");
                    return execution.execute(request, body);
                })
                .build();

        // KAMIS는 JSON 바디를 text/plain 또는 text/html Content-Type으로 응답할 수 있음
        restTemplate.getMessageConverters().stream()
                .filter(c -> c instanceof MappingJackson2HttpMessageConverter)
                .map(c -> (MappingJackson2HttpMessageConverter) c)
                .findFirst()
                .ifPresent(converter -> {
                    var types = new ArrayList<>(converter.getSupportedMediaTypes());
                    types.add(MediaType.TEXT_PLAIN);
                    types.add(MediaType.TEXT_HTML);
                    converter.setSupportedMediaTypes(types);
                });

        return restTemplate;
    }
}
