package com.pricemarket.external.kamis;

import com.pricemarket.config.HttpClientConfig;
import com.pricemarket.external.kamis.dto.KamisItemDto;
import com.pricemarket.external.kamis.exception.KamisApiException;
import com.pricemarket.external.opinet.OpinetProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

@RestClientTest(KamisClient.class)
@EnableConfigurationProperties({KamisProperties.class, OpinetProperties.class})
@Import(HttpClientConfig.class)
class KamisClientTest {

    @Autowired
    private KamisClient kamisClient;

    @Autowired
    private MockRestServiceServer server;

    @Autowired
    private KamisProperties kamisProperties;

    @Autowired
    private OpinetProperties opinetProperties;

    @BeforeEach
    void setUp() {
        kamisProperties.setBaseUrl("http://www.kamis.or.kr/service/price/xml.do");
        kamisProperties.setCertKey("test-key");
        kamisProperties.setCertId("test-id");
        kamisProperties.setTimeoutMs(5000);
        opinetProperties.setTimeoutMs(5000);
    }

    @Test
    void getPeriodData_parsesArrayResponse() {
        String json = """
                {
                  "condition": [],
                  "data": {
                    "error_code": "000",
                    "item": [
                      { "yyyy": "2025", "regday": "06/01", "price": "1,819", "countyname": "평균" },
                      { "yyyy": "2025", "regday": "06/02", "price": "1,850", "countyname": "평균" }
                    ]
                  }
                }
                """;

        server.expect(requestTo(org.hamcrest.Matchers.containsString("periodProductList")))
                .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        List<KamisItemDto> result = kamisClient.getPeriodData(
                "200", "245", "00", "04",
                LocalDate.of(2025, 1, 1), LocalDate.of(2025, 6, 2), "1101");

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getYyyy()).isEqualTo("2025");
        assertThat(result.get(0).getRegday()).isEqualTo("06/01");
        assertThat(result.get(0).toPrice()).isEqualTo(1819L);
        assertThat(result.get(0).toLocalDate()).isEqualTo(LocalDate.of(2025, 6, 1));
        assertThat(result.get(1).toPrice()).isEqualTo(1850L);
    }

    @Test
    void getPeriodData_parsesSingleObjectItem() {
        String json = """
                {
                  "condition": [],
                  "data": {
                    "error_code": "000",
                    "item": { "yyyy": "2025", "regday": "06/01", "price": "2,500", "countyname": "평균" }
                  }
                }
                """;

        server.expect(requestTo(org.hamcrest.Matchers.containsString("periodProductList")))
                .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        List<KamisItemDto> result = kamisClient.getPeriodData(
                "100", "111", "01", "04",
                LocalDate.of(2025, 1, 1), LocalDate.of(2025, 6, 2), "1101");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).toPrice()).isEqualTo(2500L);
    }

    @Test
    void getPeriodData_returnsEmpty_whenErrorCodeNot000() {
        String json = """
                {
                  "condition": [],
                  "data": {
                    "error_code": "100",
                    "item": []
                  }
                }
                """;

        server.expect(requestTo(org.hamcrest.Matchers.containsString("periodProductList")))
                .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        List<KamisItemDto> result = kamisClient.getPeriodData(
                "200", "999", "00", "04",
                LocalDate.of(2025, 1, 1), LocalDate.of(2025, 6, 2), "1101");

        assertThat(result).isEmpty();
    }

    @Test
    void getPeriodData_throwsKamisApiException_on5xx() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("periodProductList")))
                .andRespond(withServerError());

        assertThatThrownBy(() -> kamisClient.getPeriodData(
                "200", "245", "00", "04",
                LocalDate.of(2025, 1, 1), LocalDate.of(2025, 6, 2), "1101"))
                .isInstanceOf(KamisApiException.class)
                .hasMessageContaining("245");
    }

    @Test
    void toPrice_handlesDashAsZero() {
        KamisItemDto dto = new KamisItemDto();
        dto.setPrice("-");
        assertThat(dto.toPrice()).isEqualTo(0L);
    }

    @Test
    void toPrice_handlesBlankAsZero() {
        KamisItemDto dto = new KamisItemDto();
        dto.setPrice("  ");
        assertThat(dto.toPrice()).isEqualTo(0L);
    }

    @Test
    void toPrice_removesComma() {
        KamisItemDto dto = new KamisItemDto();
        dto.setPrice("1,819");
        assertThat(dto.toPrice()).isEqualTo(1819L);
    }
}
