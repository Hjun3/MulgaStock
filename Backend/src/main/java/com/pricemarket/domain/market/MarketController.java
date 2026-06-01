package com.pricemarket.domain.market;

import com.pricemarket.common.ApiResponse;
import com.pricemarket.domain.stock.StockCategory;
import com.pricemarket.domain.stock.StockService;
import com.pricemarket.dto.market.MarketSummaryDto;
import com.pricemarket.dto.market.SectorDto;
import com.pricemarket.dto.stock.StockSummaryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Market", description = "시장/섹터 관련 API")
public class MarketController {

    private final MarketService marketService;
    private final StockService stockService;

    @GetMapping("/market/summary")
    @Operation(summary = "시장 전체 + 섹터별 요약")
    public ApiResponse<MarketSummaryDto> getMarketSummary() {
        return ApiResponse.success(marketService.getMarketSummary());
    }

    @GetMapping("/sectors/{category}")
    @Operation(summary = "특정 섹터 내 종목 리스트 + 통계")
    public ApiResponse<SectorWithStocksDto> getSector(@PathVariable String category) {
        StockCategory stockCategory = StockCategory.valueOf(category.toUpperCase());
        SectorDto sectorDto = marketService.getSectorDetail(stockCategory);
        List<StockSummaryDto> stocks = stockService.getStocksByCategory(stockCategory);
        return ApiResponse.success(new SectorWithStocksDto(sectorDto, stocks));
    }

    public record SectorWithStocksDto(SectorDto sector, List<StockSummaryDto> stocks) {}
}
