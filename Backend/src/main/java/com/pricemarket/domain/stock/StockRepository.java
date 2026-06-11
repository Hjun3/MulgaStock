package com.pricemarket.domain.stock;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, String> {

    Page<Stock> findBySourceNot(DataSource source, Pageable pageable);

    Page<Stock> findByCategoryAndSourceNot(StockCategory category, DataSource source, Pageable pageable);

    List<Stock> findByCategoryAndSourceNot(StockCategory category, DataSource source);

    List<Stock> findByNameContainingIgnoreCaseAndSourceNot(String name, DataSource source, Pageable pageable);

    List<Stock> findBySourceNot(DataSource source);

    @Query("SELECT s FROM Stock s WHERE s.source != :excluded ORDER BY s.changePercent DESC LIMIT :limit")
    List<Stock> findTopGainers(@Param("limit") int limit, @Param("excluded") DataSource excluded);

    @Query("SELECT s FROM Stock s WHERE s.source != :excluded ORDER BY s.changePercent ASC LIMIT :limit")
    List<Stock> findTopLosers(@Param("limit") int limit, @Param("excluded") DataSource excluded);

    @Query("SELECT AVG(s.currentPrice) FROM Stock s WHERE s.category = :category AND s.source != :excluded")
    Double findAveragePriceByCategory(@Param("category") StockCategory category, @Param("excluded") DataSource excluded);

    @Query("SELECT AVG(s.changePercent) FROM Stock s WHERE s.category = :category AND s.source != :excluded")
    Double findAverageChangePercentByCategory(@Param("category") StockCategory category, @Param("excluded") DataSource excluded);

    @Query("SELECT AVG(s.changePercent) FROM Stock s WHERE s.source != :excluded")
    Double findOverallAverageChangePercent(@Param("excluded") DataSource excluded);

    List<Stock> findBySource(DataSource source);

    Optional<Stock> findBySourceAndExternalCode(DataSource source, String externalCode);

    long countBySource(DataSource source);
}
