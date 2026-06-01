package com.pricemarket.domain.price;

import com.pricemarket.dto.price.PriceHistoryDto;
import com.pricemarket.exception.ErrorCode;
import com.pricemarket.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PriceHistoryService {

    private final PriceHistoryRepository priceHistoryRepository;

    public List<PriceHistoryDto> getHistory(String stockId, Period period) {
        if (!priceHistoryRepository.existsByStockId(stockId)) {
            throw new NotFoundException(ErrorCode.STOCK_NOT_FOUND);
        }

        List<PriceHistory> histories;
        if (period == Period.ALL) {
            histories = priceHistoryRepository.findByStockIdOrderByDateAsc(stockId);
        } else {
            histories = priceHistoryRepository.findByStockIdAndDateBetweenOrderByDateAsc(
                    stockId, period.getStartDate(), java.time.LocalDate.now());
        }

        return histories.stream().map(PriceHistoryDto::from).toList();
    }
}
