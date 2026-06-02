package com.pricemarket.external.kamis.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class KamisItemDto {

    private String yyyy;

    private String regday;

    private String price;

    @JsonProperty("itemname")
    private Object itemName;

    @JsonProperty("countyname")
    private Object countyName;

    public LocalDate toLocalDate() {
        String[] parts = regday.split("/");
        int month = Integer.parseInt(parts[0]);
        int day = Integer.parseInt(parts[1]);
        return LocalDate.of(Integer.parseInt(yyyy), month, day);
    }

    public long toPrice() {
        if (price == null || price.isBlank() || "-".equals(price.trim())) return 0L;
        try {
            return Long.parseLong(price.replace(",", "").trim());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}
