package com.pricemarket.external.opinet;

import com.pricemarket.external.opinet.dto.OpinetCurrentPriceResponse;
import com.pricemarket.external.opinet.dto.OpinetHistoryOilDto;
import com.pricemarket.external.opinet.dto.OpinetHistoryResponse;
import com.pricemarket.external.opinet.dto.OpinetOilDto;
import com.pricemarket.external.opinet.exception.OpinetApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OpinetClient {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyyMMdd");

    private final OpinetProperties properties;
    private final RestTemplate restTemplate;

    /**
     * 현재 전국 평균 유가 (전 유종)
     * GET /avgAllPrice.do?out=json&code={key}
     */
    public List<OpinetOilDto> getCurrentPrice() {
        String url = UriComponentsBuilder
                .fromHttpUrl(properties.getBaseUrl() + "/avgAllPrice.do")
                .queryParam("code", properties.getApiKey())
                .queryParam("out", "json")
                .toUriString();

        try {
            OpinetCurrentPriceResponse response = restTemplate.getForObject(url, OpinetCurrentPriceResponse.class);
            return response != null ? response.getOilList() : Collections.emptyList();
        } catch (RestClientException e) {
            log.error("Opinet current price API failed", e);
            throw new OpinetApiException("Failed to fetch current price from Opinet", e);
        }
    }

    /**
     * 특정 날짜 기준 최근 7일 일일 평균가 (전 유종)
     * GET /dateAvgRecentPrice.do?out=json&code={key}&date=YYYYMMDD
     *
     * NOTE: 이 API가 과거 날짜에 대한 실제 역사적 데이터를 반환하는지 여부는
     * Opinet 실API 호출로 검증 필요 — 초기 백필 로직이 이 동작에 의존함.
     */
    public List<OpinetHistoryOilDto> getHistoryFor7Days(LocalDate endDate) {
        String dateStr = endDate.format(DATE_FMT);
        String url = UriComponentsBuilder
                .fromHttpUrl(properties.getBaseUrl() + "/dateAvgRecentPrice.do")
                .queryParam("code", properties.getApiKey())
                .queryParam("out", "json")
                .queryParam("date", dateStr)
                .toUriString();

        try {
            OpinetHistoryResponse response = restTemplate.getForObject(url, OpinetHistoryResponse.class);
            return response != null ? response.getOilList() : Collections.emptyList();
        } catch (RestClientException e) {
            log.error("Opinet history API failed for date {}", dateStr, e);
            throw new OpinetApiException("Failed to fetch history from Opinet for date " + dateStr, e);
        }
    }

    /**
     * 최근 7일 일일 평균가 (전 유종) — 스케줄러용
     * GET /avgRecentPrice.do?out=json&code={key}
     */
    public List<OpinetHistoryOilDto> getRecent7Days() {
        String url = UriComponentsBuilder
                .fromHttpUrl(properties.getBaseUrl() + "/avgRecentPrice.do")
                .queryParam("code", properties.getApiKey())
                .queryParam("out", "json")
                .toUriString();

        try {
            OpinetHistoryResponse response = restTemplate.getForObject(url, OpinetHistoryResponse.class);
            return response != null ? response.getOilList() : Collections.emptyList();
        } catch (RestClientException e) {
            log.error("Opinet recent 7 days API failed", e);
            throw new OpinetApiException("Failed to fetch recent prices from Opinet", e);
        }
    }
}
