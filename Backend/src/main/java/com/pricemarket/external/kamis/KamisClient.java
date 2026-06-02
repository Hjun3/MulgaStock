package com.pricemarket.external.kamis;

import com.pricemarket.external.kamis.dto.KamisItemDto;
import com.pricemarket.external.kamis.dto.KamisPeriodResponse;
import com.pricemarket.external.kamis.exception.KamisApiException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

@Component
@Slf4j
public class KamisClient {

    private final KamisProperties properties;
    private final RestTemplate restTemplate;

    public KamisClient(KamisProperties properties,
                       @Qualifier("kamisRestTemplate") RestTemplate restTemplate) {
        this.properties = properties;
        this.restTemplate = restTemplate;
    }

    /**
     * 기간별 종목 시계열 조회 (periodProductList).
     * 소매(p_productclscode=01) 기준, JSON 응답.
     */
    public List<KamisItemDto> getPeriodData(
            String categoryCode, String itemCode, String kindCode, String rankCode,
            LocalDate startDate, LocalDate endDate, String countyCode) {

        String url = UriComponentsBuilder
                .fromHttpUrl(properties.getBaseUrl())
                .queryParam("action", "periodProductList")
                .queryParam("p_productclscode", "01")
                .queryParam("p_startday", startDate.toString())
                .queryParam("p_endday", endDate.toString())
                .queryParam("p_itemcategorycode", categoryCode)
                .queryParam("p_itemcode", itemCode)
                .queryParam("p_kindcode", kindCode)
                .queryParam("p_productrankcode", rankCode)
                .queryParam("p_countycode", countyCode)
                .queryParam("p_convert_kg_yn", "N")
                .queryParam("p_cert_key", properties.getCertKey())
                .queryParam("p_cert_id", properties.getCertId())
                .queryParam("p_returntype", "json")
                .toUriString();

        log.debug("KAMIS request: itemCode={}, {}~{}", itemCode, startDate, endDate);

        try {
            KamisPeriodResponse response = restTemplate.getForObject(url, KamisPeriodResponse.class);

            if (response == null || response.getData() == null) {
                log.warn("KAMIS empty response for itemCode={}", itemCode);
                return Collections.emptyList();
            }

            String errorCode = response.getData().getErrorCode();
            if (!"000".equals(errorCode)) {
                log.warn("KAMIS error for itemCode={}: errorCode={}", itemCode, errorCode);
                return Collections.emptyList();
            }

            List<KamisItemDto> items = response.getData().getItem();
            return items != null ? items : Collections.emptyList();

        } catch (RestClientException e) {
            log.error("KAMIS API call failed for itemCode={}", itemCode, e);
            throw new KamisApiException("KAMIS fetch failed: itemCode=" + itemCode, e);
        }
    }
}
