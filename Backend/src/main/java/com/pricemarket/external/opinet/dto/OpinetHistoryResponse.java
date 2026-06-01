package com.pricemarket.external.opinet.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

@Getter
@NoArgsConstructor
public class OpinetHistoryResponse {

    @JsonProperty("RESULT")
    private Result result;

    @Getter
    @NoArgsConstructor
    public static class Result {
        @JsonProperty("OIL")
        private List<OpinetHistoryOilDto> oil;

        public List<OpinetHistoryOilDto> getOil() {
            return oil != null ? oil : Collections.emptyList();
        }
    }

    public List<OpinetHistoryOilDto> getOilList() {
        return result != null ? result.getOil() : Collections.emptyList();
    }
}
