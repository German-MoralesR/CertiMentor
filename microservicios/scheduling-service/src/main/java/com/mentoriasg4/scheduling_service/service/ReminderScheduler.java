package com.mentoriasg4.scheduling_service.service;

import com.mentoriasg4.scheduling_service.dto.UserInfo;
import com.mentoriasg4.scheduling_service.model.MentorshipSession;
import com.mentoriasg4.scheduling_service.repository.MentorshipSessionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;

@Component
public class ReminderScheduler {

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FORMAT = DateTimeFormatter.ofPattern("H:mm");

    private final MentorshipSessionRepository repository;
    private final UserServiceClient userServiceClient;

    @Value("${reminders.window-hours:8}")
    private long reminderWindowHours;

    @Value("${reminders.timezone:America/Santiago}")
    private String reminderTimezone;

    @Value("${internal.service.token}")
    private String internalToken;

    @Value("${notifications.service.url:http://localhost:8085}")
    private String notificationsServiceUrl;

    public ReminderScheduler(
        MentorshipSessionRepository repository,
        UserServiceClient userServiceClient
    ) {
        this.repository = repository;
        this.userServiceClient = userServiceClient;
    }

    @Scheduled(fixedDelayString = "${reminders.poll-ms:60000}")
    public void sendUpcomingSessionReminders() {
        List<MentorshipSession> sessions = repository.findByStatusIgnoreCaseIn(List.of("pendiente", "aprobada"));
        if (sessions.isEmpty()) {
            return;
        }

        ZoneId zoneId = ZoneId.of(reminderTimezone);
        ZonedDateTime now = ZonedDateTime.now(zoneId);
        ZonedDateTime windowEnd = now.plusHours(reminderWindowHours);

        for (MentorshipSession session : sessions) {
            ZonedDateTime sessionDateTime = parseSessionDateTime(session, zoneId);
            if (sessionDateTime == null) {
                continue;
            }
            if (sessionDateTime.isBefore(now) || sessionDateTime.isAfter(windowEnd)) {
                continue;
            }

            boolean updated = false;
            UserInfo mentor = null;
            UserInfo student = null;

            if (!session.isMentorReminderSent()) {
                mentor = userServiceClient.getUserById(session.getMentorId());
                student = userServiceClient.getUserById(session.getStudentId());
                if (sendReminderToUser(mentor, student, session)) {
                    session.setMentorReminderSent(true);
                    updated = true;
                }
            }

            if (!session.isStudentReminderSent()) {
                if (student == null) {
                    student = userServiceClient.getUserById(session.getStudentId());
                }
                if (mentor == null) {
                    mentor = userServiceClient.getUserById(session.getMentorId());
                }
                if (sendReminderToUser(student, mentor, session)) {
                    session.setStudentReminderSent(true);
                    updated = true;
                }
            }

            if (updated) {
                repository.save(session);
            }
        }
    }

    private boolean sendReminderToUser(UserInfo recipient, UserInfo counterpart, MentorshipSession session) {
        if (recipient == null || recipient.getPhoneNumber() == null || recipient.getPhoneNumber().isBlank()) {
            return false;
        }
        String message = buildMessage(recipient, counterpart, session);
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("X-Service-Token", internalToken);
            
            Map<String, String> body = Map.of("phoneNumber", recipient.getPhoneNumber(), "message", message);
            restTemplate.postForEntity(notificationsServiceUrl + "/api/notifications/telegram/send", new HttpEntity<>(body, headers), Void.class);
            return true;
        } catch (Exception e) { return false; }
    }

    private String buildMessage(UserInfo recipient, UserInfo counterpart, MentorshipSession session) {
        String recipientName = recipient != null && recipient.getName() != null
            ? recipient.getName()
            : "";
        String counterpartName = counterpart != null && counterpart.getName() != null
            ? counterpart.getName()
            : "";
        String schedule = session.getDate() + " " + session.getTime();
        String link = session.getPlatformLink();
        String base = "Hola " + recipientName + ", recordatorio: tu mentoria \""
            + session.getTopic() + "\" con " + counterpartName + " es el " + schedule + ".";
        if (link != null && !link.isBlank()) {
            return base + " Enlace: " + link;
        }
        return base;
    }

    private ZonedDateTime parseSessionDateTime(MentorshipSession session, ZoneId zoneId) {
        if (session.getDate() == null || session.getTime() == null) {
            return null;
        }
        try {
            LocalDate date = LocalDate.parse(session.getDate(), DATE_FORMAT);
            LocalTime time = LocalTime.parse(session.getTime(), TIME_FORMAT);
            return ZonedDateTime.of(date, time, zoneId);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }
}
