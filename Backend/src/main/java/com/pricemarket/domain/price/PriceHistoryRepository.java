package com.pricemarket.domain.price;

import com.pricemarket.domain.stock.DataSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface PriceHistoryRepository extends JpaRepository<PriceHistory, Long> {

    List<PriceHistory> findByStockIdAndDateBetweenOrderByDateAsc(
            String stockId, LocalDate startDate, LocalDate endDate);

    List<PriceHistory> findByStockIdOrderByDateAsc(String stockId);

    @Query("SELECT ph FROM PriceHistory ph WHERE ph.stock.id = :stockId ORDER BY ph.date DESC LIMIT 2")
    List<PriceHistory> findLatestTwoByStockId(@Param("stockId") String stockId);

    @Query("SELECT MAX(ph.highPrice) FROM PriceHistory ph WHERE ph.stock.id = :stockId AND ph.date >= :startDate")
    Optional<Long> findYearHigh(@Param("stockId") String stockId, @Param("startDate") LocalDate startDate);

    @Query("SELECT MIN(ph.lowPrice) FROM PriceHistory ph WHERE ph.stock.id = :stockId AND ph.date >= :startDate")
    Optional<Long> findYearLow(@Param("stockId") String stockId, @Param("startDate") LocalDate startDate);

    Optional<PriceHistory> findByStockIdAndDate(String stockId, LocalDate date);

    boolean existsByStockId(String stockId);

    boolean existsByStockIdAndDate(String stockId, LocalDate date);

    long countByStockId(String stockId);

    @Query("SELECT COUNT(ph) FROM PriceHistory ph WHERE ph.stock.source = :source")
    long countByStockSource(@Param("source") DataSource source);

    @Query("SELECT MIN(ph.date) FROM PriceHistory ph WHERE ph.stock.source = :source")
    Optional<LocalDate> findOldestDateByStockSource(@Param("source") DataSource source);

    @Query("SELECT MAX(ph.date) FROM PriceHistory ph WHERE ph.stock.source = :source")
    Optional<LocalDate> findLatestDateByStockSource(@Param("source") DataSource source);

    @Modifying(clearAutomatically = true)
    @Query("DELETE FROM PriceHistory ph WHERE ph.stock.id = :stockId")
    void deleteByStockId(@Param("stockId") String stockId);
}
