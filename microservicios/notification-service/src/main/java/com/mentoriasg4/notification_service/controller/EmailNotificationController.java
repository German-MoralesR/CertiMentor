package com.mentoriasg4.notification_service.controller;

import com.mentoriasg4.notification_service.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications/email")
public class EmailNotificationController {

    @Autowired
    private EmailService emailService;

    @Value("${internal.service.token}")
    private String internalToken;

    @PostMapping("/welcome")
    public ResponseEntity<?> notifyWelcome(@RequestHeader(value = "X-Service-Token", required = false) String token, 
                                           @RequestBody Map<String, String> payload) {
        System.out.println("=== /welcome recibido. Token recibido: [" + token + "], Token esperado: [" + internalToken + "] ===");
        if (!internalToken.equals(token)) {
            System.out.println("=== TOKEN NO COINCIDE, devolviendo 401 ===");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        System.out.println("=== Enviando correo a: " + payload.get("email") + " ===");
        emailService.sendWelcomeEmail(payload.get("email"), payload.get("name"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/booking")
    public ResponseEntity<?> notifyBooking(@RequestHeader(value = "X-Service-Token", required = false) String token, 
                                           @RequestBody Map<String, String> payload) {
        System.out.println("=== /booking recibido. Token recibido: [" + token + "], Token esperado: [" + internalToken + "] ===");
        if (!internalToken.equals(token)) {
            System.out.println("=== TOKEN NO COINCIDE, devolviendo 401 ===");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        System.out.println("=== Enviando correos a: " + payload.get("studentEmail") + " y " + payload.get("mentorEmail") + " ===");
        emailService.sendBookingStudentEmail(payload.get("studentEmail"), payload.get("studentName"), payload.get("mentorName"), payload.get("date"), payload.get("time"));
        emailService.sendBookingMentorEmail(payload.get("mentorEmail"), payload.get("mentorName"), payload.get("studentName"), payload.get("date"), payload.get("time"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cancellation")
    public ResponseEntity<?> notifyCancellation(@RequestHeader(value = "X-Service-Token", required = false) String token, 
                                                @RequestBody Map<String, String> payload) {
        System.out.println("=== /cancellation recibido. Token recibido: [" + token + "], Token esperado: [" + internalToken + "] ===");
        if (!internalToken.equals(token)) {
            System.out.println("=== TOKEN NO COINCIDE, devolviendo 401 ===");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        System.out.println("=== Enviando correos de cancelación a: " + payload.get("studentEmail") + " y " + payload.get("mentorEmail") + " ===");
        emailService.sendCancellationEmail(payload.get("studentEmail"), payload.get("studentName"), payload.get("date"), payload.get("reason"));
        emailService.sendCancellationEmail(payload.get("mentorEmail"), payload.get("mentorName"), payload.get("date"), payload.get("reason"));
        return ResponseEntity.ok().build();
    }
}