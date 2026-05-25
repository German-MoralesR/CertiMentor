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
            review1.setOfferId(1L); // Corresponde a la Session 2 (Completada)
            review1.setStudentId(7L); // Carlos Rodríguez
            review1.setRating(5);
            review1.setComment("Excelente sesión. Me ayudó a resolver un problema con React Hooks que llevaba días sin poder solucionar. Súper claro en sus explicaciones.");
            review1.setCreatedAt(LocalDateTime.now().minusDays(2));

            Review review2 = new Review();
            review2.setMentorId(2L);
            review2.setOfferId(1L);
            review2.setStudentId(8L); // Sofía Castro (Corresponde a Session 6)
            review2.setRating(4);
            review2.setComment("La refactorización del backend fue exitosa. Muy profesional y paciente. Definitivamente volveré a agendar.");
            review2.setCreatedAt(LocalDateTime.now().minusDays(7));

            Review review3 = new Review();
            review3.setMentorId(3L); 
            review3.setOfferId(2L); 
            review3.setStudentId(6L); // Estudiante Aplicado (Corresponde a Session 3)
            review3.setRating(5);
            review3.setComment("Me encantó la mentoría. Arreglamos todo el diseño UX de mi portafolio. ¡Recomendadísima!");
            review3.setCreatedAt(LocalDateTime.now().minusDays(10));

            Review review4 = new Review();
            review4.setMentorId(5L); 
            review4.setOfferId(4L);
            review4.setStudentId(8L); // Sofía
            review4.setRating(4);
            review4.setComment("Muy buena introducción a Machine Learning y Pandas. Me quedó todo mucho más claro.");
            review4.setCreatedAt(LocalDateTime.now().minusDays(15));

            Review review5 = new Review();
            review5.setMentorId(4L); 
            review5.setOfferId(7L);
            review5.setStudentId(10L); // María Pinto (Corresponde a Session 8)
            review5.setRating(5);
            review5.setComment("Configurar Jenkins parecía imposible, pero David lo hizo ver súper fácil. Gran mentor de DevOps.");
            review5.setCreatedAt(LocalDateTime.now().minusDays(3));

            repository.saveAll(List.of(review1, review2, review3, review4, review5));
            System.out.println("Reseñas de prueba inicializadas.");
        }
    }
}