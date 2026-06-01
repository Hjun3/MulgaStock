package com.pricemarket.dto.price;

import com.pricemarket.domain.price.PriceHistory;

import java.time.LocalDate;

public record PriceHistoryDto(
        LocalDate date,
        Long open,
        Long high,
        Long low,
        Long close,
        Long volume
) {
    public static PriceHistoryDto from(PriceHistory ph) {
        return new PriceHistoryDto(
                ph.getDate(),
                ph.getOpenPrice(),
                ph.getHighPrice(),
                ph.getLowPrice(),
                ph.getClosePrice(),
                ph.getVolume()
        );
    }
}
