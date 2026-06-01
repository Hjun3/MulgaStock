package com.pricemarket.dto.stock;

import com.pricemarket.domain.stock.Stock;

public record StockSummaryDto(
        String id,
        String name,
        String category,
        String subcategory,
        String unit,
        Long currentPrice,
        Long previousPrice,
        Long changeAmount,
        Double changePercent,
        Long yearHigh,
        Long yearLow,
        Long volume
) {
    public static StockSummaryDto from(Stock stock) {
        return new StockSummaryDto(
                stock.getId(),
                stock.getName(),
                stock.getCategory().getDisplayName(),
                stock.getSubcategory(),
                stock.getUnit(),
                stock.getCurrentPrice(),
                stock.getPreviousPrice(),
                stock.getChangeAmount(),
                stock.getChangePercent(),
                stock.getYearHigh(),
                stock.getYearLow(),
                stock.getVolume()
        );
    }
}
