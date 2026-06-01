package com.pricemarket.external.opinet;

import com.pricemarket.external.opinet.dto.OpinetHistoryOilDto;
import com.pricemarket.external.opinet.dto.OpinetOilDto;
import com.pricemarket.external.opinet.exception.OpinetApiException;
import com.pricemarket.config.HttpClientConfig;
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
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

@RestClientTest(OpinetClient.class)
@EnableConfigurationProperties(OpinetProperties.class)
@Import(HttpClientConfig.class)
class OpinetClientTest {

    @Autowired
    private OpinetClient opinetClient;

    @Autowired
    private MockRestServiceServer server;

    @Autowired
    private OpinetProperties opinetProperties;

    @BeforeEach
    void setUp() {
        opinetProperties.setBaseUrl("https://www.opinet.co.kr/api");
        opinetProperties.setApiKey("test-key");
        opinetProperties.setTimeoutMs(5000);
    }

    @Test
    void getCurrentPrice_parsesResponseCorrectly() {
        String json = """
                {
                  "RESULT": {
                    "OIL": [
                      { "TRADE_DT": "20260531", "PRODCD": "B027", "PRODNM": "휘발유", "PRICE": "2010.73", "DIFF": "+0.01" },
                      { "TRADE_DT": "20260531", "PRODCD": "D047", "PRODNM": "경유",   "PRICE": "1820.50", "DIFF": "-0.05" }
                    ]
                  }
                }
                """;

        server.expect(requestTo(org.hamcrest.Matchers.containsString("avgAllPrice.do")))
                .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        List<OpinetOilDto> result = opinetClient.getCurrentPrice();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getProdCd()).isEqualTo("B027");
        assertThat(result.get(0).getPriceLong()).isEqualTo(2011L);
        assertThat(result.get(0).getTradeDate()).isEqualTo(LocalDate.of(2026, 5, 31));
        assertThat(result.get(1).getPriceLong()).isEqualTo(1821L);  // round(1820.50)
    }

    @Test
    void getCurrentPrice_returnsEmptyList_whenResultIsNull() {
        String json = """
                { "RESULT": { "OIL": [] } }
                """;

        server.expect(requestTo(org.hamcrest.Matchers.containsString("avgAllPrice.do")))
                .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        List<OpinetOilDto> result = opinetClient.getCurrentPrice();
        assertThat(result).isEmpty();
    }

    @Test
    void getCurrentPrice_throwsOpinetApiException_on5xx() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("avgAllPrice.do")))
                .andRespond(withServerError());

        assertThatThrownBy(() -> opinetClient.getCurrentPrice())
                .isInstanceOf(OpinetApiException.class)
                .hasMessageContaining("current price");
    }

    @Test
    void getHistoryFor7Days_parsesDateAndPrice() {
        String json = """
                {
                  "RESULT": {
                    "OIL": [
                      { "DATE": "20260525", "PRODCD": "B027", "PRICE": "2005.10" },
                      { "DATE": "20260526", "PRODCD": "B027", "PRICE": "2008.30" }
                    ]
                  }
                }
                """;

        server.expect(requestTo(org.hamcrest.Matchers.containsString("dateAvgRecentPrice.do")))
                .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        List<OpinetHistoryOilDto> result = opinetClient.getHistoryFor7Days(LocalDate.of(2026, 5, 31));

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getTradeDate()).isEqualTo(LocalDate.of(2026, 5, 25));
        assertThat(result.get(0).getPriceLong()).isEqualTo(2005L);
        assertThat(result.get(1).getPriceLong()).isEqualTo(2008L);
    }

    @Test
    void getHistoryFor7Days_throwsOpinetApiException_on404() {
        server.expect(requestTo(org.hamcrest.Matchers.containsString("dateAvgRecentPrice.do")))
                .andRespond(withResourceNotFound());

        assertThatThrownBy(() -> opinetClient.getHistoryFor7Days(LocalDate.now()))
                .isInstanceOf(OpinetApiException.class)
                .hasMessageContaining("history");
    }

    @Test
    void getRecent7Days_parsesCorrectly() {
        String json = """
                {
                  "RESULT": {
                    "OIL": [
                      { "DATE": "20260531", "PRODCD": "K015", "PRICE": "980.00" }
                    ]
                  }
                }
                """;

        server.expect(requestTo(org.hamcrest.Matchers.containsString("avgRecentPrice.do")))
                .andRespond(withSuccess(json, MediaType.APPLICATION_JSON));

        List<OpinetHistoryOilDto> result = opinetClient.getRecent7Days();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getProdCd()).isEqualTo("K015");
        assertThat(result.get(0).getPriceLong()).isEqualTo(980L);
    }
}
