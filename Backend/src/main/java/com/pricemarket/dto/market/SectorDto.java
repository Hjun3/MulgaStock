package com.pricemarket.dto.market;

public record SectorDto(
        String category,
        String displayName,
        Double averageChangePercent,
        int stockCount,
        TopGainerInfo topGainer
) {
    public record TopGainerInfo(String id, String name, Double changePercent) {}
}
