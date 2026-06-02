package com.pricemarket.seed.agri;

import com.pricemarket.domain.stock.StockCategory;

public record AgriStockMeta(
        String id,
        String name,
        String displayUnit,
        String categoryCode,
        String itemCode,
        String kindCode,
        String rankCode,
        StockCategory category
) {}
