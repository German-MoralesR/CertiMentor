package com.mentoriasg4.scheduling_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class TelegramService {

    private static final String TELEGRAM_API_BASE = "https://api.telegram.org";

    private final RestTemplate restTemplate;

    @Value("${telegram.bot.token:}")
    private String botToken;

    public TelegramService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public boolean sendMessageToPhone(String phoneNumber, String message) {
        if (phoneNumber == null || phoneNumber.isBlank()) {
            return false;
        }
        if (botToken == null || botToken.isBlank()) {
            return false;
        }
        Long chatId = resolveChatIdByPhone(phoneNumber);
        if (chatId == null) {
            return false;
        }
        String url = TELEGRAM_API_BASE + "/bot" + botToken + "/sendMessage";
        Map<String, Object> payload = Map.of(
            "chat_id", chatId,
            "text", message
        );
        try {
            restTemplate.postForEntity(url, payload, String.class);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private Long resolveChatIdByPhone(String phoneNumber) {
        String normalizedTarget = normalizePhone(phoneNumber);
        if (normalizedTarget.isEmpty()) {
            return null;
        }
        String url = TELEGRAM_API_BASE + "/bot" + botToken + "/getUpdates?limit=100";
        try {
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            if (response == null) {
                return null;
            }
            Object result = response.get("result");
            if (!(result instanceof List<?> updates)) {
                return null;
            }
            for (int i = updates.size() - 1; i >= 0; i--) {
                Object updateObj = updates.get(i);
                if (!(updateObj instanceof Map<?, ?> update)) {
                    continue;
                }
                Object messageObj = update.get("message");
                if (!(messageObj instanceof Map<?, ?> message)) {
                    continue;
                }
                Long chatId = extractChatId(message);
                if (chatId == null) {
                    continue;
                }
                String contactPhone = extractContactPhone(message);
                if (!contactPhone.isEmpty() && normalizePhone(contactPhone).equals(normalizedTarget)) {
                    return chatId;
                }
                String text = asText(message.get("text"));
                String normalizedText = normalizePhone(text);
                if (!normalizedText.isEmpty() && normalizedText.equals(normalizedTarget)) {
                    return chatId;
                }
            }
        } catch (Exception ex) {
            return null;
        }
        return null;
    }

    private Long extractChatId(Map<?, ?> message) {
        Object chatObj = message.get("chat");
        if (!(chatObj instanceof Map<?, ?> chat)) {
            return null;
        }
        Object idObj = chat.get("id");
        if (idObj instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(asText(idObj));
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private String extractContactPhone(Map<?, ?> message) {
        Object contactObj = message.get("contact");
        if (!(contactObj instanceof Map<?, ?> contact)) {
            return "";
        }
        return asText(contact.get("phone_number"));
    }

    private String normalizePhone(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("\\D", "");
    }

    private String asText(Object value) {
        return value == null ? "" : value.toString();
    }
}
