package com.pricemarket.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("PriceMarket API")
                        .description("물가를 주식장 UI로 보여주는 웹 서비스의 백엔드 API")
                        .version("v1.0.0"));
    }
}
