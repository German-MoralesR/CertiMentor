package com.mentoriasg4.notification_service.service;

import com.mentoriasg4.notification_service.repository.TelegramUserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class TelegramService {

    private static final String TELEGRAM_API_BASE = "https://api.telegram.org";

    private final RestTemplate restTemplate;
    private final TelegramUserRepository telegramUserRepository;

    @Value("${telegram.bot.token:}")
    private String botToken;

    public TelegramService(RestTemplate restTemplate,
                           TelegramUserRepository telegramUserRepository) {
        this.restTemplate = restTemplate;
        this.telegramUserRepository = telegramUserRepository;
    }

    public boolean sendMessageToPhone(String phoneNumber, String message) {
        if (phoneNumber == null || phoneNumber.isBlank()) return false;
        if (botToken == null || botToken.isBlank()) return false;

        Long chatId = resolveChatIdByPhone(phoneNumber);
        if (chatId == null) return false;

        String url = TELEGRAM_API_BASE + "/bot" + botToken + "/sendMessage";
        Map<String, Object> payload = Map.of("chat_id", chatId, "text", message);
        try {
            restTemplate.postForEntity(url, payload, String.class);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    private Long resolveChatIdByPhone(String phoneNumber) {
        String normalized = phoneNumber.replaceAll("\\D", "");
        if (normalized.isBlank()) return null;
        return telegramUserRepository.findByPhoneNumber(normalized)
            .map(u -> u.getChatId())
            .orElse(null);
    }
}