package com.pricemarket.seed.energy;

import com.pricemarket.domain.price.PriceHistory;
import com.pricemarket.domain.price.PriceHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PriceHistoryBatchSaver {

    private final PriceHistoryRepository priceHistoryRepository;

    @Transactional
    public void saveAll(List<PriceHistory> batch) {
        priceHistoryRepository.saveAll(batch);
    }

    @Transactional
    public void deleteByStockId(String stockId) {
        priceHistoryRepository.deleteByStockId(stockId);
    }
}
