package com.pricemarket.external.ecos;

import com.pricemarket.external.ecos.dto.EcosRowDto;
import com.pricemarket.external.ecos.dto.EcosSearchResponse;
import com.pricemarket.external.ecos.exception.EcosApiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class EcosClient {

    private final EcosProperties properties;
    private final RestTemplate restTemplate;

    /**
     * ECOS StatisticSearch 시계열 조회.
     *
     * URL: {baseUrl}/StatisticSearch/{apiKey}/json/kr/1/{size}/{statCode}/{cycle}/{startTime}/{endTime}[/{itemCode}]
     *
     * @param itemCode null 또는 빈 문자열이면 생략 (전체 조회). "*AA" 등 특수 코드는 그대로 URL에 삽입.
     */
    public List<EcosRowDto> getStatistics(
            String statCode, String cycle,
            String startTime, String endTime,
            String itemCode, int size) {

        // URL을 StringBuilder로 직접 구성 — UriComponentsBuilder는 * 등 특수문자를 인코딩해 ECOS가 거부함
        String url = buildUrl(statCode, cycle, startTime, endTime, itemCode, size);
        log.debug("ECOS request: {}", url);

        try {
            EcosSearchResponse response = restTemplate.getForObject(url, EcosSearchResponse.class);
            if (response == null) return Collections.emptyList();

            if (response.isError()) {
                EcosSearchResponse.ErrorResult err = response.getResult();
                if (err.isNoData()) {
                    log.warn("ECOS no data: statCode={}, code={}, message={}", statCode, err.getCode(), err.getMessage());
                    return Collections.emptyList();
                }
                throw new EcosApiException("ECOS API error: " + err.getCode() + " " + err.getMessage());
            }

            return response.getRows();
        } catch (RestClientException e) {
            log.error("ECOS API call failed: statCode={}", statCode, e);
            throw new EcosApiException("Failed to fetch from ECOS: statCode=" + statCode, e);
        }
    }

    private String buildUrl(String statCode, String cycle, String startTime, String endTime,
                            String itemCode, int size) {
        StringBuilder sb = new StringBuilder(properties.getBaseUrl())
                .append("/StatisticSearch/")
                .append(properties.getApiKey())
                .append("/json/kr/1/")
                .append(size).append("/")
                .append(statCode).append("/")
                .append(cycle).append("/")
                .append(startTime).append("/")
                .append(endTime);

        if (itemCode != null && !itemCode.isBlank()) {
            sb.append("/").append(itemCode);
        }

        return sb.toString();
    }
}
