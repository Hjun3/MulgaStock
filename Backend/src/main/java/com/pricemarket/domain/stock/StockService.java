package com.pricemarket.domain.stock;

import com.pricemarket.dto.stock.StockDetailDto;
import com.pricemarket.dto.stock.StockSummaryDto;
import com.pricemarket.dto.stock.TopMoverDto;
import com.pricemarket.exception.ErrorCode;
import com.pricemarket.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockService {

    private final StockRepository stockRepository;

    public Page<StockSummaryDto> getStocks(StockCategory category, String sortBy, String direction, int page, int size) {
        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortField = resolveSortField(sortBy);
        PageRequest pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortField));

        Page<Stock> stocks = (category != null)
                ? stockRepository.findByCategory(category, pageable)
                : stockRepository.findAll(pageable);

        return stocks.map(StockSummaryDto::from);
    }

    public List<TopMoverDto> getTopMovers(String type, int limit) {
        List<Stock> stocks = "losers".equalsIgnoreCase(type)
                ? stockRepository.findTopLosers(limit)
                : stockRepository.findTopGainers(limit);
        return stocks.stream().map(TopMoverDto::from).toList();
    }

    public StockDetailDto getStockDetail(String id) {
        Stock stock = stockRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(ErrorCode.STOCK_NOT_FOUND));

        Double categoryAvgPrice = stockRepository.findAveragePriceByCategory(stock.getCategory());
        Double categoryAvgChangePercent = stockRepository.findAverageChangePercentByCategory(stock.getCategory());

        return StockDetailDto.from(stock,
                categoryAvgPrice != null ? Math.round(categoryAvgPrice * 10.0) / 10.0 : 0.0,
                categoryAvgChangePercent != null ? Math.round(categoryAvgChangePercent * 100.0) / 100.0 : 0.0);
    }

    public List<StockSummaryDto> searchStocks(String q, int limit) {
        PageRequest pageable = PageRequest.of(0, limit);
        return stockRepository.findByNameContainingIgnoreCase(q, pageable)
                .stream()
                .map(StockSummaryDto::from)
                .toList();
    }

    public List<StockSummaryDto> getStocksByCategory(StockCategory category) {
        return stockRepository.findByCategory(category)
                .stream()
                .map(StockSummaryDto::from)
                .toList();
    }

    private String resolveSortField(String sortBy) {
        return switch (sortBy == null ? "" : sortBy.toLowerCase()) {
            case "name" -> "name";
            case "price" -> "currentPrice";
            default -> "changePercent";
        };
    }
}
