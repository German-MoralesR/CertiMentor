package com.mentoriasg4.feedback_service.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDto {
    private Long id;
    private String name;
    private String nombre; // Soporta ambos nombres por si usas 'nombre' o 'name'
    private String email;
}