package com.pricemarket.domain.stock;

import com.pricemarket.domain.price.Period;
import com.pricemarket.domain.price.PriceHistoryService;
import com.pricemarket.dto.price.PriceHistoryDto;
import com.pricemarket.dto.stock.StockDetailDto;
import com.pricemarket.dto.stock.StockSummaryDto;
import com.pricemarket.dto.stock.TopMoverDto;
import com.pricemarket.exception.GlobalExceptionHandler;
import com.pricemarket.exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(StockController.class)
@Import(GlobalExceptionHandler.class)
class StockControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StockService stockService;

    @MockBean
    private PriceHistoryService priceHistoryService;

    @Test
    void getStocks_returnsPage() throws Exception {
        StockSummaryDto dto = new StockSummaryDto("egg", "달걀", "식품", "축산물", "30구", 5800L, 5165L, 635L, 12.3, 5800L, 4200L, 1240L);
        when(stockService.getStocks(any(), any(), any(), anyInt(), anyInt()))
                .thenReturn(new PageImpl<>(List.of(dto), PageRequest.of(0, 20), 1));

        mockMvc.perform(get("/api/v1/stocks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].id").value("egg"));
    }

    @Test
    void getStockDetail_returnsDetail() throws Exception {
        StockDetailDto dto = new StockDetailDto("egg", "달걀", "식품", "축산물", "30구", 5800L, 5165L, 635L, 12.3, 5800L, 4200L, 1240L, 4500.0, 2.3);
        when(stockService.getStockDetail("egg")).thenReturn(dto);

        mockMvc.perform(get("/api/v1/stocks/egg"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value("egg"))
                .andExpect(jsonPath("$.data.name").value("달걀"));
    }

    @Test
    void getStockDetail_notFound_returns404() throws Exception {
        when(stockService.getStockDetail("unknown"))
                .thenThrow(new NotFoundException("종목을 찾을 수 없습니다."));

        mockMvc.perform(get("/api/v1/stocks/unknown"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void getTopMovers_returnsGainers() throws Exception {
        TopMoverDto dto = new TopMoverDto("egg", "달걀", "식품", 5800L, 12.3, 635L, "30구");
        when(stockService.getTopMovers(eq("gainers"), anyInt())).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/stocks/top-movers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].id").value("egg"));
    }

    @Test
    void getHistory_returnsPriceHistory() throws Exception {
        PriceHistoryDto dto = new PriceHistoryDto(LocalDate.now(), 5100L, 5290L, 5050L, 5180L, 1200L);
        when(priceHistoryService.getHistory(eq("egg"), eq(Period.ONE_MONTH))).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/stocks/egg/history?period=1M"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].close").value(5180));
    }

    @Test
    void searchStocks_returnsResults() throws Exception {
        StockSummaryDto dto = new StockSummaryDto("egg", "달걀", "식품", "축산물", "30구", 5800L, 5165L, 635L, 12.3, 5800L, 4200L, 1240L);
        when(stockService.searchStocks(eq("달걀"), anyInt())).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/stocks/search?q=달걀"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].name").value("달걀"));
    }
}
