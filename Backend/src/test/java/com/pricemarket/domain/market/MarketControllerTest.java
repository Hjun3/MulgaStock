package com.pricemarket.domain.market;

import com.pricemarket.domain.stock.StockService;
import com.pricemarket.dto.market.MarketSummaryDto;
import com.pricemarket.dto.market.SectorDto;
import com.pricemarket.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MarketController.class)
@Import(GlobalExceptionHandler.class)
class MarketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MarketService marketService;

    @MockBean
    private StockService stockService;

    @Test
    void getMarketSummary_returnsCorrectStructure() throws Exception {
        SectorDto.TopGainerInfo topGainer = new SectorDto.TopGainerInfo("egg", "달걀", 12.3);
        SectorDto sector = new SectorDto("FOOD", "식품", 2.3, 18, topGainer);
        MarketSummaryDto summary = new MarketSummaryDto(0.8, 30, 18L, 10L, 2L, LocalDateTime.now(), List.of(sector));

        when(marketService.getMarketSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/v1/market/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalStocks").value(30))
                .andExpect(jsonPath("$.data.sectors[0].category").value("FOOD"))
                .andExpect(jsonPath("$.data.sectors[0].topGainer.name").value("달걀"));
    }
}
