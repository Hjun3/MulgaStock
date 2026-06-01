package com.pricemarket.seed;

import com.pricemarket.domain.price.PriceHistory;
import com.pricemarket.domain.price.PriceHistoryRepository;
import com.pricemarket.domain.stock.DataSource;
import com.pricemarket.domain.stock.Stock;
import com.pricemarket.domain.stock.StockCategory;
import com.pricemarket.domain.stock.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final StockRepository stockRepository;
    private final PriceHistoryRepository priceHistoryRepository;
    private final PriceGenerator priceGenerator;

    @Override
    @Transactional
    public void run(String... args) {
        if (stockRepository.count() > 0) {
            log.info("Seed data already exists. Skipping.");
            return;
        }

        log.info("Seeding stock and price history data...");
        List<StockSeedData> seedData = buildSeedData();
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusYears(5);
        LocalDate yearAgo = endDate.minusYears(1);

        for (StockSeedData data : seedData) {
            Stock stock = new Stock();
            stock.setId(data.id());
            stock.setName(data.name());
            stock.setCategory(data.category());
            stock.setSubcategory(data.subcategory());
            stock.setUnit(data.unit());
            stock.setSource(DataSource.SEED);

            List<PriceHistory> histories = priceGenerator.generate(stock, data.basePrice(), startDate, endDate);

            long currentPrice = histories.get(histories.size() - 1).getClosePrice();
            long previousPrice = histories.size() >= 2
                    ? histories.get(histories.size() - 2).getClosePrice()
                    : currentPrice;

            long yearHigh = histories.stream()
                    .filter(h -> !h.getDate().isBefore(yearAgo))
                    .mapToLong(PriceHistory::getHighPrice)
                    .max().orElse(currentPrice);

            long yearLow = histories.stream()
                    .filter(h -> !h.getDate().isBefore(yearAgo))
                    .mapToLong(PriceHistory::getLowPrice)
                    .min().orElse(currentPrice);

            long changeAmount = currentPrice - previousPrice;
            double changePercent = previousPrice != 0
                    ? Math.round((double) changeAmount / previousPrice * 10000.0) / 100.0
                    : 0.0;

            long avgVolume = (long) histories.stream().mapToLong(PriceHistory::getVolume).average().orElse(1500);

            stock.setCurrentPrice(currentPrice);
            stock.setPreviousPrice(previousPrice);
            stock.setYearHigh(yearHigh);
            stock.setYearLow(yearLow);
            stock.setChangeAmount(changeAmount);
            stock.setChangePercent(changePercent);
            stock.setVolume(avgVolume);

            stockRepository.save(stock);
            priceHistoryRepository.saveAll(histories);
            log.debug("Seeded stock: {} with {} price records", stock.getId(), histories.size());
        }

        log.info("Seeding complete. Total stocks: {}, Total price records: {}",
                stockRepository.count(), priceHistoryRepository.count());
    }

    private List<StockSeedData> buildSeedData() {
        return List.of(
            // 식품 - 축산물
            new StockSeedData("egg",         "달걀",       StockCategory.FOOD, "축산물",  "30구",  5000L),
            new StockSeedData("pork",        "삼겹살",     StockCategory.FOOD, "축산물",  "100g",  2200L),
            new StockSeedData("beef",        "한우 등심",  StockCategory.FOOD, "축산물",  "100g",  9800L),
            new StockSeedData("chicken",     "닭고기",     StockCategory.FOOD, "축산물",  "1kg",   7000L),
            new StockSeedData("milk",        "우유",       StockCategory.FOOD, "유제품",  "1L",    2600L),
            // 식품 - 곡류
            new StockSeedData("rice",        "쌀",         StockCategory.FOOD, "곡류",    "10kg",  27000L),
            new StockSeedData("ramen",       "라면",       StockCategory.FOOD, "가공식품","5개입", 3800L),
            new StockSeedData("bread",       "식빵",       StockCategory.FOOD, "가공식품","1봉",   3200L),
            // 식품 - 채소
            new StockSeedData("napa",        "배추",       StockCategory.FOOD, "채소류",  "1포기", 3500L),
            new StockSeedData("onion",       "양파",       StockCategory.FOOD, "채소류",  "1kg",   2500L),
            new StockSeedData("cucumber",    "오이",       StockCategory.FOOD, "채소류",  "3개",   2200L),
            new StockSeedData("carrot",      "당근",       StockCategory.FOOD, "채소류",  "1kg",   2800L),
            new StockSeedData("tomato",      "토마토",     StockCategory.FOOD, "채소류",  "1kg",   5500L),
            // 식품 - 과일
            new StockSeedData("apple",       "사과",       StockCategory.FOOD, "과일류",  "10개",  18000L),
            new StockSeedData("watermelon",  "수박",       StockCategory.FOOD, "과일류",  "1통",   22000L),
            // 식품 - 외식
            new StockSeedData("chickenfried","치킨",       StockCategory.FOOD, "외식",    "1마리", 20000L),
            new StockSeedData("kimbap",      "김밥",       StockCategory.FOOD, "외식",    "1줄",   3500L),
            new StockSeedData("coffee",      "커피(아메리카노)", StockCategory.FOOD, "외식", "1잔", 4500L),
            // 생필품
            new StockSeedData("tissue",      "화장지",     StockCategory.DAILY, "위생용품", "30롤", 18000L),
            new StockSeedData("detergent",   "세탁세제",   StockCategory.DAILY, "세제류",  "3kg",   18000L),
            new StockSeedData("shampoo",     "샴푸",       StockCategory.DAILY, "위생용품", "500ml", 9000L),
            new StockSeedData("toothpaste",  "치약",       StockCategory.DAILY, "위생용품", "150g",  3500L),
            new StockSeedData("diaper",      "기저귀",     StockCategory.DAILY, "유아용품", "50매", 30000L),
            // 에너지
            new StockSeedData("gasoline",    "휘발유",     StockCategory.ENERGY, "연료",   "1L",    1700L),
            new StockSeedData("diesel",      "경유",       StockCategory.ENERGY, "연료",   "1L",    1500L),
            new StockSeedData("gas",         "도시가스",   StockCategory.ENERGY, "공공요금","1㎥",   900L),
            new StockSeedData("electricity", "전기요금",   StockCategory.ENERGY, "공공요금","1kWh",  120L),
            // 공산품
            new StockSeedData("icecream",    "아이스크림", StockCategory.GOODS, "냉동식품","1개",   1500L),
            new StockSeedData("soju",        "소주",       StockCategory.GOODS, "주류",    "1병",   1700L),
            new StockSeedData("beer",        "맥주",       StockCategory.GOODS, "주류",    "500ml", 2800L)
        );
    }

    private record StockSeedData(
            String id, String name, StockCategory category,
            String subcategory, String unit, long basePrice) {}
}
