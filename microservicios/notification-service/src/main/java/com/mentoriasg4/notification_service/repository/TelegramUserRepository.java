package com.mentoriasg4.notification_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mentoriasg4.notification_service.model.TelegramUser;

import java.util.Optional;

public interface TelegramUserRepository extends JpaRepository<TelegramUser, Long> {
    Optional<TelegramUser> findByPhoneNumber(String phoneNumber);
}