package com.mentoriasg4.scheduling_service;

import com.mentoriasg4.scheduling_service.model.MentorshipSession;
import com.mentoriasg4.scheduling_service.repository.MentorshipSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MentorshipSessionRepository repository;

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            MentorshipSession session1 = new MentorshipSession();
            session1.setMentorId(2L);
            session1.setOfferId(1L);
            session1.setStudentId(6L); // Estudiante Aplicado
            session1.setMentorName("Mentor Experto");
            session1.setStudentName("Estudiante Aplicado");
            session1.setStudentImage("https://randomuser.me/api/portraits/men/75.jpg");
            session1.setTopic("Revisión de código React");
            session1.setDate("2026-05-14"); // En el futuro
            session1.setTime("10:00");
            session1.setDuration(30);
            session1.setPrice(15000.0);
            session1.setStatus("pendiente");

            MentorshipSession session2 = new MentorshipSession();
            session2.setMentorId(2L);
            session2.setOfferId(1L);
            session2.setStudentId(6L);
            session2.setMentorName("Mentor Experto");
            session2.setStudentName("Estudiante Aplicado");
            session2.setStudentImage("https://randomuser.me/api/portraits/men/75.jpg");
            session2.setTopic("Dudas sobre Spring Boot");
            session2.setDate("2026-05-01"); // En el pasado
            session2.setTime("15:00");
            session2.setDuration(45);
            session2.setPrice(15000.0);
            session2.setStatus("completada");
            session2.setPlatformLink("https://zoom.us/j/123456789");

            MentorshipSession session3 = new MentorshipSession();
            session3.setMentorId(3L); // Laura Gómez
            session3.setOfferId(2L);
            session3.setStudentId(6L);
            session3.setMentorName("Laura Gómez");
            session3.setStudentName("Estudiante Aplicado");
            session3.setStudentImage("https://randomuser.me/api/portraits/men/75.jpg");
            session3.setTopic("Auditoría de interfaz UI");
            session3.setDate("2026-05-20"); 
            session3.setTime("11:00");
            session3.setDuration(30);
            session3.setPrice(0.0);
            session3.setStatus("aprobada");
            session3.setPlatformLink("https://meet.google.com/abc-defg-hij");

            MentorshipSession session4 = new MentorshipSession();
            session4.setMentorId(4L); // David Silva
            session4.setOfferId(3L);
            session4.setStudentId(7L); // Carlos Rodríguez
            session4.setMentorName("David Silva");
            session4.setStudentName("Carlos Rodríguez");
            session4.setStudentImage("https://randomuser.me/api/portraits/men/90.jpg");
            session4.setTopic("Arquitectura en AWS");
            session4.setDate("2026-04-10"); 
            session4.setTime("19:00");
            session4.setDuration(60);
            session4.setPrice(25000.0);
            session4.setStatus("cancelada");

            repository.saveAll(List.of(session1, session2, session3, session4));
            System.out.println("Sesiones de prueba inicializadas.");
        }
    }
}