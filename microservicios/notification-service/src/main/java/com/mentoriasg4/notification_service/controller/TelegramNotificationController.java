package com.mentoriasg4.notification_service.controller;

import com.mentoriasg4.notification_service.service.TelegramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications/telegram")
public class TelegramNotificationController {

    @Autowired
    private TelegramService telegramService;

    @Value("${internal.service.token}")
    private String internalToken;

    @PostMapping("/send")
    public ResponseEntity<?> sendTelegramMessage(@RequestHeader(value = "X-Service-Token", required = false) String token,
                                                 @RequestBody Map<String, String> payload) {
        if (!internalToken.equals(token)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        boolean success = telegramService.sendMessageToPhone(payload.get("phoneNumber"), payload.get("message"));
        return success ? ResponseEntity.ok().build() : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}