package com.pricemarket.domain.stock;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, String> {

    Page<Stock> findByCategory(StockCategory category, Pageable pageable);

    List<Stock> findByCategory(StockCategory category);

    List<Stock> findByNameContainingIgnoreCase(String name, Pageable pageable);

    List<Stock> findTop5ByOrderByChangePercentDesc();

    List<Stock> findTop5ByOrderByChangePercentAsc();

    @Query("SELECT s FROM Stock s ORDER BY s.changePercent DESC LIMIT :limit")
    List<Stock> findTopGainers(@Param("limit") int limit);

    @Query("SELECT s FROM Stock s ORDER BY s.changePercent ASC LIMIT :limit")
    List<Stock> findTopLosers(@Param("limit") int limit);

    @Query("SELECT AVG(s.currentPrice) FROM Stock s WHERE s.category = :category")
    Double findAveragePriceByCategory(@Param("category") StockCategory category);

    @Query("SELECT AVG(s.changePercent) FROM Stock s WHERE s.category = :category")
    Double findAverageChangePercentByCategory(@Param("category") StockCategory category);

    @Query("SELECT AVG(s.changePercent) FROM Stock s")
    Double findOverallAverageChangePercent();

    List<Stock> findBySource(DataSource source);

    Optional<Stock> findBySourceAndExternalCode(DataSource source, String externalCode);

    long countBySource(DataSource source);
}
