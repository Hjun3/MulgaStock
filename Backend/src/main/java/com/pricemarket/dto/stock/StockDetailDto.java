package com.pricemarket.dto.stock;

import com.pricemarket.domain.stock.DataSource;
import com.pricemarket.domain.stock.Stock;

public record StockDetailDto(
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
        Long volume,
        Double categoryAveragePrice,
        Double categoryAverageChangePercent,
        String source,
        String externalCode
) {
    public static StockDetailDto from(Stock stock, Double categoryAvgPrice, Double categoryAvgChangePercent) {
        return new StockDetailDto(
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
                stock.getVolume(),
                categoryAvgPrice,
                categoryAvgChangePercent,
                stock.getSource() != null ? stock.getSource().getDisplayName() : DataSource.SEED.getDisplayName(),
                stock.getExternalCode()
        );
    }
}
