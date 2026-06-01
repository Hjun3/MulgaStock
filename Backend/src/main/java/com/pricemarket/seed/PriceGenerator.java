package com.pricemarket.seed;

import com.pricemarket.domain.price.PriceHistory;
import com.pricemarket.domain.stock.Stock;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
public class PriceGenerator {

    private static final Random RANDOM = new Random(42);

    public List<PriceHistory> generate(Stock stock, long basePrice, LocalDate startDate, LocalDate endDate) {
        List<PriceHistory> histories = new ArrayList<>();
        long price = basePrice;
        LocalDate current = startDate;

        while (!current.isAfter(endDate)) {
            double dailyChange = randomWalk();
            double seasonalFactor = getSeasonalFactor(stock.getId(), current);
            double shockFactor = getShockFactor(stock.getId(), current);

            price = Math.max(100L, Math.round(price * (1 + dailyChange + seasonalFactor + shockFactor)));

            long open = price;
            long close = Math.max(100L, Math.round(open * (1 + randomWalk() * 0.5)));

            long high = Math.max(open, close);
            high = Math.round(high * (1 + RANDOM.nextDouble() * 0.02));

            long low = Math.min(open, close);
            low = Math.round(low * (1 - RANDOM.nextDouble() * 0.02));
            low = Math.max(1L, low);

            long volume = 1000L + (long) (RANDOM.nextDouble() * 4000);

            PriceHistory ph = new PriceHistory();
            ph.setStock(stock);
            ph.setDate(current);
            ph.setOpenPrice(open);
            ph.setHighPrice(high);
            ph.setLowPrice(low);
            ph.setClosePrice(close);
            ph.setVolume(volume);
            histories.add(ph);

            price = close;
            current = current.plusDays(1);
        }

        return histories;
    }

    private double randomWalk() {
        return (RANDOM.nextGaussian() * 0.015);
    }

    private double getSeasonalFactor(String stockId, LocalDate date) {
        int month = date.getMonthValue();
        return switch (stockId) {
            case "watermelon", "icecream" -> (month >= 6 && month <= 8) ? 0.003 : -0.001;
            case "napa", "carrot" -> (month >= 11 && month <= 12) ? 0.005 : -0.001;
            default -> 0.0;
        };
    }

    private double getShockFactor(String stockId, LocalDate date) {
        if (!stockId.equals("gasoline") && !stockId.equals("diesel")) {
            return 0.0;
        }
        // 연도별 결정적 충격일 (랜덤처럼 보이도록 날짜 기반 해시)
        int dayOfYear = date.getDayOfYear();
        int year = date.getYear();
        int hash = (year * 367 + dayOfYear) % 100;
        if (hash < 2) return 0.08;
        if (hash < 4) return -0.07;
        return 0.0;
    }
}
