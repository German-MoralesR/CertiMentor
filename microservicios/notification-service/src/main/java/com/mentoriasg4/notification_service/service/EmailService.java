package com.mentoriasg4.notification_service.service;

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

    public void sendBookingStudentEmail(String toEmail, String toName, String mentorName, String date, String time) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("✅ Sesión Agendada Exitosamente - CertiMentor");
        message.setText("Hola " + toName + ",\n\n" +
            "Tu sesión de mentoría con " + mentorName + " ha sido agendada.\n" +
            "El mentor revisará la solicitud y te confirmará pronto.\n\n" +
            "📅 Fecha: " + date + "\n" +
            "⏰ Hora: " + time + "\n\n" +
            "Puedes revisar el estado de tu sesión en tu panel de estudiante.\n\n" +
            "Saludos,\nEquipo CertiMentor");

        try {
            mailSender.send(message);
        } catch (Exception ex) {
            logger.warn("No se pudo enviar correo de reserva al estudiante {}", toEmail, ex);
        }
    }

    public void sendBookingMentorEmail(String toEmail, String mentorName, String studentName, String date, String time) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("🔔 Nueva Reserva de Mentoría - CertiMentor");
        message.setText("Hola " + mentorName + ",\n\n" +
            "¡Tienes una nueva solicitud de mentoría!\n" +
            "El estudiante " + studentName + " ha agendado una sesión contigo.\n\n" +
            "📅 Fecha: " + date + "\n" +
            "⏰ Hora: " + time + "\n\n" +
            "Por favor, ingresa a tu Dashboard para aprobar la sesión y proporcionar el link de la videollamada.\n\n" +
            "Saludos,\nEquipo CertiMentor");

        try {
            mailSender.send(message);
        } catch (Exception ex) {
            logger.warn("No se pudo enviar correo de notificación al mentor {}", toEmail, ex);
        }
    }

    public void sendCancellationEmail(String toEmail, String toName, String sessionDate, String reason) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(toEmail);
        message.setSubject("❌ Sesión Cancelada - CertiMentor");
        message.setText("Hola " + toName + ",\n\n" +
            "Te informamos que la sesión de mentoría programada para el " + sessionDate + " ha sido cancelada.\n\n" +
            (reason != null && !reason.isBlank() ? "Razón indicada: " + reason + "\n\n" : "") +
            "Si fue un error o necesitas reagendar, por favor coordina una nueva sesión desde la plataforma.\n\n" +
            "Saludos,\nEquipo CertiMentor");

        try {
            mailSender.send(message);
        } catch (Exception ex) {
            logger.warn("No se pudo enviar correo de cancelación a {}", toEmail, ex);
        }
    }
}
