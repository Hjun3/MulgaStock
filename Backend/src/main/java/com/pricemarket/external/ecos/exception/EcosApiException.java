package com.pricemarket.external.ecos.exception;

public class EcosApiException extends RuntimeException {

    public EcosApiException(String message) {
        super(message);
    }

    public EcosApiException(String message, Throwable cause) {
        super(message, cause);
    }
}
