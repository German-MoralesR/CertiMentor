package com.mentoriasg4.payment_service.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePreferenceRequest {
    private String title;
    private BigDecimal price;
    private Long offerId;
    private Long studentId;
    private Long mentorId;
}
