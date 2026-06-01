package com.pricemarket.external.ecos.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

@Getter
@NoArgsConstructor
public class EcosSearchResponse {

    @JsonProperty("StatisticSearch")
    private StatisticSearch statisticSearch;

    @JsonProperty("RESULT")
    private ErrorResult result;

    public List<EcosRowDto> getRows() {
        if (statisticSearch != null && statisticSearch.getRow() != null) {
            return statisticSearch.getRow();
        }
        return Collections.emptyList();
    }

    public boolean isError() {
        return result != null && result.getCode() != null;
    }

    @Getter
    @NoArgsConstructor
    public static class StatisticSearch {
        @JsonProperty("list_total_count")
        private Integer listTotalCount;

        @JsonProperty("row")
        private List<EcosRowDto> row;
    }

    @Getter
    @NoArgsConstructor
    public static class ErrorResult {
        @JsonProperty("CODE")
        private String code;

        @JsonProperty("MESSAGE")
        private String message;

        public boolean isNoData() {
            return "INFO-200".equals(code) || "INFO-300".equals(code);
        }
    }
}
