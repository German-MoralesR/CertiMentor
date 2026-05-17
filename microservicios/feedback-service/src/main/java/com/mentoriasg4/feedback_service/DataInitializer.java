package com.mentoriasg4.feedback_service;

import com.mentoriasg4.feedback_service.model.Review;
import com.mentoriasg4.feedback_service.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private ReviewRepository repository;

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            Review review1 = new Review();
            review1.setMentorId(2L);
            review1.setStudentId(3L);
            review1.setRating(5);
            review1.setComment("Excelente sesión. Me ayudó a resolver un problema con React Hooks que llevaba días sin poder solucionar. Súper claro en sus explicaciones.");
            review1.setCreatedAt(LocalDateTime.now().minusDays(2));

            Review review2 = new Review();
            review2.setMentorId(2L);
            review2.setStudentId(3L);
            review2.setRating(5);
            review2.setComment("Muy profesional y paciente. Me explicó conceptos de TypeScript de forma muy didáctica. Definitivamente volveré a agendar con ella.");
            review2.setCreatedAt(LocalDateTime.now().minusDays(7));

            repository.saveAll(List.of(review1, review2));
            System.out.println("Reseñas de prueba inicializadas.");
        }
    }
}