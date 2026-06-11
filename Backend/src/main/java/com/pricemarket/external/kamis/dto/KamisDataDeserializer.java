package com.pricemarket.external.kamis.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;

/**
 * KAMIS API가 정상 응답에서는 data: { error_code, item } 을 내려주지만
 * 데이터 없음/오류 상황에서는 data: [] (빈 배열)를 내려줄 때 null로 처리.
 */
public class KamisDataDeserializer extends JsonDeserializer<KamisPeriodResponse.KamisData> {

    @Override
    public KamisPeriodResponse.KamisData deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        ObjectMapper mapper = (ObjectMapper) p.getCodec();
        JsonNode node = mapper.readTree(p);

        if (node.isArray()) {
            return null;
        }
        if (node.isObject()) {
            return mapper.treeToValue(node, KamisPeriodResponse.KamisData.class);
        }
        return null;
    }
}
