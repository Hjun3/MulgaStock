package com.pricemarket.seed.macro;

import com.pricemarket.domain.price.CpiTimeSeriesService;
import com.pricemarket.domain.price.PriceHistory;
import com.pricemarket.domain.price.PriceHistoryRepository;
import com.pricemarket.domain.stock.DataSource;
import com.pricemarket.domain.stock.Stock;
import com.pricemarket.domain.stock.StockCategory;
import com.pricemarket.domain.stock.StockRepository;
import com.pricemarket.external.ecos.EcosClient;
import com.pricemarket.external.ecos.EcosProperties;
import com.pricemarket.external.ecos.dto.EcosRowDto;
import com.pricemarket.seed.energy.PriceHistoryBatchSaver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
@Order(3)
@RequiredArgsConstructor
@Slf4j
public class MacroStockSeeder implements CommandLineRunner {

    // CpiTimeSeriesService와 공유 — 월별 데이터를 저장할 날짜(일)
    private static final int MONTHLY_DAY = CpiTimeSeriesService.CPI_DAY_OF_MONTH;
    private static final int BATCH_SIZE = 500;

    // scaleFactor: 실제값 × scaleFactor 로 Long 저장
    //  - 지수(CPI/PPI): ×100 → 115.71 → 11571 (0.01 단위 보존, Step 3-3 CPI 합성 정밀도)
    //  - 환율: ×1 → 1398 (원 단위, 소수 손실 미미)
    //  - 기준금리: ×100 → 275 (bp 단위, 0.25% 스텝 구분 가능)
    private static final List<MacroStockMeta> MACRO_STOCKS = List.of(
        new MacroStockMeta("cpi",       "소비자물가지수", "901Y009", "0",       "지수",     "M", 100),
        new MacroStockMeta("usd_krw",   "원/달러 환율",  "731Y001", "0000001", "원",       "D", 1),
        new MacroStockMeta("jpy_krw",   "원/100엔 환율", "731Y001", "0000002", "원/100엔", "D", 1),
        new MacroStockMeta("base_rate", "기준금리",      "722Y001", "0101000", "bp",       "D", 100),
        new MacroStockMeta("ppi",       "생산자물가지수","404Y014", "*AA",     "지수",     "M", 100)
    );

    private final StockRepository stockRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final PriceHistoryBatchSaver batchSaver;
    private final EcosClient ecosClient;
    private final EcosProperties ecosProperties;

    @Override
    public void run(String... args) {
        if (!ecosProperties.isConfigured()) {
            log.warn("ECOS_API_KEY is not set — skipping macro stock seeder");
            return;
        }

        log.info("Macro stock seeder started");

        for (MacroStockMeta meta : MACRO_STOCKS) {
            try {
                // 종목과 이력 모두 존재하면 skip
                if (stockRepository.existsById(meta.id()) && priceHistoryRepository.existsByStockId(meta.id())) {
                    log.info("Macro stock {} already seeded, skipping", meta.id());
                    continue;
                }
                seedMacroStock(meta);
            } catch (Exception e) {
                log.warn("Failed to seed macro stock {}: {}", meta.id(), e.getMessage());
            }
        }

        log.info("Macro stock seeder completed");
    }

    private void seedMacroStock(MacroStockMeta meta) {
        LocalDate now = LocalDate.now();
        String startTime, endTime;

        if ("M".equals(meta.cycle())) {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMM");
            startTime = now.minusYears(5).format(fmt);
            endTime = now.format(fmt);
        } else {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyyMMdd");
            startTime = now.minusYears(5).format(fmt);
            endTime = now.format(fmt);
        }

        List<EcosRowDto> rows = ecosClient.getStatistics(
                meta.statCode(), meta.cycle(), startTime, endTime, meta.itemCode(), 10000);

        if (rows.isEmpty()) {
            log.warn("No data returned from ECOS for {}", meta.id());
            return;
        }

        // 가장 최근 두 행으로 현재가/전일가 계산
        EcosRowDto latest = rows.get(rows.size() - 1);
        EcosRowDto previous = rows.size() >= 2 ? rows.get(rows.size() - 2) : latest;

        long currentPrice = parsePrice(latest.getDataValue(), meta.scaleFactor());
        long previousPrice = parsePrice(previous.getDataValue(), meta.scaleFactor());
        long changeAmount = currentPrice - previousPrice;
        double changePercent = previousPrice == 0 ? 0.0
                : Math.round((double) changeAmount / previousPrice * 10000.0) / 100.0;

        // yearHigh/Low: 최근 1년 데이터에서 산출
        LocalDate yearAgo = now.minusYears(1);
        long yearHigh = currentPrice;
        long yearLow = currentPrice;
        for (EcosRowDto row : rows) {
            LocalDate rowDate = parseEcosDate(row.getTime(), meta.cycle());
            if (!rowDate.isBefore(yearAgo)) {
                long p = parsePrice(row.getDataValue(), meta.scaleFactor());
                if (p > yearHigh) yearHigh = p;
                if (p < yearLow) yearLow = p;
            }
        }

        Stock stock = stockRepository.findById(meta.id()).orElseGet(Stock::new);
        stock.setId(meta.id());
        stock.setName(meta.name());
        stock.setCategory(StockCategory.MACRO);
        stock.setSubcategory("거시지표");
        stock.setUnit(meta.unit());
        stock.setSource(DataSource.ECOS);
        stock.setExternalCode(meta.statCode());
        stock.setCurrentPrice(currentPrice);
        stock.setPreviousPrice(previousPrice);
        stock.setChangeAmount(changeAmount);
        stock.setChangePercent(changePercent);
        stock.setYearHigh(yearHigh);
        stock.setYearLow(yearLow);
        stock.setVolume(0L);
        stockRepository.save(stock);

        // 기존 이력 삭제 후 전체 재저장 (idempotent)
        batchSaver.deleteByStockId(meta.id());

        List<PriceHistory> histories = new ArrayList<>();
        for (EcosRowDto row : rows) {
            long price = parsePrice(row.getDataValue(), meta.scaleFactor());
            if (price == 0) continue;

            PriceHistory ph = new PriceHistory();
            ph.setStock(stock);
            ph.setDate(parseEcosDate(row.getTime(), meta.cycle()));
            ph.setOpenPrice(price);
            ph.setHighPrice(price);
            ph.setLowPrice(price);
            ph.setClosePrice(price);
            ph.setVolume(0L);
            histories.add(ph);
        }

        for (int i = 0; i < histories.size(); i += BATCH_SIZE) {
            batchSaver.saveAll(histories.subList(i, Math.min(i + BATCH_SIZE, histories.size())));
        }

        log.info("Seeded macro stock {} with {} price records", meta.id(), histories.size());
    }

    /**
     * DATA_VALUE 파싱: BigDecimal × scaleFactor → Long.
     * - 지수/금리 (scaleFactor=100): 115.71 → 11571, 2.75 → 275
     * - 환율 (scaleFactor=1): 1398.0 → 1398
     */
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

    /**
     * ECOS TIME → LocalDate.
     * - 월별 ("202501"): 해당 월 15일 (CpiTimeSeriesService.CPI_DAY_OF_MONTH와 동일)
     * - 일별 ("20250520"): 그대로 파싱
     */
    private LocalDate parseEcosDate(String time, String cycle) {
        if ("M".equals(cycle)) {
            int year = Integer.parseInt(time.substring(0, 4));
            int month = Integer.parseInt(time.substring(4, 6));
            return LocalDate.of(year, month, MONTHLY_DAY);
        }
        return LocalDate.parse(time, DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    record MacroStockMeta(
            String id, String name, String statCode, String itemCode,
            String unit, String cycle, int scaleFactor) {}
}
