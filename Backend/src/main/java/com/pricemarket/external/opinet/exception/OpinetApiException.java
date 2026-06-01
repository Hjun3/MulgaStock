package com.pricemarket.external.opinet.exception;

public class OpinetApiException extends RuntimeException {

    public OpinetApiException(String message) {
        super(message);
    }

    public OpinetApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
