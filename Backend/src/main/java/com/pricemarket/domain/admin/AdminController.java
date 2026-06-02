package com.pricemarket.domain.admin;

import com.pricemarket.common.ApiResponse;
import com.pricemarket.domain.price.PriceHistoryRepository;
import com.pricemarket.domain.stock.DataSource;
import com.pricemarket.domain.stock.Stock;
import com.pricemarket.domain.stock.StockRepository;
import com.pricemarket.scheduler.EcosScheduler;
import com.pricemarket.scheduler.KamisScheduler;
import com.pricemarket.scheduler.OpinetScheduler;
import com.pricemarket.seed.agri.AgriStockCatalog;
import com.pricemarket.seed.energy.EnergyStockSeeder;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final StockRepository stockRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final EnergyStockSeeder energyStockSeeder;
    private final OpinetScheduler opinetScheduler;
    private final EcosScheduler ecosScheduler;
    private final KamisScheduler kamisScheduler;

    @GetMapping("/external-status")
    public ApiResponse<ExternalStatusDto> getExternalStatus() {
        ExternalStatusDto.OpinetStatus opinetStatus = buildOpinetStatus();
        ExternalStatusDto.EcosStatus ecosStatus = buildEcosStatus();
        ExternalStatusDto.KamisStatus kamisStatus = buildKamisStatus();
        return ApiResponse.success(new ExternalStatusDto(opinetStatus, ecosStatus, kamisStatus));
    }

    @PostMapping("/sync/opinet")
    public ApiResponse<Map<String, Object>> syncOpinet(
            @RequestParam(defaultValue = "false") boolean force) {
        int saved = energyStockSeeder.syncNow(force);
        return ApiResponse.success(Map.of(
                "force", force,
                "savedPriceRecords", saved,
                "message", saved > 0 ? "동기화 완료" : "건너뜀 (이미 동기화됨 또는 API 키 미설정)"
        ));
    }

    @PostMapping("/scheduler/opinet/trigger")
    public ApiResponse<String> triggerOpinet() {
        opinetScheduler.updateDailyPrices();
        return ApiResponse.success("Opinet scheduler triggered");
    }

    @PostMapping("/scheduler/ecos/trigger")
    public ApiResponse<String> triggerEcos() {
        ecosScheduler.updateDailyPrices();
        return ApiResponse.success("ECOS scheduler triggered");
    }

    @PostMapping("/scheduler/kamis/trigger")
    public ApiResponse<String> triggerKamis() {
        kamisScheduler.updateDailyPrices();
        return ApiResponse.success("KAMIS scheduler triggered");
    }

    private ExternalStatusDto.OpinetStatus buildOpinetStatus() {
        long stockCount = stockRepository.countBySource(DataSource.OPINET);
        long historyCount = priceHistoryRepository.countByStockSource(DataSource.OPINET);
        LocalDate oldestDate = priceHistoryRepository.findOldestDateByStockSource(DataSource.OPINET).orElse(null);
        LocalDate latestDate = priceHistoryRepository.findLatestDateByStockSource(DataSource.OPINET).orElse(null);
        LocalDateTime lastSyncAt = stockRepository.findBySource(DataSource.OPINET).stream()
                .map(Stock::getUpdatedAt)
                .filter(t -> t != null)
                .max(Comparator.naturalOrder())
                .orElse(null);
        return new ExternalStatusDto.OpinetStatus(lastSyncAt, stockCount, historyCount, oldestDate, latestDate);
    }

    private ExternalStatusDto.EcosStatus buildEcosStatus() {
        long stockCount = stockRepository.countBySource(DataSource.ECOS);
        long historyCount = priceHistoryRepository.countByStockSource(DataSource.ECOS);
        LocalDateTime lastSyncAt = stockRepository.findBySource(DataSource.ECOS).stream()
                .map(Stock::getUpdatedAt)
                .filter(t -> t != null)
                .max(Comparator.naturalOrder())
                .orElse(null);

        List<ExternalStatusDto.EcosStockInfo> stocks = stockRepository.findBySource(DataSource.ECOS).stream()
                .map(s -> new ExternalStatusDto.EcosStockInfo(
                        s.getId(), s.getName(), s.getCurrentPrice(), s.getUnit()))
                .toList();

        return new ExternalStatusDto.EcosStatus(lastSyncAt, stockCount, historyCount, stocks);
    }

    private ExternalStatusDto.KamisStatus buildKamisStatus() {
        long stockCount = stockRepository.countBySource(DataSource.KAMIS);
        long historyCount = priceHistoryRepository.countByStockSource(DataSource.KAMIS);
        LocalDateTime lastSyncAt = stockRepository.findBySource(DataSource.KAMIS).stream()
                .map(Stock::getUpdatedAt)
                .filter(t -> t != null)
                .max(Comparator.naturalOrder())
                .orElse(null);

        Set<String> kamisIds = stockRepository.findBySource(DataSource.KAMIS).stream()
                .map(Stock::getId)
                .collect(java.util.stream.Collectors.toSet());

        List<String> successItems = AgriStockCatalog.ITEMS.stream()
                .map(m -> m.id())
                .filter(kamisIds::contains)
                .toList();

        List<String> failedItems = AgriStockCatalog.ITEMS.stream()
                .map(m -> m.id())
                .filter(id -> !kamisIds.contains(id))
                .toList();

        return new ExternalStatusDto.KamisStatus(lastSyncAt, stockCount, historyCount, successItems, failedItems);
    }
}
