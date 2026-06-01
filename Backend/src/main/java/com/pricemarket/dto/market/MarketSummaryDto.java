package com.pricemarket.dto.market;

import java.time.LocalDateTime;
import java.util.List;

public record MarketSummaryDto(
        Double totalChangePercent,
        int totalStocks,
        long gainersCount,
        long losersCount,
        long flatCount,
        LocalDateTime lastUpdated,
        List<SectorDto> sectors
) {}
