package com.pricemarket.seed.energy;

import com.pricemarket.domain.price.PriceHistory;
import com.pricemarket.domain.stock.DataSource;
import com.pricemarket.domain.stock.Stock;
import com.pricemarket.domain.stock.StockCategory;
import com.pricemarket.domain.stock.StockRepository;
import com.pricemarket.external.opinet.OpinetClient;
import com.pricemarket.external.opinet.OpinetProperties;
import com.pricemarket.external.opinet.dto.OpinetHistoryOilDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@Order(2)
@RequiredArgsConstructor
@Slf4j
public class EnergyStockSeeder implements CommandLineRunner {

    private static final List<EnergyStockMeta> ENERGY_STOCKS = List.of(
            new EnergyStockMeta("gasoline",         "휘발유",      "B027", "연료", "1L"),
            new EnergyStockMeta("premium_gasoline",  "고급휘발유",  "B034", "연료", "1L"),
            new EnergyStockMeta("diesel",            "경유",        "D047", "연료", "1L"),
            new EnergyStockMeta("kerosene",          "실내등유",    "C004", "연료", "1L"),
            new EnergyStockMeta("lpg",               "자동차부탄",  "K015", "연료", "1L")
    );

    private static final int BATCH_SIZE = 500;
    private static final long CALL_DELAY_MS = 200;

    private final StockRepository stockRepository;
    private final PriceHistoryBatchSaver batchSaver;
    private final OpinetClient opinetClient;
    private final OpinetProperties opinetProperties;

    @Override
    public void run(String... args) {
        syncNow(false);
    }

    /**
     * Opinet 에너지 데이터 동기화.
     * @param force true이면 기존 OPINET 데이터가 있어도 전체 재수집
     * @return 저장된 price_history 레코드 수 (0이면 skip 또는 실패)
     */
    public int syncNow(boolean force) {
        if (!opinetProperties.isConfigured()) {
            log.warn("OPINET_API_KEY is not set — skipping energy stock seeder");
            return 0;
        }

        if (!force) {
            boolean alreadySeeded = stockRepository.findBySource(DataSource.OPINET).size() > 0;
            if (alreadySeeded) {
                log.info("Opinet energy stocks already exist — skipping seeder (use force=true to resync)");
                return 0;
            }
        }

        log.info("Energy stock seeder started (force={}) — collecting 5 years of daily data from Opinet", force);

        try {
            LocalDate endDate = LocalDate.now();
            LocalDate startDate = endDate.minusYears(5);

            Map<String, Map<LocalDate, Long>> pricesByCode = collectHistoricalData(startDate, endDate);

            int totalRecords = 0;
            for (EnergyStockMeta meta : ENERGY_STOCKS) {
                Map<LocalDate, Long> prices = pricesByCode.getOrDefault(meta.externalCode(), Map.of());
                if (prices.isEmpty()) {
                    log.warn("No price data collected for {} ({})", meta.name(), meta.externalCode());
                    continue;
                }

                // 기존 엔티티 재사용 (delete+create 시 JPA REMOVED 상태 충돌 방지)
                Stock stock = stockRepository.findById(meta.id()).orElseGet(Stock::new);
                applyOpinetData(stock, meta, prices, endDate);

                batchSaver.deleteByStockId(meta.id());
                stockRepository.save(stock);

                List<PriceHistory> histories = buildHistories(stock, prices);
                saveBatched(histories);
                totalRecords += histories.size();
                log.info("Saved {} price records for {}", histories.size(), meta.name());
            }

            log.info("Energy stock seeder completed — {} stocks, {} price records", ENERGY_STOCKS.size(), totalRecords);
            return totalRecords;
        } catch (Exception e) {
            log.error("Energy stock seeder failed — energy stocks will remain as seed data", e);
            return 0;
        }
    }

    /**
     * startDate ~ endDate 범위를 7일 단위 창으로 역방향 수집.
     * 전 유종을 한 번의 API 호출로 가져오므로 창당 1회 = 최대 ~261회.
     */
    private Map<String, Map<LocalDate, Long>> collectHistoricalData(LocalDate startDate, LocalDate endDate) {
        Map<String, Map<LocalDate, Long>> result = new HashMap<>();
        for (EnergyStockMeta meta : ENERGY_STOCKS) {
            result.put(meta.externalCode(), new HashMap<>());
        }

        LocalDate cursor = endDate;
        int windowsTotal = 0;
        int windowsFailed = 0;

        while (!cursor.isBefore(startDate)) {
            try {
                List<OpinetHistoryOilDto> chunk = opinetClient.getHistoryFor7Days(cursor);
                for (OpinetHistoryOilDto oil : chunk) {
                    Map<LocalDate, Long> byDate = result.get(oil.getProdCd());
                    if (byDate != null && oil.getTradeDate() != null && oil.getPriceLong() > 0) {
                        // 이미 있는 날짜는 덮어쓰지 않음 (최신 값 우선)
                        byDate.putIfAbsent(oil.getTradeDate(), oil.getPriceLong());
                    }
                }
                windowsTotal++;
            } catch (Exception e) {
                log.warn("Failed to fetch window ending {}, skipping", cursor, e);
                windowsFailed++;
            }

            cursor = cursor.minusDays(7);

            try {
                Thread.sleep(CALL_DELAY_MS);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.warn("Seeder interrupted during data collection");
                break;
            }
        }

        log.info("Opinet collection complete: {} windows fetched, {} failed", windowsTotal, windowsFailed);
        return result;
    }

    private void applyOpinetData(Stock stock, EnergyStockMeta meta, Map<LocalDate, Long> prices, LocalDate endDate) {
        List<LocalDate> sortedDates = prices.keySet().stream().sorted().toList();
        LocalDate latestDate = sortedDates.get(sortedDates.size() - 1);
        LocalDate prevDate = sortedDates.size() >= 2 ? sortedDates.get(sortedDates.size() - 2) : latestDate;

        long currentPrice = prices.get(latestDate);
        long previousPrice = prices.get(prevDate);
        long changeAmount = currentPrice - previousPrice;
        double changePercent = previousPrice != 0
                ? Math.round((double) changeAmount / previousPrice * 10000.0) / 100.0
                : 0.0;

        LocalDate yearAgo = endDate.minusYears(1);
        long yearHigh = prices.entrySet().stream()
                .filter(e -> !e.getKey().isBefore(yearAgo))
                .mapToLong(Map.Entry::getValue).max().orElse(currentPrice);
        long yearLow = prices.entrySet().stream()
                .filter(e -> !e.getKey().isBefore(yearAgo))
                .mapToLong(Map.Entry::getValue).min().orElse(currentPrice);

        stock.setId(meta.id());
        stock.setName(meta.name());
        stock.setCategory(StockCategory.ENERGY);
        stock.setSubcategory(meta.subcategory());
        stock.setUnit(meta.unit());
        stock.setSource(DataSource.OPINET);
        stock.setExternalCode(meta.externalCode());
        stock.setCurrentPrice(currentPrice);
        stock.setPreviousPrice(previousPrice);
        stock.setYearHigh(yearHigh);
        stock.setYearLow(yearLow);
        stock.setChangeAmount(changeAmount);
        stock.setChangePercent(changePercent);
        stock.setVolume(1500L);
    }

    private List<PriceHistory> buildHistories(Stock stock, Map<LocalDate, Long> prices) {
        List<PriceHistory> list = new ArrayList<>();
        for (Map.Entry<LocalDate, Long> entry : prices.entrySet()) {
            long price = entry.getValue();
            // Opinet은 일별 단일 평균가 → 표시용 캔들 구성
            long high = Math.round(price * 1.005);
            long low = Math.max(1L, Math.round(price * 0.995));

            PriceHistory ph = new PriceHistory();
            ph.setStock(stock);
            ph.setDate(entry.getKey());
            ph.setOpenPrice(price);
            ph.setClosePrice(price);
            ph.setHighPrice(high);
            ph.setLowPrice(low);
            ph.setVolume(1500L);
            list.add(ph);
        }
        return list;
    }

    private void saveBatched(List<PriceHistory> histories) {
        for (int i = 0; i < histories.size(); i += BATCH_SIZE) {
            int end = Math.min(i + BATCH_SIZE, histories.size());
            batchSaver.saveAll(histories.subList(i, end));
        }
    }

    record EnergyStockMeta(String id, String name, String externalCode, String subcategory, String unit) {}
}
