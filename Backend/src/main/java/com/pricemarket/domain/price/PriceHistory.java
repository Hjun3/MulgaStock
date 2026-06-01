package com.pricemarket.domain.price;

import com.pricemarket.common.BaseEntity;
import com.pricemarket.domain.stock.Stock;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "price_history",
        indexes = {
                @Index(name = "idx_stock_date", columnList = "stock_id, date"),
                @Index(name = "idx_date", columnList = "date")
        },
        uniqueConstraints = @UniqueConstraint(columnNames = {"stock_id", "date"}))
@Getter
@Setter
@NoArgsConstructor
public class PriceHistory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false)
    private Stock stock;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private Long openPrice;

    @Column(nullable = false)
    private Long highPrice;

    @Column(nullable = false)
    private Long lowPrice;

    @Column(nullable = false)
    private Long closePrice;

    @Column(nullable = false)
    private Long volume;
}
