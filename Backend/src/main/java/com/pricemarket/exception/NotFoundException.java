package com.pricemarket.exception;

public class NotFoundException extends RuntimeException {
    public NotFoundException(ErrorCode errorCode) {
        super(errorCode.getMessage());
    }

    public NotFoundException(String message) {
        super(message);
    }
}
