package com.pricemarket.seed.agri;

import com.pricemarket.domain.stock.StockCategory;

import java.util.List;

public class AgriStockCatalog {

    public static final List<AgriStockMeta> ITEMS = List.of(
            // 식량작물
            new AgriStockMeta("rice",        "쌀",       "20kg",  "100", "111", "01", "04", StockCategory.FOOD),
            new AgriStockMeta("bean",        "콩",       "500g",  "100", "141", "00", "04", StockCategory.FOOD),
            new AgriStockMeta("potato",      "감자",     "100g",  "100", "152", "01", "04", StockCategory.FOOD),
            // 채소류
            new AgriStockMeta("napa",        "배추",     "1포기", "200", "211", "06", "04", StockCategory.FOOD),
            new AgriStockMeta("cabbage",     "양배추",   "1포기", "200", "213", "00", "04", StockCategory.FOOD),
            new AgriStockMeta("onion",       "양파",     "1kg",   "200", "245", "00", "04", StockCategory.FOOD),
            new AgriStockMeta("green_onion", "대파",     "1kg",   "200", "246", "00", "04", StockCategory.FOOD),
            new AgriStockMeta("garlic",      "깐마늘",   "1kg",   "200", "258", "00", "04", StockCategory.FOOD),
            new AgriStockMeta("radish",      "무",       "1개",   "200", "212", "02", "04", StockCategory.FOOD),
            new AgriStockMeta("carrot",      "당근",     "1kg",   "200", "214", "00", "04", StockCategory.FOOD),
            new AgriStockMeta("cucumber",    "오이",     "10개",  "200", "223", "00", "04", StockCategory.FOOD),
            new AgriStockMeta("tomato",      "토마토",   "1kg",   "200", "225", "00", "04", StockCategory.FOOD),
            new AgriStockMeta("watermelon",  "수박",     "1개",   "200", "221", "00", "04", StockCategory.FOOD),
            new AgriStockMeta("melon",       "참외",     "10개",  "200", "222", "00", "04", StockCategory.FOOD),
            // 과일류
            new AgriStockMeta("apple",       "사과",     "10개",  "400", "411", "05", "04", StockCategory.FOOD),
            // 축산물
            new AgriStockMeta("beef",        "한우",     "100g",  "500", "514", "02", "04", StockCategory.FOOD),
            new AgriStockMeta("pork",        "돼지고기", "100g",  "500", "515", "03", "04", StockCategory.FOOD),
            new AgriStockMeta("egg",         "달걀",     "10개",  "500", "513", "00", "04", StockCategory.FOOD)
    );
}
