package com.mentoriasg4.feedback_service.dto;

import lombok.Data;

@Data
public class UserDto {
    private Long id;
    private String name;
    private String nombre; // Soporta ambos nombres por si usas 'nombre' o 'name'
    private String email;
    private String role;
}