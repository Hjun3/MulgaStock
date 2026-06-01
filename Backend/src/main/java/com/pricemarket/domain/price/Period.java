package com.pricemarket.domain.price;

import java.time.LocalDate;

public enum Period {
    ONE_WEEK("1W"),
    ONE_MONTH("1M"),
    THREE_MONTHS("3M"),
    ONE_YEAR("1Y"),
    FIVE_YEARS("5Y"),
    ALL("ALL");

    private final String value;

    Period(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Period fromValue(String value) {
        for (Period p : values()) {
            if (p.value.equalsIgnoreCase(value)) {
                return p;
            }
        }
        throw new IllegalArgumentException("유효하지 않은 기간입니다: " + value + " (1W, 1M, 3M, 1Y, 5Y, ALL 중 하나를 사용하세요)");
    }

    public LocalDate getStartDate() {
        LocalDate today = LocalDate.now();
        return switch (this) {
            case ONE_WEEK -> today.minusWeeks(1);
            case ONE_MONTH -> today.minusMonths(1);
            case THREE_MONTHS -> today.minusMonths(3);
            case ONE_YEAR -> today.minusYears(1);
            case FIVE_YEARS -> today.minusYears(5);
            case ALL -> LocalDate.of(2000, 1, 1);
        };
    }
}
