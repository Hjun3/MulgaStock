package com.pricemarket.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    STOCK_NOT_FOUND("종목을 찾을 수 없습니다."),
    INVALID_PERIOD("유효하지 않은 기간입니다."),
    INVALID_PARAMETER("잘못된 요청 파라미터입니다.");

    private final String message;
}
