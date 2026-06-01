package com.pricemarket.seed.energy;

import com.pricemarket.domain.price.PriceHistoryRepository;
import com.pricemarket.domain.stock.DataSource;
import com.pricemarket.domain.stock.Stock;
import com.pricemarket.domain.stock.StockRepository;
import com.pricemarket.external.opinet.OpinetClient;
import com.pricemarket.external.opinet.OpinetProperties;
import com.pricemarket.external.opinet.dto.OpinetHistoryOilDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class EnergyStockSeederTest {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @MockBean
    private OpinetClient opinetClient;

    @Autowired
    private OpinetProperties opinetProperties;

    @Autowired
    private EnergyStockSeeder seeder;

    @BeforeEach
    void cleanUp() {
        // 각 테스트 전에 Opinet 데이터만 제거
        List<Stock> opinetStocks = stockRepository.findBySource(DataSource.OPINET);
        for (Stock s : opinetStocks) {
            priceHistoryRepository.deleteByStockId(s.getId());
        }
        stockRepository.deleteAll(opinetStocks);
    }

    @Test
    void run_skipsSeeding_whenApiKeyNotConfigured() throws Exception {
        opinetProperties.setApiKey("");

        seeder.run();

        verify(opinetClient, never()).getHistoryFor7Days(any());
        assertThat(stockRepository.findBySource(DataSource.OPINET)).isEmpty();
    }

    @Test
    void run_skipsSeeding_whenOpinetStocksAlreadyExist() throws Exception {
        opinetProperties.setApiKey("test-key");

        // 미리 하나 저장
        Stock existing = new Stock();
        existing.setId("gasoline");
        existing.setName("휘발유");
        existing.setSource(DataSource.OPINET);
        existing.setExternalCode("B027");
        existing.setCategory(com.pricemarket.domain.stock.StockCategory.ENERGY);
        existing.setSubcategory("연료");
        existing.setUnit("1L");
        existing.setCurrentPrice(2000L);
        existing.setPreviousPrice(1990L);
        existing.setYearHigh(2100L);
        existing.setYearLow(1800L);
        existing.setChangeAmount(10L);
        existing.setChangePercent(0.5);
        existing.setVolume(1500L);
        stockRepository.save(existing);

        seeder.run();

        verify(opinetClient, never()).getHistoryFor7Days(any());
    }

    @Test
    void run_gracefullyHandles_emptyApiResponse() throws Exception {
        opinetProperties.setApiKey("test-key");
        when(opinetClient.getHistoryFor7Days(any())).thenReturn(Collections.emptyList());

        seeder.run();

        // 빈 응답이어도 예외 없이 종료
        assertThat(stockRepository.findBySource(DataSource.OPINET)).isEmpty();
    }

    @Test
    void run_gracefullyHandles_apiException() throws Exception {
        opinetProperties.setApiKey("test-key");
        when(opinetClient.getHistoryFor7Days(any()))
                .thenThrow(new com.pricemarket.external.opinet.exception.OpinetApiException("timeout"));

        // 전체 seeder가 예외를 삼키고 정상 종료해야 함
        seeder.run();

        assertThat(stockRepository.findBySource(DataSource.OPINET)).isEmpty();
    }

    @Test
    void buildHistories_createsCandleWithHighLow() throws Exception {
        opinetProperties.setApiKey("test-key");

        // B027(휘발유) 단 두 날짜의 데이터만 반환
        OpinetHistoryOilDto day1 = mockOilDto("B027", "20260530", "2000.00");
        OpinetHistoryOilDto day2 = mockOilDto("B027", "20260531", "2010.00");

        when(opinetClient.getHistoryFor7Days(any()))
                .thenReturn(List.of(day1, day2))
                .thenReturn(Collections.emptyList());

        seeder.run();

        List<Stock> opinetStocks = stockRepository.findBySource(DataSource.OPINET);
        Stock gasoline = opinetStocks.stream()
                .filter(s -> "gasoline".equals(s.getId()))
                .findFirst().orElse(null);

        assertThat(gasoline).isNotNull();
        assertThat(gasoline.getSource()).isEqualTo(DataSource.OPINET);
        assertThat(gasoline.getExternalCode()).isEqualTo("B027");

        var histories = priceHistoryRepository.findByStockIdOrderByDateAsc("gasoline");
        assertThat(histories).isNotEmpty();
        var first = histories.get(0);
        // high = price * 1.005, low = price * 0.995
        assertThat(first.getHighPrice()).isGreaterThan(first.getClosePrice());
        assertThat(first.getLowPrice()).isLessThan(first.getClosePrice());
    }

    private OpinetHistoryOilDto mockOilDto(String prodCd, String date, String price) {
        OpinetHistoryOilDto dto = mock(OpinetHistoryOilDto.class);
        when(dto.getProdCd()).thenReturn(prodCd);
        when(dto.getTradeDate()).thenReturn(java.time.LocalDate.parse(date, java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")));
        when(dto.getPriceLong()).thenReturn(Math.round(new java.math.BigDecimal(price).doubleValue()));
        return dto;
    }
}
