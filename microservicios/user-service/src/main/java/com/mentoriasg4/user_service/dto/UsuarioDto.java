package com.mentoriasg4.user_service.dto;

import com.mentoriasg4.user_service.model.Rol;
import lombok.Data;

@Data
public class UsuarioDto {
    private Long id;
    private String name;
    private String email;
    private String profileImage;
    private String description;
    private String status;
    private Rol role;
    private Boolean mentorRequest;
    private String certificationCode;
    private String institution;
    private String mentorRejectionReason;
}