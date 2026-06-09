package com.mentoriasg4.scheduling_service.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "telegram_users")
@Data
@NoArgsConstructor
public class TelegramUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String phoneNumber; // normalizado: solo dígitos

    @Column(unique = true, nullable = false)
    private Long chatId;

    public TelegramUser(String phoneNumber, Long chatId) {
        this.phoneNumber = phoneNumber;
        this.chatId = chatId;
    }
}