/*
package com.mentoriasg4.payment_service.controller;

import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.resources.preference.Preference;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    /* 
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
                    .success(frontendUrl + "/student-schedule?payment=success")
                    .pending(frontendUrl + "/student-schedule?payment=pending")
                    .failure(frontendUrl + "/oferta/" + request.get("offerId") + "?payment=failure")
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
    

    @PostMapping("/create-preference")
    public ResponseEntity<?> createPreference(@RequestBody Map<String, Object> request) {
        try {
            String title = (String) request.get("title");
            BigDecimal price = new BigDecimal(request.get("price").toString());
            
            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .title(title)
                    .quantity(1)
                    .unitPrice(price)
                    .currencyId("CLP")
                    .build();

            List<PreferenceItemRequest> items = new ArrayList<>();
            items.add(itemRequest);

            // Preferencia mínima sin backUrls ni autoReturn
            PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                    .items(items)
                    .build();

            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);

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
*/

package com.mentoriasg4.payment_service.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${mercadopago.access.token}")
    private String accessToken;

    @PostMapping("/create-preference")
    public ResponseEntity<?> createPreference(@RequestBody Map<String, Object> request) {
        try {
            String title = (String) request.get("title");
            String price = request.get("price").toString();
            String offerId = request.get("offerId") != null ? request.get("offerId").toString() : "";

            // 1. Construir el ítem
            Map<String, Object> item = new HashMap<>();
            item.put("title", title);
            item.put("quantity", 1);
            item.put("unit_price", new BigDecimal(price));
            item.put("currency_id", "CLP");

            // 2. Configurar las URLs de retorno
            Map<String, Object> backUrls = new HashMap<>();
            backUrls.put("success", frontendUrl + "/student-schedule?payment=success");
            backUrls.put("pending", frontendUrl + "/student-schedule?payment=pending");
            backUrls.put("failure", frontendUrl + "/oferta/" + offerId + "?payment=failure");

            // 3. Armar el body de la preferencia
            Map<String, Object> body = new HashMap<>();
            body.put("items", List.of(item));
            body.put("back_urls", backUrls);
            body.put("auto_return", "approved");

            // 4. Llamada HTTP directa a la API de Mercado Pago
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(accessToken);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.mercadopago.com/checkout/preferences",
                entity,
                Map.class
            );

            Map<String, Object> respBody = response.getBody();
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