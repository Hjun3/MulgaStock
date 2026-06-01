package com.pricemarket.domain.stock;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StockCategory {
    FOOD("식품"),
    DAILY("생필품"),
    ENERGY("에너지"),
    GOODS("공산품"),
    MACRO("거시지표");

    private final String displayName;
}
