package com.mentoriasg4.user_service.dto;

import lombok.Data;

@Data
public class RegisterDto {
    private String name;
    private String email;
    private String phoneNumber;
    private String password;
    private Boolean mentorRequest;
    private String certificationCode;
    private String institution;
}