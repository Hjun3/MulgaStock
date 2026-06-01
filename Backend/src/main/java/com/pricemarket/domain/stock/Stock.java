package com.pricemarket.domain.stock;

import com.pricemarket.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "stocks",
        indexes = {
                @Index(name = "idx_stock_category", columnList = "category"),
                @Index(name = "idx_stock_change", columnList = "change_percent")
        })
@Getter
@Setter
@NoArgsConstructor
public class Stock extends BaseEntity {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    private StockCategory category;

    @Column(length = 50)
    private String subcategory;

    @Column(length = 50)
    private String unit;

    @Column(nullable = false)
    private Long currentPrice;

    @Column(nullable = false)
    private Long previousPrice;

    @Column(nullable = false)
    private Long yearHigh;

    @Column(nullable = false)
    private Long yearLow;

    @Column(nullable = false)
    private Long volume;

    @Column(nullable = false, name = "change_percent")
    private Double changePercent;

    @Column(nullable = false)
    private Long changeAmount;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private DataSource source;

    @Column(length = 100)
    private String externalCode;
}
