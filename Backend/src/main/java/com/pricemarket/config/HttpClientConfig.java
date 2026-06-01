package com.pricemarket.config;

import com.pricemarket.external.opinet.OpinetProperties;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class HttpClientConfig {

    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder, OpinetProperties opinetProperties) {
        RestTemplate restTemplate = builder
                .setConnectTimeout(Duration.ofMillis(opinetProperties.getTimeoutMs()))
                .setReadTimeout(Duration.ofMillis(opinetProperties.getTimeoutMs()))
                .build();

        // Opinet API는 JSON 바디를 반환하면서 Content-Type을 text/html;charset=utf-8로 설정함.
        // Jackson 컨버터가 text/html도 처리하도록 지원 미디어 타입에 추가.
        restTemplate.getMessageConverters().stream()
                .filter(c -> c instanceof MappingJackson2HttpMessageConverter)
                .map(c -> (MappingJackson2HttpMessageConverter) c)
                .findFirst()
                .ifPresent(converter -> {
                    List<MediaType> types = new ArrayList<>(converter.getSupportedMediaTypes());
                    types.add(MediaType.TEXT_HTML);
                    converter.setSupportedMediaTypes(types);
                });

        return restTemplate;
    }
}
