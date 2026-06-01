package com.pricemarket.dto.stock;

import com.pricemarket.domain.stock.Stock;

public record TopMoverDto(
        String id,
        String name,
        String category,
        Long currentPrice,
        Double changePercent,
        Long changeAmount,
        String unit
) {
    public static TopMoverDto from(Stock stock) {
        return new TopMoverDto(
                stock.getId(),
                stock.getName(),
                stock.getCategory().getDisplayName(),
                stock.getCurrentPrice(),
                stock.getChangePercent(),
                stock.getChangeAmount(),
                stock.getUnit()
        );
    }
}
