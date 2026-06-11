package com.pricemarket.domain.market;

import com.pricemarket.domain.stock.DataSource;
import com.pricemarket.domain.stock.Stock;
import com.pricemarket.domain.stock.StockCategory;
import com.pricemarket.domain.stock.StockRepository;
import com.pricemarket.dto.market.MarketSummaryDto;
import com.pricemarket.dto.market.SectorDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MarketService {

    private final StockRepository stockRepository;

    public MarketSummaryDto getMarketSummary() {
        List<Stock> allStocks = stockRepository.findBySourceNot(DataSource.SEED);

        long gainers = allStocks.stream().filter(s -> s.getChangePercent() > 0).count();
        long losers = allStocks.stream().filter(s -> s.getChangePercent() < 0).count();
        long flat = allStocks.stream().filter(s -> s.getChangePercent() == 0).count();

        Double totalAvg = stockRepository.findOverallAverageChangePercent(DataSource.SEED);
        double totalChangePercent = totalAvg != null ? Math.round(totalAvg * 100.0) / 100.0 : 0.0;

        Map<StockCategory, List<Stock>> byCategory = allStocks.stream()
                .collect(Collectors.groupingBy(Stock::getCategory));

        List<SectorDto> sectors = Arrays.stream(StockCategory.values())
                .map(cat -> buildSectorDto(cat, byCategory.getOrDefault(cat, List.of())))
                .toList();

        return new MarketSummaryDto(
                totalChangePercent,
                allStocks.size(),
                gainers,
                losers,
                flat,
                LocalDateTime.now(),
                sectors
        );
    }

    public SectorDto getSectorDetail(StockCategory category) {
        List<Stock> stocks = stockRepository.findByCategoryAndSourceNot(category, DataSource.SEED);
        return buildSectorDto(category, stocks);
    }

    private SectorDto buildSectorDto(StockCategory category, List<Stock> stocks) {
        double avgChange = stocks.stream()
                .mapToDouble(Stock::getChangePercent)
                .average()
                .orElse(0.0);

        Stock topGainer = stocks.stream()
                .max(Comparator.comparingDouble(Stock::getChangePercent))
                .orElse(null);

        SectorDto.TopGainerInfo topGainerInfo = topGainer != null
                ? new SectorDto.TopGainerInfo(topGainer.getId(), topGainer.getName(), topGainer.getChangePercent())
                : null;

        return new SectorDto(
                category.name(),
                category.getDisplayName(),
                Math.round(avgChange * 100.0) / 100.0,
                stocks.size(),
                topGainerInfo
        );
    }
}
