package com.mentoriasg4.user_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailService(JavaMailSender mailSender,
                        @Value("${spring.mail.username}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    public void sendWelcomeEmail(String toEmail, String toName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("Bienvenido/a a CertiMentor");
        message.setText(
            "Hola " + toName + ",\n\n" +
            "Bienvenido/a a CertiMentor. Nos alegra tenerte en la plataforma.\n" +
            "Si tienes preguntas, puedes responder a este correo.\n\n" +
            "Saludos,\n" +
            "Equipo CertiMentor"
        );

        try {
            mailSender.send(message);
        } catch (Exception ex) {
            logger.warn("No se pudo enviar correo de bienvenida a {}", toEmail, ex);
        }
    }
}
