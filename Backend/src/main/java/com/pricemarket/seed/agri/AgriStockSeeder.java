package com.pricemarket.seed.agri;

import com.pricemarket.domain.price.PriceHistory;
import com.pricemarket.domain.stock.DataSource;
import com.pricemarket.domain.stock.Stock;
import com.pricemarket.domain.stock.StockRepository;
import com.pricemarket.external.kamis.KamisClient;
import com.pricemarket.external.kamis.KamisProperties;
import com.pricemarket.external.kamis.dto.KamisItemDto;
import com.pricemarket.seed.energy.PriceHistoryBatchSaver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
@Order(4)
@RequiredArgsConstructor
@Slf4j
public class AgriStockSeeder implements CommandLineRunner {

    private static final String COUNTY_CODE = "1101";
    private static final int CALL_INTERVAL_MS = 500;
    private static final int BATCH_SIZE = 500;

    private final StockRepository stockRepository;
    private final PriceHistoryBatchSaver batchSaver;
    private final KamisClient kamisClient;
    private final KamisProperties kamisProperties;

    @Override
    public void run(String... args) {
        if (!kamisProperties.isConfigured()) {
            log.warn("KAMIS credentials not configured — skipping agri stock seeder");
            return;
        }

        log.info("Agri stock seeder started");

        int successCount = 0;
        int failCount = 0;

        for (AgriStockMeta meta : AgriStockCatalog.ITEMS) {
            try {
                Optional<Stock> existing = stockRepository.findById(meta.id());
                if (existing.isPresent() && DataSource.KAMIS == existing.get().getSource()) {
                    log.info("Stock {} already from KAMIS, skipping", meta.id());
                    continue;
                }

                // KAMIS 데이터를 먼저 가져온 후 성공 시에만 기존 데이터 교체
                boolean replaced = seedAgriStock(meta, existing.isPresent());
                if (replaced) successCount++;

                Thread.sleep(CALL_INTERVAL_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Agri seeder interrupted");
                break;
            } catch (Exception e) {
                log.warn("Failed to seed {}: {}", meta.id(), e.getMessage());
                failCount++;
            }
        }

        log.info("Agri stock seeder completed: {} success, {} failed", successCount, failCount);
    }

    // AgriStockSeederTest에서 직접 호출 가능하도록 package-private
    boolean seedAgriStockForTest(AgriStockMeta meta) {
        boolean hasExisting = stockRepository.existsById(meta.id());
        return seedAgriStock(meta, hasExisting);
    }

    /**
     * KAMIS 데이터를 먼저 가져온 후 성공 시에만 기존 데이터를 교체한다.
     * @return 저장 성공 여부
     */
    private boolean seedAgriStock(AgriStockMeta meta, boolean hasExisting) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusYears(5);

        // 1. KAMIS 데이터 먼저 수집
        List<KamisItemDto> items = kamisClient.getPeriodData(
                meta.categoryCode(), meta.itemCode(), meta.kindCode(), meta.rankCode(),
                startDate, endDate, COUNTY_CODE
        );

        List<KamisItemDto> validItems = filterAverageOnly(items).stream()
                .filter(i -> i.toPrice() > 0)
                .sorted(Comparator.comparing(KamisItemDto::toLocalDate))
                .toList();

        if (validItems.isEmpty()) {
            log.warn("No average data for {} — skipping", meta.id());
            return false;
        }
        if (validItems.size() < 30) {
            log.warn("Too few data points for {}: {} — skipping", meta.id(), validItems.size());
            return false;
        }

        // 2. 데이터 준비 완료 → 기존 데이터 교체 (삭제는 성공 확인 후)
        if (hasExisting) {
            batchSaver.deleteByStockId(meta.id());
            stockRepository.deleteById(meta.id());
            log.info("Removed existing data for {}, replacing with KAMIS data", meta.id());
        }

        // 3. Stock 엔티티 저장
        KamisItemDto latest = validItems.get(validItems.size() - 1);
        KamisItemDto previous = validItems.size() >= 2 ? validItems.get(validItems.size() - 2) : latest;

        long currentPrice = latest.toPrice();
        long previousPrice = previous.toPrice();
        long changeAmount = currentPrice - previousPrice;
        double changePercent = previousPrice == 0 ? 0.0
                : Math.round((double) changeAmount / previousPrice * 10000.0) / 100.0;

        LocalDate oneYearAgo = endDate.minusYears(1);
        List<Long> recentPrices = validItems.stream()
                .filter(i -> i.toLocalDate().isAfter(oneYearAgo))
                .map(KamisItemDto::toPrice)
                .toList();
        long yearHigh = recentPrices.stream().max(Long::compareTo).orElse(currentPrice);
        long yearLow = recentPrices.stream().min(Long::compareTo).orElse(currentPrice);

        Stock stock = new Stock();
        stock.setId(meta.id());
        stock.setName(meta.name());
        stock.setCategory(meta.category());
        stock.setSubcategory(deriveSubcategory(meta.categoryCode()));
        stock.setUnit(meta.displayUnit());
        stock.setCurrentPrice(currentPrice);
        stock.setPreviousPrice(previousPrice);
        stock.setChangeAmount(changeAmount);
        stock.setChangePercent(changePercent);
        stock.setYearHigh(yearHigh);
        stock.setYearLow(yearLow);
        stock.setVolume(0L);
        stock.setSource(DataSource.KAMIS);
        stock.setExternalCode(meta.itemCode());

        stockRepository.save(stock);

        // 4. PriceHistory 배치 저장
        List<PriceHistory> histories = new ArrayList<>();
        for (int i = 0; i < validItems.size(); i++) {
            KamisItemDto item = validItems.get(i);
            long closePrice = item.toPrice();
            long openPrice = i > 0 ? validItems.get(i - 1).toPrice() : closePrice;
            long highPrice = Math.round(Math.max(openPrice, closePrice) * 1.005);
            long lowPrice = Math.round(Math.min(openPrice, closePrice) * 0.995);

            PriceHistory ph = new PriceHistory();
            ph.setStock(stock);
            ph.setDate(item.toLocalDate());
            ph.setOpenPrice(openPrice);
            ph.setHighPrice(highPrice);
            ph.setLowPrice(lowPrice);
            ph.setClosePrice(closePrice);
            ph.setVolume(0L);
            histories.add(ph);
        }

        for (int i = 0; i < histories.size(); i += BATCH_SIZE) {
            batchSaver.saveAll(histories.subList(i, Math.min(i + BATCH_SIZE, histories.size())));
        }

        log.info("Seeded agri stock {} ({}) with {} price records (latest: {}원)",
                meta.id(), meta.name(), histories.size(), currentPrice);
        return true;
    }

    private List<KamisItemDto> filterAverageOnly(List<KamisItemDto> items) {
        return items.stream()
                .filter(i -> {
                    Object county = i.getCountyName();
                    if (county instanceof String s) return "평균".equals(s);
                    if (county instanceof Collection<?> c) return c.isEmpty();
                    return county == null;
                })
                .toList();
    }

    private String deriveSubcategory(String categoryCode) {
        return switch (categoryCode) {
            case "100" -> "식량작물";
            case "200" -> "채소류";
            case "400" -> "과일류";
            case "500" -> "축산물";
            default -> "기타";
        };
    }
}
