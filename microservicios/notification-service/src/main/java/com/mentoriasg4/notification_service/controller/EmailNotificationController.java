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
        if (!internalToken.equals(token)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        emailService.sendWelcomeEmail(payload.get("email"), payload.get("name"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/booking")
    public ResponseEntity<?> notifyBooking(@RequestHeader(value = "X-Service-Token", required = false) String token, 
                                           @RequestBody Map<String, String> payload) {
        if (!internalToken.equals(token)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        emailService.sendBookingStudentEmail(payload.get("studentEmail"), payload.get("studentName"), payload.get("mentorName"), payload.get("date"), payload.get("time"));
        emailService.sendBookingMentorEmail(payload.get("mentorEmail"), payload.get("mentorName"), payload.get("studentName"), payload.get("date"), payload.get("time"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/cancellation")
    public ResponseEntity<?> notifyCancellation(@RequestHeader(value = "X-Service-Token", required = false) String token, 
                                                @RequestBody Map<String, String> payload) {
        if (!internalToken.equals(token)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        emailService.sendCancellationEmail(payload.get("studentEmail"), payload.get("studentName"), payload.get("date"), payload.get("reason"));
        emailService.sendCancellationEmail(payload.get("mentorEmail"), payload.get("mentorName"), payload.get("date"), payload.get("reason"));
        return ResponseEntity.ok().build();
    }
}