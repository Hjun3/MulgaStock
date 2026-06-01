package com.pricemarket.external.opinet.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Getter
@NoArgsConstructor
public class OpinetOilDto {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    @JsonProperty("TRADE_DT")
    private String tradeDt;

    @JsonProperty("PRODCD")
    private String prodCd;

    @JsonProperty("PRODNM")
    private String prodNm;

    @JsonProperty("PRICE")
    private String price;

    @JsonProperty("DIFF")
    private String diff;

    public LocalDate getTradeDate() {
        if (tradeDt == null || tradeDt.isBlank()) return null;
        return LocalDate.parse(tradeDt, DATE_FMT);
    }

    public long getPriceLong() {
        if (price == null || price.isBlank()) return 0L;
        return Math.round(new BigDecimal(price.trim()).doubleValue());
    }
}
