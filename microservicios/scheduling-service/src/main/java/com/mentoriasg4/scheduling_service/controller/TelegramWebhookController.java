package com.mentoriasg4.scheduling_service.controller;

import com.mentoriasg4.scheduling_service.model.TelegramUser;
import com.mentoriasg4.scheduling_service.repository.TelegramUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/webhook/telegram")
public class TelegramWebhookController {

    private static final String TELEGRAM_API_BASE = "https://api.telegram.org";

    private final TelegramUserRepository telegramUserRepository;
    private final RestTemplate restTemplate;

    @Value("${telegram.bot.token:}")
    private String botToken;

    public TelegramWebhookController(TelegramUserRepository telegramUserRepository,
                                     RestTemplate restTemplate) {
        this.telegramUserRepository = telegramUserRepository;
        this.restTemplate = restTemplate;
    }

    @PostMapping
    public ResponseEntity<Void> handleUpdate(@RequestBody Map<String, Object> update) {
        Map<?, ?> message = (Map<?, ?>) update.get("message");
        if (message == null) return ResponseEntity.ok().build();

        Long chatId = extractChatId(message);
        if (chatId == null) return ResponseEntity.ok().build();

        // Caso 1: usuario envió /start → pedir número
        String text = asText(message.get("text"));
        if ("/start".equals(text)) {
            sendPhoneRequest(chatId);
            return ResponseEntity.ok().build();
        }

        // Caso 2: usuario compartió su contacto → guardar chat_id + phone
        Map<?, ?> contact = (Map<?, ?>) message.get("contact");
        if (contact != null) {
            String rawPhone = asText(contact.get("phone_number"));
            String normalized = rawPhone.replaceAll("\\D", "");
            if (!normalized.isBlank()) {
                telegramUserRepository.findByPhoneNumber(normalized).ifPresentOrElse(
                    existing -> {
                        existing.setChatId(chatId);
                        telegramUserRepository.save(existing);
                    },
                    () -> telegramUserRepository.save(new TelegramUser(normalized, chatId))
                );
                sendConfirmation(chatId);
            }
        }

        return ResponseEntity.ok().build();
    }

    private void sendPhoneRequest(Long chatId) {
        String url = TELEGRAM_API_BASE + "/bot" + botToken + "/sendMessage";
        Map<String, Object> button = Map.of(
            "text", "📱 Compartir mi número",
            "request_contact", true
        );
        Map<String, Object> keyboard = Map.of(
            "keyboard", List.of(List.of(button)),
            "one_time_keyboard", true,
            "resize_keyboard", true
        );
        Map<String, Object> payload = Map.of(
            "chat_id", chatId,
            "text", "👋 Para recibir recordatorios de tus mentorías, comparte tu número:",
            "reply_markup", keyboard
        );
        try {
            restTemplate.postForEntity(url, payload, String.class);
        } catch (Exception ignored) {}
    }

    private void sendConfirmation(Long chatId) {
        String url = TELEGRAM_API_BASE + "/bot" + botToken + "/sendMessage";
        Map<String, Object> payload = Map.of(
            "chat_id", chatId,
            "text", "✅ ¡Listo! Recibirás recordatorios de tus mentorías por aquí."
        );
        try {
            restTemplate.postForEntity(url, payload, String.class);
        } catch (Exception ignored) {}
    }

    private Long extractChatId(Map<?, ?> message) {
        Object chatObj = message.get("chat");
        if (!(chatObj instanceof Map<?, ?> chat)) return null;
        Object idObj = chat.get("id");
        if (idObj instanceof Number n) return n.longValue();
        try { return Long.parseLong(idObj.toString()); }
        catch (NumberFormatException e) { return null; }
    }

    private String asText(Object value) {
        return value == null ? "" : value.toString();
    }
}