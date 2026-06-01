package com.pricemarket.external.opinet.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

@Getter
@NoArgsConstructor
public class OpinetCurrentPriceResponse {

    @JsonProperty("RESULT")
    private Result result;

    @Getter
    @NoArgsConstructor
    public static class Result {
        @JsonProperty("OIL")
        private List<OpinetOilDto> oil;

        public List<OpinetOilDto> getOil() {
            return oil != null ? oil : Collections.emptyList();
        }
    }

    public List<OpinetOilDto> getOilList() {
        return result != null ? result.getOil() : Collections.emptyList();
    }
}
