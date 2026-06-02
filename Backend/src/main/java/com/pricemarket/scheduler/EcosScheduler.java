package com.pricemarket.scheduler;

import com.pricemarket.domain.price.PriceHistory;
import com.pricemarket.domain.price.PriceHistoryRepository;
import com.pricemarket.domain.stock.Stock;
import com.pricemarket.domain.stock.StockRepository;
import com.pricemarket.external.ecos.EcosClient;
import com.pricemarket.external.ecos.dto.EcosRowDto;
import com.pricemarket.seed.energy.PriceHistoryBatchSaver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class EcosScheduler {

    // MacroStockSeeder.MACRO_STOCKS와 정확히 동일한 값 — scaleFactor 불일치 시 데이터 왜곡됨
    private static final List<MacroStockSpec> MACRO_SPECS = List.of(
            new MacroStockSpec("cpi",       "901Y009", "0",       "M", 100),
            new MacroStockSpec("usd_krw",   "731Y001", "0000001", "D", 1),
            new MacroStockSpec("jpy_krw",   "731Y001", "0000002", "D", 1),
            new MacroStockSpec("base_rate", "722Y001", "0101000", "D", 100),
            new MacroStockSpec("ppi",       "404Y014", "*AA",     "M", 100)
    );

    // CpiTimeSeriesService와 공유 — 월별 데이터를 저장할 날짜(일)
    private static final int MONTHLY_DAY = 15;

    private final EcosClient ecosClient;
    private final StockRepository stockRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final PriceHistoryBatchSaver batchSaver;

    @Scheduled(cron = "0 30 1 * * *", zone = "Asia/Seoul")
    public void updateDailyPrices() {
        log.info("=== ECOS daily update started ===");
        long start = System.currentTimeMillis();

        int updatedStocks = 0;
        int addedHistories = 0;

        for (MacroStockSpec spec : MACRO_SPECS) {
            try {
                int added = updateMacroStock(spec);
                if (added > 0) {
                    addedHistories += added;
                    updatedStocks++;
                }
            } catch (Exception e) {
                log.warn("Failed to update ECOS stock {}: {}", spec.id(), e.getMessage());
            }
        }

        log.info("=== ECOS daily update completed: {} stocks updated, {} histories added ({}ms) ===",
                updatedStocks, addedHistories, System.currentTimeMillis() - start);
    }

    private int updateMacroStock(MacroStockSpec spec) {
        Optional<Stock> stockOpt = stockRepository.findById(spec.id());
        if (stockOpt.isEmpty()) return 0;
        Stock stock = stockOpt.get();

        LocalDate now = LocalDate.now();
        String startTime, endTime;
        if ("M".equals(spec.cycle())) {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMM");
            startTime = now.minusMonths(3).format(fmt);
            endTime = now.format(fmt);
        } else {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMMdd");
            startTime = now.minusDays(30).format(fmt);
            endTime = now.format(fmt);
        }

        List<EcosRowDto> rows = ecosClient.getStatistics(
                spec.statCode(), spec.cycle(), startTime, endTime, spec.itemCode(), 100);
        if (rows.isEmpty()) return 0;

        rows = rows.stream()
                .sorted(Comparator.comparing(r -> parseEcosDate(r.getTime(), spec.cycle())))
                .toList();

        List<PriceHistory> toSave = new ArrayList<>();
        for (EcosRowDto row : rows) {
            LocalDate date = parseEcosDate(row.getTime(), spec.cycle());
            long price = parsePrice(row.getDataValue(), spec.scaleFactor());
            if (price == 0) continue;
            if (priceHistoryRepository.existsByStockIdAndDate(spec.id(), date)) continue;

            PriceHistory ph = new PriceHistory();
            ph.setStock(stock);
            ph.setDate(date);
            ph.setOpenPrice(price);
            ph.setHighPrice(price);
            ph.setLowPrice(price);
            ph.setClosePrice(price);
            ph.setVolume(0L);
            toSave.add(ph);
        }

        if (!toSave.isEmpty()) {
            batchSaver.saveAll(toSave);
        }

        // Stock 최신가 갱신
        EcosRowDto latest = rows.get(rows.size() - 1);
        EcosRowDto previous = rows.size() >= 2 ? rows.get(rows.size() - 2) : latest;

        long currentPrice = parsePrice(latest.getDataValue(), spec.scaleFactor());
        long previousPrice = parsePrice(previous.getDataValue(), spec.scaleFactor());
        if (currentPrice == 0) return toSave.size();

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

    // MacroStockSeeder.parsePrice와 동일 (scaleFactor 불일치 방지를 위해 의도적으로 복제)
    private long parsePrice(String value, int scaleFactor) {
        if (value == null || value.isBlank()) return 0L;
        try {
            return new BigDecimal(value.trim())
                    .multiply(BigDecimal.valueOf(scaleFactor))
                    .setScale(0, RoundingMode.HALF_UP)
                    .longValue();
        } catch (NumberFormatException e) {
            return 0L;
        }
    }

    // MacroStockSeeder.parseEcosDate와 동일
    private LocalDate parseEcosDate(String time, String cycle) {
        if ("M".equals(cycle)) {
            int year = Integer.parseInt(time.substring(0, 4));
            int month = Integer.parseInt(time.substring(4, 6));
            return LocalDate.of(year, month, MONTHLY_DAY);
        }
        return LocalDate.parse(time, DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    record MacroStockSpec(String id, String statCode, String itemCode, String cycle, int scaleFactor) {}
}
