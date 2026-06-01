package com.pricemarket.domain.price;

import com.pricemarket.dto.price.PriceHistoryDto;
import com.pricemarket.exception.NotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PriceHistoryServiceTest {

    @Mock
    private PriceHistoryRepository priceHistoryRepository;

    @InjectMocks
    private PriceHistoryService priceHistoryService;

    @Test
    void getHistory_stockNotFound_throwsException() {
        when(priceHistoryRepository.existsByStockId("unknown")).thenReturn(false);

        assertThatThrownBy(() -> priceHistoryService.getHistory("unknown", Period.ONE_MONTH))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void getHistory_oneMonth_returnsFilteredList() {
        when(priceHistoryRepository.existsByStockId("egg")).thenReturn(true);

        com.pricemarket.domain.stock.Stock stock = new com.pricemarket.domain.stock.Stock();
        stock.setId("egg");

        PriceHistory ph = new PriceHistory();
        ph.setStock(stock);
        ph.setDate(LocalDate.now().minusDays(10));
        ph.setOpenPrice(5100L);
        ph.setHighPrice(5290L);
        ph.setLowPrice(5050L);
        ph.setClosePrice(5180L);
        ph.setVolume(1200L);

        when(priceHistoryRepository.findByStockIdAndDateBetweenOrderByDateAsc(
                eq("egg"), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(List.of(ph));

        List<PriceHistoryDto> result = priceHistoryService.getHistory("egg", Period.ONE_MONTH);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).close()).isEqualTo(5180L);
    }

    @Test
    void getHistory_allPeriod_returnsAllRecords() {
        when(priceHistoryRepository.existsByStockId("egg")).thenReturn(true);
        when(priceHistoryRepository.findByStockIdOrderByDateAsc("egg")).thenReturn(List.of());

        List<PriceHistoryDto> result = priceHistoryService.getHistory("egg", Period.ALL);

        assertThat(result).isEmpty();
    }
}
