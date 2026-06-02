package com.pricemarket.scheduler;

import com.pricemarket.domain.price.PriceHistory;
import com.pricemarket.domain.price.PriceHistoryRepository;
import com.pricemarket.domain.stock.DataSource;
import com.pricemarket.domain.stock.Stock;
import com.pricemarket.domain.stock.StockRepository;
import com.pricemarket.external.kamis.KamisClient;
import com.pricemarket.external.kamis.dto.KamisItemDto;
import com.pricemarket.seed.agri.AgriStockCatalog;
import com.pricemarket.seed.agri.AgriStockMeta;
import com.pricemarket.seed.energy.PriceHistoryBatchSaver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class KamisScheduler {

    private static final String COUNTY_CODE = "1101";
    private static final int CALL_INTERVAL_MS = 500;

    private final KamisClient kamisClient;
    private final StockRepository stockRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final PriceHistoryBatchSaver batchSaver;

    @Scheduled(cron = "0 0 2 * * *", zone = "Asia/Seoul")
    public void updateDailyPrices() {
        log.info("=== KAMIS daily update started ===");
        long start = System.currentTimeMillis();

        int updatedStocks = 0;
        int addedHistories = 0;

        for (AgriStockMeta meta : AgriStockCatalog.ITEMS) {
            Optional<Stock> stockOpt = stockRepository.findById(meta.id());
            if (stockOpt.isEmpty() || stockOpt.get().getSource() != DataSource.KAMIS) continue;

            try {
                int added = updateAgriStock(stockOpt.get(), meta);
                if (added > 0) {
                    addedHistories += added;
                    updatedStocks++;
                }
                Thread.sleep(CALL_INTERVAL_MS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("KAMIS scheduler interrupted");
                break;
            } catch (Exception e) {
                log.warn("Failed to update KAMIS stock {}: {}", meta.id(), e.getMessage());
            }
        }

        log.info("=== KAMIS daily update completed: {} stocks updated, {} histories added ({}ms) ===",
                updatedStocks, addedHistories, System.currentTimeMillis() - start);
    }

    // @Transactional 없음 — 쓰기는 batchSaver.saveAll()과 stockRepository.save()가 각자 보장
    private int updateAgriStock(Stock stock, AgriStockMeta meta) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusDays(30);

        List<KamisItemDto> items = kamisClient.getPeriodData(
                meta.categoryCode(), meta.itemCode(), meta.kindCode(), meta.rankCode(),
                startDate, endDate, COUNTY_CODE
        );

        List<KamisItemDto> averageItems = items.stream()
                .filter(i -> {
                    Object county = i.getCountyName();
                    if (county instanceof String s) return "평균".equals(s);
                    if (county instanceof Collection<?> c) return c.isEmpty();
                    return county == null;
                })
                .filter(i -> i.toPrice() > 0)
                .sorted(Comparator.comparing(KamisItemDto::toLocalDate))
                .toList();

        if (averageItems.isEmpty()) return 0;

        List<PriceHistory> toSave = new ArrayList<>();
        for (int i = 0; i < averageItems.size(); i++) {
            KamisItemDto item = averageItems.get(i);
            LocalDate date = item.toLocalDate();
            if (priceHistoryRepository.existsByStockIdAndDate(stock.getId(), date)) continue;

            long closePrice = item.toPrice();
            long openPrice = i > 0 ? averageItems.get(i - 1).toPrice() : closePrice;
            long highPrice = Math.round(Math.max(openPrice, closePrice) * 1.005);
            long lowPrice = Math.round(Math.min(openPrice, closePrice) * 0.995);

            PriceHistory ph = new PriceHistory();
            ph.setStock(stock);
            ph.setDate(date);
            ph.setOpenPrice(openPrice);
            ph.setHighPrice(highPrice);
            ph.setLowPrice(lowPrice);
            ph.setClosePrice(closePrice);
            ph.setVolume(0L);
            toSave.add(ph);
        }

        if (!toSave.isEmpty()) {
            batchSaver.saveAll(toSave);
        }

        // Stock 최신가 갱신
        KamisItemDto latest = averageItems.get(averageItems.size() - 1);
        KamisItemDto previous = averageItems.size() >= 2
                ? averageItems.get(averageItems.size() - 2) : latest;

        long currentPrice = latest.toPrice();
        long previousPrice = previous.toPrice();
        long changeAmount = currentPrice - previousPrice;
        double changePercent = previousPrice == 0 ? 0.0
                : Math.round((double) changeAmount / previousPrice * 10000.0) / 100.0;

        stock.setCurrentPrice(currentPrice);
        stock.setPreviousPrice(previousPrice);
        stock.setChangeAmount(changeAmount);
        stock.setChangePercent(changePercent);
        if (currentPrice > stock.getYearHigh()) stock.setYearHigh(currentPrice);
        if (currentPrice < stock.getYearLow()) stock.setYearLow(currentPrice);

        stockRepository.save(stock);
        return toSave.size();
    }
}
