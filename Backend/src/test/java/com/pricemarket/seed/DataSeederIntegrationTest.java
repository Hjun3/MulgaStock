package com.pricemarket.seed;

import com.pricemarket.domain.price.PriceHistoryRepository;
import com.pricemarket.domain.stock.StockRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class DataSeederIntegrationTest {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private PriceHistoryRepository priceHistoryRepository;

    @Test
    void seedData_creates30Stocks() {
        assertThat(stockRepository.count()).isEqualTo(30);
    }

    @Test
    void seedData_createsMoreThan50000PriceRecords() {
        long count = priceHistoryRepository.count();
        // 30종목 × 약 1825일 = 약 54,750개 (최소 50,000 이상)
        assertThat(count).isGreaterThan(50_000L);
    }

    @Test
    void seedData_eggHasValidCurrentPrice() {
        var egg = stockRepository.findById("egg");
        assertThat(egg).isPresent();
        assertThat(egg.get().getCurrentPrice()).isPositive();
        assertThat(egg.get().getYearHigh()).isGreaterThanOrEqualTo(egg.get().getCurrentPrice());
        assertThat(egg.get().getYearLow()).isLessThanOrEqualTo(egg.get().getCurrentPrice());
    }

    @Test
    void seedData_allCategoriesPresent() {
        assertThat(stockRepository.findByCategory(com.pricemarket.domain.stock.StockCategory.FOOD)).isNotEmpty();
        assertThat(stockRepository.findByCategory(com.pricemarket.domain.stock.StockCategory.DAILY)).isNotEmpty();
        assertThat(stockRepository.findByCategory(com.pricemarket.domain.stock.StockCategory.ENERGY)).isNotEmpty();
        assertThat(stockRepository.findByCategory(com.pricemarket.domain.stock.StockCategory.GOODS)).isNotEmpty();
    }
}
