package com.pricemarket.external.kamis.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class KamisPeriodResponse {

    private List<Map<String, Object>> condition;

    @JsonDeserialize(using = KamisDataDeserializer.class)
    private KamisData data;

    @Data
    public static class KamisData {

        @JsonProperty("error_code")
        private String errorCode;

        @JsonDeserialize(using = KamisItemListDeserializer.class)
        private List<KamisItemDto> item;
    }
}
