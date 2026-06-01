package com.pricemarket.domain.stock;

import com.pricemarket.dto.stock.StockDetailDto;
import com.pricemarket.dto.stock.TopMoverDto;
import com.pricemarket.exception.NotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StockServiceTest {

    @Mock
    private StockRepository stockRepository;

    @InjectMocks
    private StockService stockService;

    private Stock egg;

    @BeforeEach
    void setUp() {
        egg = new Stock();
        egg.setId("egg");
        egg.setName("달걀");
        egg.setCategory(StockCategory.FOOD);
        egg.setSubcategory("축산물");
        egg.setUnit("30구");
        egg.setCurrentPrice(5800L);
        egg.setPreviousPrice(5165L);
        egg.setChangeAmount(635L);
        egg.setChangePercent(12.3);
        egg.setYearHigh(5800L);
        egg.setYearLow(4200L);
        egg.setVolume(1240L);
    }

    @Test
    void getStockDetail_returnsCorrectDto() {
        when(stockRepository.findById("egg")).thenReturn(Optional.of(egg));
        when(stockRepository.findAveragePriceByCategory(StockCategory.FOOD)).thenReturn(4500.0);
        when(stockRepository.findAverageChangePercentByCategory(StockCategory.FOOD)).thenReturn(2.3);

        StockDetailDto result = stockService.getStockDetail("egg");

        assertThat(result.id()).isEqualTo("egg");
        assertThat(result.name()).isEqualTo("달걀");
        assertThat(result.categoryAveragePrice()).isEqualTo(4500.0);
    }

    @Test
    void getStockDetail_notFound_throwsException() {
        when(stockRepository.findById("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> stockService.getStockDetail("unknown"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getTopMovers_gainers_returnsTopList() {
        when(stockRepository.findTopGainers(5)).thenReturn(List.of(egg));

        List<TopMoverDto> result = stockService.getTopMovers("gainers", 5);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).changePercent()).isEqualTo(12.3);
    }

    @Test
    void getTopMovers_losers_returnsBottomList() {
        Stock low = new Stock();
        low.setId("cucumber");
        low.setName("오이");
        low.setCategory(StockCategory.FOOD);
        low.setCurrentPrice(1800L);
        low.setPreviousPrice(2200L);
        low.setChangeAmount(-400L);
        low.setChangePercent(-18.2);
        low.setYearHigh(2500L);
        low.setYearLow(1800L);
        low.setVolume(900L);

        when(stockRepository.findTopLosers(5)).thenReturn(List.of(low));

        List<TopMoverDto> result = stockService.getTopMovers("losers", 5);

        assertThat(result.get(0).changePercent()).isNegative();
    }

    @Test
    void getStocks_noCategory_returnsAll() {
        when(stockRepository.findAll(any(Pageable.class))).thenReturn(new PageImpl<>(List.of(egg)));

        var result = stockService.getStocks(null, "changePercent", "desc", 0, 20);

        assertThat(result.getContent()).hasSize(1);
    }
}
