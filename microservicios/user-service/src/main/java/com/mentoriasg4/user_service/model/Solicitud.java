package com.mentoriasg4.user_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
    private Usuario user;

    private String type; // Ejemplo: "MENTOR"

    private String status; // "PENDIENTE", "APROBADA", "RECHAZADA"

    private String certificationCode;

    private String institution;

    private String rejectionReason;

    private LocalDateTime createdAt = LocalDateTime.now();
}