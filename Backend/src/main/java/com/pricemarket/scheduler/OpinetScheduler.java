package com.pricemarket.scheduler;

import com.pricemarket.domain.price.PriceHistory;
import com.pricemarket.domain.price.PriceHistoryRepository;
import com.pricemarket.domain.stock.Stock;
import com.pricemarket.domain.stock.StockRepository;
import com.pricemarket.external.opinet.OpinetClient;
import com.pricemarket.external.opinet.dto.OpinetHistoryOilDto;
import com.pricemarket.seed.energy.PriceHistoryBatchSaver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpinetScheduler {

    private static final Map<String, String> STOCK_TO_PRODCD = Map.of(
            "gasoline",        "B027",
            "premium_gasoline","B034",
            "diesel",          "D047",
            "kerosene",        "C004",
            "lpg",             "K015"
    );

    private final OpinetClient opinetClient;
    private final StockRepository stockRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final PriceHistoryBatchSaver batchSaver;

    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Seoul")
    public void updateDailyPrices() {
        log.info("=== Opinet daily update started ===");
        long start = System.currentTimeMillis();

        try {
            List<OpinetHistoryOilDto> recentData = opinetClient.getRecent7Days();
            if (recentData.isEmpty()) {
                log.warn("Opinet returned no data, skipping");
                return;
            }

            Map<String, List<OpinetHistoryOilDto>> byProdCd = recentData.stream()
                    .filter(d -> d.getTradeDate() != null)
                    .collect(Collectors.groupingBy(OpinetHistoryOilDto::getProdCd));

            int updatedStocks = 0;
            int addedHistories = 0;

            for (Map.Entry<String, String> entry : STOCK_TO_PRODCD.entrySet()) {
                String stockId = entry.getKey();
                String prodCd = entry.getValue();

                try {
                    Optional<Stock> stockOpt = stockRepository.findById(stockId);
                    if (stockOpt.isEmpty()) continue;

                    List<OpinetHistoryOilDto> dtos = byProdCd.get(prodCd);
                    if (dtos == null || dtos.isEmpty()) continue;

                    dtos = dtos.stream()
                            .sorted(Comparator.comparing(OpinetHistoryOilDto::getTradeDate))
                            .toList();

                    Stock stock = stockOpt.get();
                    List<PriceHistory> toSave = new ArrayList<>();

                    for (OpinetHistoryOilDto dto : dtos) {
                        LocalDate date = dto.getTradeDate();
                        if (priceHistoryRepository.existsByStockIdAndDate(stockId, date)) continue;

                        long price = dto.getPriceLong();
                        PriceHistory ph = new PriceHistory();
                        ph.setStock(stock);
                        ph.setDate(date);
                        ph.setOpenPrice(price);
                        ph.setHighPrice(Math.round(price * 1.005));
                        ph.setLowPrice(Math.round(price * 0.995));
                        ph.setClosePrice(price);
                        ph.setVolume(0L);
                        toSave.add(ph);
                    }

                    if (!toSave.isEmpty()) {
                        batchSaver.saveAll(toSave);
                        addedHistories += toSave.size();
                    }

                    // Stock 최신가 갱신
                    OpinetHistoryOilDto latest = dtos.get(dtos.size() - 1);
                    OpinetHistoryOilDto previous = dtos.size() >= 2 ? dtos.get(dtos.size() - 2) : latest;

                    long currentPrice = latest.getPriceLong();
                    long previousPrice = previous.getPriceLong();
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
                    updatedStocks++;
                } catch (Exception e) {
                    log.warn("Failed to update Opinet stock {}: {}", stockId, e.getMessage());
                }
            }

            log.info("=== Opinet daily update completed: {} stocks updated, {} histories added ({}ms) ===",
                    updatedStocks, addedHistories, System.currentTimeMillis() - start);
        } catch (Exception e) {
            log.error("Opinet daily update failed", e);
        }
    }
}
