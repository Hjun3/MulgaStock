package com.pricemarket.external.kamis.exception;

public class KamisApiException extends RuntimeException {

    public KamisApiException(String message) {
        super(message);
    }

    public KamisApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
