package com.mentoriasg4.payment_service.controller;

import com.mentoriasg4.payment_service.dto.CreatePreferenceRequest;
import com.mentoriasg4.payment_service.model.Payment;
import com.mentoriasg4.payment_service.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${mercadopago.access.token}")
    private String accessToken;

    private final PaymentService paymentService;
    private final RestTemplate restTemplate;

    @PostMapping("/create-preference")
    public ResponseEntity<?> createPreference(@RequestBody CreatePreferenceRequest request) {
        try {
            // 1. Crear registro de pago en nuestra BD
            Payment paymentRecord = paymentService.createPaymentRecord(request);

            // 2. Construir el ítem para Mercado Pago
            Map<String, Object> item = new HashMap<>();
            item.put("title", request.getTitle());
            item.put("quantity", 1);
            item.put("unit_price", request.getPrice());
            item.put("currency_id", "CLP");

            // 3. Configurar las URLs de retorno
            Map<String, Object> backUrls = new HashMap<>();
            String offerId = request.getOfferId() != null ? request.getOfferId().toString() : "";
            backUrls.put("success", frontendUrl + "/student-schedule?payment=success");
            backUrls.put("pending", frontendUrl + "/student-schedule?payment=pending");
            backUrls.put("failure", frontendUrl + "/oferta/" + offerId + "?payment=failure");

            // 4. Armar el body de la preferencia
            Map<String, Object> body = new HashMap<>();
            body.put("items", List.of(item));
            body.put("back_urls", backUrls);
            body.put("auto_return", "approved");
            body.put("external_reference", paymentRecord.getId().toString()); // Vinculamos con nuestro ID interno

            // 5. Llamada HTTP directa a la API de Mercado Pago
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.mercadopago.com/checkout/preferences",
                entity,
                Map.class
            );

            Map<String, Object> respBody = response.getBody();
            if (respBody != null && respBody.get("id") != null) {
                // 6. Actualizar nuestro registro con el ID de la preferencia de MP
                paymentRecord.setMercadopagoPreferenceId((String) respBody.get("id"));
                paymentService.savePayment(paymentRecord);
            }

            return ResponseEntity.ok(Map.of(
                "init_point", respBody.get("init_point"),
                "id", respBody.get("id")
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}