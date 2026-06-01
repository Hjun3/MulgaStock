package com.pricemarket.domain.price;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CpiTimeSeriesService {

    // MacroStockSeeder와 반드시 일치해야 함 — 월별 CPI를 이 날짜(15일)로 저장하고 조회함.
    public static final int CPI_DAY_OF_MONTH = 15;

    private final PriceHistoryRepository priceHistoryRepository;

    /**
     * 특정 연월의 CPI 값 조회.
     * CPI는 ×100 스케일로 저장됨 (예: 115.71 → 11571).
     */
    public Optional<BigDecimal> getCpiAt(YearMonth yearMonth) {
        LocalDate date = yearMonth.atDay(CPI_DAY_OF_MONTH);
        Optional<PriceHistory> ph = priceHistoryRepository.findByStockIdAndDate("cpi", date);
        if (ph.isEmpty()) {
            log.warn("CPI data not found for {}", yearMonth);
        }
        return ph.map(p -> BigDecimal.valueOf(p.getClosePrice()));
    }

    /**
     * from → to 구간의 CPI 상승 비율.
     * 예: 2021-01 CPI=10850, 2025-01 CPI=11571 → ratio = 1.0665...
     * 데이터 없으면 1.0 반환 (보정 없음).
     */
    public BigDecimal getCpiRatio(YearMonth from, YearMonth to) {
        BigDecimal fromCpi = getCpiAt(from).orElse(BigDecimal.ZERO);
        BigDecimal toCpi = getCpiAt(to).orElse(BigDecimal.ZERO);

        if (fromCpi.signum() == 0) {
            log.warn("CPI from-value is zero for {}, returning ratio=1.0", from);
            return BigDecimal.ONE;
        }
        return toCpi.divide(fromCpi, 6, RoundingMode.HALF_UP);
    }
}
