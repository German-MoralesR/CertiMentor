package com.mentoriasg4.scheduling_service.service;

import com.mentoriasg4.scheduling_service.dto.UserInfo;
import com.mentoriasg4.scheduling_service.model.MentorshipSession;
import com.mentoriasg4.scheduling_service.repository.MentorshipSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
public class MentorshipSessionService {

    @Autowired
    private MentorshipSessionRepository repository;
    
    @Autowired
    private UserServiceClient userServiceClient;

    @Value("${notification.service.url:http://localhost:8085}")
    private String notificationServiceUrl;

    // Método interno para notificar al user-service
    private void sendEmailNotification(String endpoint, MentorshipSession session, String reason) {
        CompletableFuture.runAsync(() -> {
            try {
                UserInfo student = userServiceClient.getUserById(session.getStudentId());
                UserInfo mentor = userServiceClient.getUserById(session.getMentorId());

                if (student == null || mentor == null) return;

                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("X-Service-Token", "TokenSecretoInternoMentoriasG4"); // Usamos el token definido en config

                Map<String, Object> body = new HashMap<>();
                body.put("studentEmail", student.getEmail());
                body.put("studentName", student.getName());
                body.put("mentorEmail", mentor.getEmail());
                body.put("mentorName", mentor.getName());
                body.put("date", session.getDate());
                body.put("time", session.getTime());
                if (reason != null) body.put("reason", reason);

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
                restTemplate.postForEntity(notificationServiceUrl + "/api/notifications/email/" + endpoint, request, Void.class);
            } catch (Exception e) {
                System.err.println("No se pudo conectar al user-service para enviar correos: " + e.getMessage());
            }
        });
    }

    public List<MentorshipSession> getAllSessions() {
        return repository.findAll();
    }

    public List<MentorshipSession> getSessionsByMentorId(Long mentorId) {
        return repository.findByMentorId(mentorId);
    }

    public List<MentorshipSession> getSessionsByStudentId(Long studentId) {
        return repository.findByStudentId(studentId);
    }

    public Optional<MentorshipSession> getSessionById(Long id) {
        return repository.findById(id);
    }

    public MentorshipSession createSession(MentorshipSession session) {
        MentorshipSession savedSession = repository.save(session);
        
        // Disparamos la notificación de reserva (asíncronamente sería ideal, pero lo hacemos sincrónico para simplicidad)
        sendEmailNotification("booking", savedSession, null);
        
        return savedSession;
    }

    public MentorshipSession updateSession(Long id, MentorshipSession updatedSession) {
        return repository.findById(id).map(session -> {
            boolean wasCanceled = "cancelada".equals(updatedSession.getStatus()) && !"cancelada".equals(session.getStatus());
            
            session.setStatus(updatedSession.getStatus());
            session.setPlatformLink(updatedSession.getPlatformLink());
            
            if (updatedSession.getCancelReason() != null) {
                session.setCancelReason(updatedSession.getCancelReason());
            }
            
            if (wasCanceled) {
                sendEmailNotification("cancellation", session, updatedSession.getCancelReason());
            }
            
            return repository.save(session);
        }).orElseThrow(() -> new RuntimeException("Session not found with id: " + id));
    }

    public void deleteSession(Long id) {
        repository.deleteById(id);
    }
}