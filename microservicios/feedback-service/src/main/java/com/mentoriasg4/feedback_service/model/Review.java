package com.mentoriasg4.feedback_service.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long mentorId;
    
    private Long studentId;
    
    // Opcional por ahora: ID de la sesión específica que se está reseñando
    private Long sessionId;
    
    private int rating; // Ej: 1 a 5
    
    @Column(length = 1000)
    private String comment;

    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}