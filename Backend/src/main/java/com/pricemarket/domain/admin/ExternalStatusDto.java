package com.pricemarket.domain.admin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ExternalStatusDto(OpinetStatus opinet, EcosStatus ecos) {

    public record OpinetStatus(
            LocalDateTime lastSyncAt,
            long stockCount,
            long priceHistoryCount,
            LocalDate oldestDate,
            LocalDate latestDate
    ) {}

    public record EcosStatus(
            LocalDateTime lastSyncAt,
            long stockCount,
            long priceHistoryCount,
            List<EcosStockInfo> stocks
    ) {}

    public record EcosStockInfo(String id, String name, Long latestValue, String unit) {}
}
