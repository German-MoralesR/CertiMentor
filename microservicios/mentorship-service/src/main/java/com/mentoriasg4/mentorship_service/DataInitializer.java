package com.mentoriasg4.mentorship_service;

import com.mentoriasg4.mentorship_service.model.MentorshipOffer;
import com.mentoriasg4.mentorship_service.repository.MentorshipOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MentorshipOfferRepository repository;

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            // Mentor 1 (ID 2)
            MentorshipOffer offer1 = new MentorshipOffer();
            offer1.setMentorId(2L); 
            offer1.setMentorName("Mentor Experto");
            offer1.setTitle("Senior Full Stack Developer");
            offer1.setImage("https://picsum.photos/seed/mentoring/800/600");
            offer1.setPrice(15000);
            offer1.setSessionsCompleted(12);
            offer1.setRating(4.9);
            offer1.setReviews(8);
            offer1.setTimeStart("09:00");
            offer1.setTimeEnd("17:00");
            offer1.setAvailability("Disponible hoy");
            offer1.setStatus("activa");
            offer1.setSkills(List.of("React", "Node.js", "Java", "Spring Boot"));
            offer1.setAvailableDates(List.of("2026-05-15", "2026-05-16", "2026-05-17"));

            MentorshipOffer offer2 = new MentorshipOffer();
            offer2.setMentorId(3L);
            offer2.setMentorName("Laura Gómez");
            offer2.setTitle("Especialista en Frontend (UX/UI)");
            offer2.setImage("https://picsum.photos/seed/code/800/600");
            offer2.setPrice(0);
            offer2.setSessionsCompleted(45);
            offer2.setRating(5.0);
            offer2.setReviews(32);
            offer2.setTimeStart("10:00");
            offer2.setTimeEnd("14:00");
            offer2.setAvailability("Próxima semana");
            offer2.setStatus("activa");
            offer2.setSkills(List.of("Figma", "CSS", "Tailwind", "UX Design"));
            offer2.setAvailableDates(List.of("2026-05-20", "2026-05-21"));

            MentorshipOffer offer3 = new MentorshipOffer();
            offer3.setMentorId(4L);
            offer3.setMentorName("David Silva");
            offer3.setTitle("Arquitecto Cloud AWS");
            offer3.setImage("https://picsum.photos/seed/programming/800/600");
            offer3.setPrice(25000);
            offer3.setSessionsCompleted(5);
            offer3.setRating(4.8);
            offer3.setReviews(5);
            offer3.setTimeStart("18:00");
            offer3.setTimeEnd("22:00");
            offer3.setAvailability("Fines de semana");
            offer3.setStatus("activa");
            offer3.setSkills(List.of("AWS", "Docker", "Kubernetes", "DevOps"));
            offer3.setAvailableDates(List.of("2026-05-23", "2026-05-24"));

            MentorshipOffer offer4 = new MentorshipOffer();
            offer4.setMentorId(5L);
            offer4.setMentorName("Ana Martínez");
            offer4.setTitle("Data Scientist & Machine Learning");
            offer4.setImage("https://picsum.photos/seed/developer/800/600");
            offer4.setPrice(20000);
            offer4.setSessionsCompleted(18);
            offer4.setRating(4.9);
            offer4.setReviews(14);
            offer4.setTimeStart("08:00");
            offer4.setTimeEnd("12:00");
            offer4.setAvailability("Disponible mañana");
            offer4.setStatus("activa");
            offer4.setSkills(List.of("Python", "Pandas", "Machine Learning", "SQL"));
            offer4.setAvailableDates(List.of("2026-05-16", "2026-05-18", "2026-05-20"));

            MentorshipOffer offer5 = new MentorshipOffer();
            offer5.setMentorId(2L);
            offer5.setMentorName("Mentor Experto");
            offer5.setTitle("Bases de Datos Avanzadas");
            offer5.setImage("https://picsum.photos/seed/javascript/800/600");
            offer5.setPrice(12000);
            offer5.setSessionsCompleted(3);
            offer5.setRating(5.0);
            offer5.setReviews(2);
            offer5.setTimeStart("14:00");
            offer5.setTimeEnd("18:00");
            offer5.setAvailability("Solo tardes");
            offer5.setStatus("eliminada"); // Una oferta eliminada de prueba
            offer5.setSkills(List.of("PostgreSQL", "MongoDB", "Redis"));
            offer5.setAvailableDates(List.of("2026-05-19"));

            repository.saveAll(List.of(offer1, offer2, offer3, offer4, offer5));
            System.out.println("Avisos de mentoría de prueba inicializados.");
        }
    }
}