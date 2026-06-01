package com.pricemarket.domain.stock;

import com.pricemarket.common.ApiResponse;
import com.pricemarket.dto.stock.StockDetailDto;
import com.pricemarket.dto.stock.StockSummaryDto;
import com.pricemarket.dto.stock.TopMoverDto;
import com.pricemarket.domain.price.Period;
import com.pricemarket.domain.price.PriceHistoryService;
import com.pricemarket.dto.price.PriceHistoryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/stocks")
@RequiredArgsConstructor
@Tag(name = "Stock", description = "종목 관련 API")
public class StockController {

    private final StockService stockService;
    private final PriceHistoryService priceHistoryService;

    @GetMapping
    @Operation(summary = "전체 종목 리스트", description = "페이징, 필터, 정렬 지원")
    public ApiResponse<Page<StockSummaryDto>> getStocks(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "changePercent") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        StockCategory stockCategory = null;
        if (category != null && !category.isBlank()) {
            stockCategory = StockCategory.valueOf(category.toUpperCase());
        }

        return ApiResponse.success(stockService.getStocks(stockCategory, sortBy, direction, page, size));
    }

    @GetMapping("/top-movers")
    @Operation(summary = "상승/하락 상위 종목")
    public ApiResponse<List<TopMoverDto>> getTopMovers(
            @RequestParam(defaultValue = "gainers") String type,
            @RequestParam(defaultValue = "5") int limit) {
        return ApiResponse.success(stockService.getTopMovers(type, Math.min(limit, 20)));
    }

    @GetMapping("/search")
    @Operation(summary = "종목명 검색")
    public ApiResponse<List<StockSummaryDto>> searchStocks(
            @RequestParam String q,
            @RequestParam(defaultValue = "10") int limit) {
        return ApiResponse.success(stockService.searchStocks(q, Math.min(limit, 50)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "단일 종목 상세")
    public ApiResponse<StockDetailDto> getStock(@PathVariable String id) {
        return ApiResponse.success(stockService.getStockDetail(id));
    }

    @GetMapping("/{id}/history")
    @Operation(summary = "종목 가격 이력")
    public ApiResponse<List<PriceHistoryDto>> getHistory(
            @PathVariable String id,
            @RequestParam(defaultValue = "1M") String period) {
        Period p = Period.fromValue(period);
        return ApiResponse.success(priceHistoryService.getHistory(id, p));
    }
}
