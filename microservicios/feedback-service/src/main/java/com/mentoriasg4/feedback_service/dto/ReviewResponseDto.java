package com.mentoriasg4.feedback_service.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponseDto {
    private Long id;
    private Long mentorId;
    private Long offerId;
    private Long studentId;
    private Long sessionId;
    private String userName; // Este es el campo inyectado externamente
    private int rating;
    private String comment;
    private LocalDateTime createdAt;
}