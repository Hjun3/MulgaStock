package com.pricemarket.seed.agri;

import com.pricemarket.domain.price.PriceHistoryRepository;
import com.pricemarket.domain.stock.DataSource;
import com.pricemarket.domain.stock.Stock;
import com.pricemarket.domain.stock.StockCategory;
import com.pricemarket.domain.stock.StockRepository;
import com.pricemarket.external.kamis.KamisClient;
import com.pricemarket.external.kamis.KamisProperties;
import com.pricemarket.external.kamis.dto.KamisItemDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class AgriStockSeederTest {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @MockBean
    private KamisClient kamisClient;

    @Autowired
    private KamisProperties kamisProperties;

    @Autowired
    private AgriStockSeeder agriStockSeeder;

    @BeforeEach
    void setUp() {
        kamisProperties.setCertKey("test-key");
        kamisProperties.setCertId("test-id");
        // KAMIS 데이터 정리
        List<Stock> kamisStocks = stockRepository.findBySource(DataSource.KAMIS);
        for (Stock s : kamisStocks) {
            priceHistoryRepository.deleteByStockId(s.getId());
        }
        stockRepository.deleteAll(kamisStocks);
    }

    @Test
    void run_skipsSeeding_whenKamisNotConfigured() throws Exception {
        kamisProperties.setCertKey("");

        agriStockSeeder.run();

        verify(kamisClient, never()).getPeriodData(anyString(), anyString(), anyString(), anyString(), any(), any(), anyString());
        assertThat(stockRepository.findBySource(DataSource.KAMIS)).isEmpty();
    }

    @Test
    void run_skipsStock_whenAlreadyFromKamis() throws Exception {
        Stock existing = buildMinimalKamisStock("onion");
        stockRepository.save(existing);

        agriStockSeeder.run();

        // 이미 KAMIS 데이터인 경우 KamisClient 호출 없이 skip
        verify(kamisClient, never()).getPeriodData(
                anyString(), org.mockito.ArgumentMatchers.eq("245"),
                anyString(), anyString(), any(), any(), anyString());
    }

    @Test
    void seedAgriStockInNewTransaction_replacesSeedDataWithKamisData() {
        // 기존 시드 데이터 저장
        Stock seedStock = new Stock();
        seedStock.setId("napa");
        seedStock.setName("배추");
        seedStock.setCategory(StockCategory.FOOD);
        seedStock.setSubcategory("채소류");
        seedStock.setUnit("1포기");
        seedStock.setSource(DataSource.SEED);
        seedStock.setCurrentPrice(3000L);
        seedStock.setPreviousPrice(3100L);
        seedStock.setYearHigh(5000L);
        seedStock.setYearLow(2000L);
        seedStock.setChangeAmount(-100L);
        seedStock.setChangePercent(-3.2);
        seedStock.setVolume(0L);
        stockRepository.save(seedStock);

        // KAMIS 응답 모킹 (40일치 평균 데이터)
        when(kamisClient.getPeriodData(anyString(), anyString(), anyString(), anyString(), any(), any(), anyString()))
                .thenReturn(buildFakeDailyItems(40, 3500L));

        AgriStockMeta napaMeta = AgriStockCatalog.ITEMS.stream()
                .filter(m -> "napa".equals(m.id()))
                .findFirst().orElseThrow();

        agriStockSeeder.seedAgriStockForTest(napaMeta);

        Stock saved = stockRepository.findById("napa").orElseThrow();
        assertThat(saved.getSource()).isEqualTo(DataSource.KAMIS);
        assertThat(saved.getCurrentPrice()).isEqualTo(3500L);
        assertThat(saved.getSubcategory()).isEqualTo("채소류");

        long historyCount = priceHistoryRepository.countByStockId("napa");
        assertThat(historyCount).isEqualTo(40L);
    }

    @Test
    void seedAgriStockInNewTransaction_skipsWhenTooFewDataPoints() {
        when(kamisClient.getPeriodData(anyString(), anyString(), anyString(), anyString(), any(), any(), anyString()))
                .thenReturn(buildFakeDailyItems(10, 1500L));

        AgriStockMeta onionMeta = AgriStockCatalog.ITEMS.stream()
                .filter(m -> "onion".equals(m.id()))
                .findFirst().orElseThrow();

        agriStockSeeder.seedAgriStockForTest(onionMeta);

        assertThat(stockRepository.findById("onion")).isEmpty();
    }

    @Test
    void run_continuesAfterOneItemFails() throws Exception {
        // 모든 항목 실패
        when(kamisClient.getPeriodData(anyString(), anyString(), anyString(), anyString(), any(), any(), anyString()))
                .thenThrow(new com.pricemarket.external.kamis.exception.KamisApiException("network error"));

        // 예외 없이 정상 종료 확인
        agriStockSeeder.run();

        assertThat(stockRepository.findBySource(DataSource.KAMIS)).isEmpty();
    }

    // ---- helpers ----

    private Stock buildMinimalKamisStock(String id) {
        Stock s = new Stock();
        s.setId(id);
        s.setName(id);
        s.setCategory(StockCategory.FOOD);
        s.setSubcategory("채소류");
        s.setUnit("1kg");
        s.setSource(DataSource.KAMIS);
        s.setCurrentPrice(1500L);
        s.setPreviousPrice(1400L);
        s.setYearHigh(2000L);
        s.setYearLow(1000L);
        s.setChangeAmount(100L);
        s.setChangePercent(7.14);
        s.setVolume(0L);
        return s;
    }

    private List<KamisItemDto> buildFakeDailyItems(int count, long price) {
        List<KamisItemDto> items = new ArrayList<>();
        LocalDate base = LocalDate.now().minusDays(count);
        for (int i = 0; i < count; i++) {
            LocalDate date = base.plusDays(i);
            KamisItemDto dto = new KamisItemDto();
            dto.setYyyy(String.valueOf(date.getYear()));
            dto.setRegday(String.format("%02d/%02d", date.getMonthValue(), date.getDayOfMonth()));
            dto.setPrice(String.valueOf(price));
            dto.setCountyName("평균");
            items.add(dto);
        }
        return items;
    }
}
