package com.pricemarket.external.opinet.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Getter
@NoArgsConstructor
public class OpinetHistoryOilDto {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    @JsonProperty("DATE")
    private String date;

    @JsonProperty("PRODCD")
    private String prodCd;

    @JsonProperty("PRICE")
    private String price;

    public LocalDate getTradeDate() {
        if (date == null || date.isBlank()) return null;
        return LocalDate.parse(date.trim(), DATE_FMT);
    }

    public long getPriceLong() {
        if (price == null || price.isBlank()) return 0L;
        return Math.round(new BigDecimal(price.trim()).doubleValue());
    }
}
