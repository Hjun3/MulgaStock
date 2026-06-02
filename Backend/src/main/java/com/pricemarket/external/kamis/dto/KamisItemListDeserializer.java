package com.pricemarket.external.kamis.dto;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * KAMIS item 필드가 배열 또는 단일 객체로 올 때 모두 List로 역직렬화.
 */
public class KamisItemListDeserializer extends JsonDeserializer<List<KamisItemDto>> {

    @Override
    public List<KamisItemDto> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        ObjectMapper mapper = (ObjectMapper) p.getCodec();
        JsonNode node = mapper.readTree(p);

        if (node.isArray()) {
            return mapper.readValue(
                    node.toString(),
                    mapper.getTypeFactory().constructCollectionType(List.class, KamisItemDto.class)
            );
        } else if (node.isObject()) {
            return List.of(mapper.treeToValue(node, KamisItemDto.class));
        }
        return Collections.emptyList();
    }
}
