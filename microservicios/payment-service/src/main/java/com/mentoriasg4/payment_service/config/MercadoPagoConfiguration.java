package com.mentoriasg4.payment_service.config;

import com.mercadopago.MercadoPagoConfig;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MercadoPagoConfiguration {

    @Value("${mercadopago.access.token}")
    private String accessToken;

    @PostConstruct
    public void init() {
        System.out.println("=== Token length: " + (accessToken != null ? accessToken.length() : "NULL") + " ===");
        System.out.println("=== Token completo: [" + accessToken + "] ===");
        MercadoPagoConfig.setAccessToken(accessToken);
    }
}