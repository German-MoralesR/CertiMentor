package com.mentoriasg4.payment_service.controller;

import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.resources.preference.Preference;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "http://localhost:5173") // Permitir peticiones desde tu Frontend React
public class PaymentController {

    @PostMapping("/create-preference")
    public ResponseEntity<?> createPreference(@RequestBody Map<String, Object> request) {
        try {
            String title = (String) request.get("title");
            BigDecimal price = new BigDecimal(request.get("price").toString());
            
            // 1. Crear el ítem a cobrar
            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .title(title)
                    .quantity(1)
                    .unitPrice(price)
                    .currencyId("CLP") // Pesos Chilenos
                    .build();

            List<PreferenceItemRequest> items = new ArrayList<>();
            items.add(itemRequest);

            // 2. Configurar a dónde volverá el usuario luego de pagar
            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success("http://localhost:5173/student-schedule?payment=success")
                    .pending("http://localhost:5173/student-schedule?payment=pending")
                    .failure("http://localhost:5173/oferta/" + request.get("offerId") + "?payment=failure")
                    .build();

            // 3. Crear la Preferencia
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .backUrls(backUrls)
                    .autoReturn("approved") // Redirigir automáticamente si el pago se aprueba
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

            // Retornamos el link de pago que nos da Mercado Pago
            return ResponseEntity.ok(Map.of("init_point", preference.getInitPoint(), "id", preference.getId()));

        } catch (MPApiException e) {
            System.err.println("Error detallado MercadoPago: " + e.getApiResponse().getContent());
            return ResponseEntity.status(e.getApiResponse().getStatusCode()).body(Map.of("error", "MP Error: " + e.getApiResponse().getContent()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}