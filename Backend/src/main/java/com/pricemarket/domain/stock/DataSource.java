package com.pricemarket.domain.stock;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum DataSource {
    SEED("시드 데이터"),
    OPINET("한국석유공사 Opinet"),
    ECOS("한국은행 ECOS"),
    KCA_PROCESSED("한국소비자원 가공식품"),
    KCA_NECESSITY("한국소비자원 생필품");

    private final String displayName;
}
