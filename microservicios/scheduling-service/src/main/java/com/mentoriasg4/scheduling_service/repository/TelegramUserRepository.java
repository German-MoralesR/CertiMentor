package com.mentoriasg4.scheduling_service.repository;

import com.mentoriasg4.scheduling_service.model.TelegramUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TelegramUserRepository extends JpaRepository<TelegramUser, Long> {
    Optional<TelegramUser> findByPhoneNumber(String phoneNumber);
}