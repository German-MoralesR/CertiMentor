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
            MentorshipOffer offer1 = new MentorshipOffer();
            offer1.setMentorId(2L); // 2L corresponde a "Mentor Experto" en tu user-service
            offer1.setMentorName("Mentor Experto");
            offer1.setTitle("Senior Full Stack Developer");
            offer1.setImage("https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&q=80&w=300&h=300");
            offer1.setPrice(15000);
            offer1.setSessionsCompleted(12);
            offer1.setRating(4.9);
            offer1.setReviews(8);
            offer1.setTimeStart("09:00");
            offer1.setTimeEnd("17:00");
            offer1.setAvailability("Disponible hoy");
            offer1.setSkills(List.of("React", "Node.js", "Java", "Spring Boot"));
            offer1.setAvailableDates(List.of("2026-05-15", "2026-05-16", "2026-05-17"));

            MentorshipOffer offer2 = new MentorshipOffer();
            offer2.setMentorId(2L);
            offer2.setMentorName("Mentor Experto");
            offer2.setTitle("Especialista en Frontend (UX/UI)");
            offer2.setImage("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300&h=300");
            offer2.setPrice(0);
            offer2.setSessionsCompleted(45);
            offer2.setRating(5.0);
            offer2.setReviews(32);
            offer2.setTimeStart("10:00");
            offer2.setTimeEnd("14:00");
            offer2.setAvailability("Próxima semana");
            offer2.setSkills(List.of("Figma", "CSS", "Tailwind", "UX Design"));
            offer2.setAvailableDates(List.of("2026-05-20", "2026-05-21"));

            repository.saveAll(List.of(offer1, offer2));
            System.out.println("Avisos de mentoría de prueba inicializados.");
        }
    }
}