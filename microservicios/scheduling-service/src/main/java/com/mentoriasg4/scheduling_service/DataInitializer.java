package com.mentoriasg4.scheduling_service;

import com.mentoriasg4.scheduling_service.model.MentorshipSession;
import com.mentoriasg4.scheduling_service.repository.MentorshipSessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private MentorshipSessionRepository repository;

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            MentorshipSession session1 = new MentorshipSession();
            session1.setMentorId(2L);
            session1.setOfferId(1L);
            session1.setStudentId(6L); // Estudiante Aplicado
            session1.setMentorName("Mentor Experto");
            session1.setMentorImage("https://randomuser.me/api/portraits/men/45.jpg");
            session1.setOfferTitle("Senior Full Stack Developer");
            session1.setStudentImage("https://randomuser.me/api/portraits/men/75.jpg");
            session1.setTopic("Revisión de código React");
            session1.setDate("2026-05-14"); // En el futuro
            session1.setTime("10:00");
            session1.setDuration(30);
            session1.setPrice(15000.0);
            session1.setStatus("pendiente");

            MentorshipSession session2 = new MentorshipSession();
            session2.setMentorId(2L);
            session2.setOfferId(1L);
            session2.setStudentId(7L); // Carlos Rodríguez
            session2.setMentorName("Mentor Experto");
            session2.setMentorImage("https://randomuser.me/api/portraits/men/45.jpg");
            session2.setOfferTitle("Senior Full Stack Developer");
            session2.setStudentImage("https://randomuser.me/api/portraits/men/90.jpg");
            session2.setTopic("Dudas sobre Spring Boot");
            session2.setDate("2026-05-01"); // En el pasado
            session2.setTime("15:00");
            session2.setDuration(45);
            session2.setPrice(15000.0);
            session2.setStatus("completada");
            session2.setPlatformLink("https://zoom.us/j/123456789");

            MentorshipSession session3 = new MentorshipSession();
            session3.setMentorId(3L); // Laura Gómez
            session3.setOfferId(2L);
            session3.setStudentId(6L);
            session3.setMentorName("Laura Gómez");
            session3.setMentorImage("https://randomuser.me/api/portraits/women/44.jpg");
            session3.setOfferTitle("Especialista en Frontend (UX/UI)");
            session3.setStudentImage("https://randomuser.me/api/portraits/men/75.jpg");
            session3.setTopic("Auditoría de interfaz UI");
            session3.setDate("2026-05-20"); 
            session3.setTime("11:00");
            session3.setDuration(30);
            session3.setPrice(0.0);
            session3.setStatus("completada"); // Cambiada a completada para que coincida con la reseña
            session3.setPlatformLink("https://meet.google.com/abc-defg-hij");

            MentorshipSession session4 = new MentorshipSession();
            session4.setMentorId(4L); // David Silva
            session4.setOfferId(3L);
            session4.setStudentId(7L); // Carlos Rodríguez
            session4.setMentorName("David Silva");
            session4.setMentorImage("https://randomuser.me/api/portraits/men/67.jpg");
            session4.setOfferTitle("Arquitecto Cloud AWS");
            session4.setStudentImage("https://randomuser.me/api/portraits/men/90.jpg");
            session4.setTopic("Arquitectura en AWS");
            session4.setDate("2026-04-10"); 
            session4.setTime("19:00");
            session4.setDuration(60);
            session4.setPrice(25000.0);
            session4.setStatus("cancelada");

            MentorshipSession session5 = new MentorshipSession();
            session5.setMentorId(5L); // Ana Martínez
            session5.setOfferId(4L);
            session5.setStudentId(8L); // Sofía Castro
            session5.setMentorName("Ana Martínez");
            session5.setMentorImage("https://randomuser.me/api/portraits/women/68.jpg");
            session5.setOfferTitle("Data Scientist & Machine Learning");
            session5.setStudentImage("https://randomuser.me/api/portraits/women/79.jpg");
            session5.setTopic("Introducción a Machine Learning");
            session5.setDate("2026-05-05");
            session5.setTime("09:00");
            session5.setDuration(45);
            session5.setPrice(20000.0);
            session5.setStatus("completada");
            session5.setPlatformLink("https://zoom.us/j/987654321");

            MentorshipSession session6 = new MentorshipSession();
            session6.setMentorId(2L);
            session6.setOfferId(1L);
            session6.setStudentId(8L); // Sofía Castro
            session6.setMentorName("Mentor Experto");
            session6.setMentorImage("https://randomuser.me/api/portraits/men/45.jpg");
            session6.setOfferTitle("Senior Full Stack Developer");
            session6.setStudentImage("https://randomuser.me/api/portraits/women/79.jpg");
            session6.setTopic("Refactorización de Backend");
            session6.setDate("2026-04-20");
            session6.setTime("11:30");
            session6.setDuration(60);
            session6.setPrice(15000.0);
            session6.setStatus("completada");
            session6.setPlatformLink("https://zoom.us/j/1122334455");

            MentorshipSession session7 = new MentorshipSession();
            session7.setMentorId(3L);
            session7.setOfferId(6L);
            session7.setStudentId(9L); // Luis Rojas
            session7.setMentorName("Laura Gómez");
            session7.setMentorImage("https://randomuser.me/api/portraits/women/44.jpg");
            session7.setOfferTitle("React Intermedio - Avanzado");
            session7.setStudentImage("https://randomuser.me/api/portraits/men/22.jpg");
            session7.setTopic("Manejo de estados con Context API");
            session7.setDate("2026-05-25");
            session7.setTime("16:00");
            session7.setDuration(30);
            session7.setPrice(10000.0);
            session7.setStatus("pendiente");

            MentorshipSession session8 = new MentorshipSession();
            session8.setMentorId(4L);
            session8.setOfferId(7L);
            session8.setStudentId(10L); // María Pinto
            session8.setMentorName("David Silva");
            session8.setMentorImage("https://randomuser.me/api/portraits/men/67.jpg");
            session8.setOfferTitle("DevOps Essentials");
            session8.setStudentImage("https://randomuser.me/api/portraits/women/12.jpg");
            session8.setTopic("Dudas sobre CI/CD con Jenkins");
            session8.setDate("2026-05-10");
            session8.setTime("13:00");
            session8.setDuration(45);
            session8.setPrice(18000.0);
            session8.setStatus("completada");
            session8.setPlatformLink("https://meet.google.com/xyz-abcd-efg");

            MentorshipSession session9 = new MentorshipSession();
            session9.setMentorId(3L); // Laura Gómez
            session9.setOfferId(6L);
            session9.setStudentId(10L); // María Pinto
            session9.setMentorName("Laura Gómez");
            session9.setMentorImage("https://randomuser.me/api/portraits/women/44.jpg");
            session9.setOfferTitle("React Intermedio - Avanzado");
            session9.setStudentImage("https://randomuser.me/api/portraits/women/12.jpg");
            session9.setTopic("Revisión de mi proyecto final de React.");
            session9.setDate("2026-05-20"); // Past date
            session9.setTime("17:00");
            session9.setDuration(60);
            session9.setPrice(10000.0);
            session9.setStatus("aprobada");
            session9.setPlatformLink("https://meet.google.com/lmn-opqr-stu");

            MentorshipSession session10 = new MentorshipSession();
            session10.setMentorId(4L); // David Silva
            session10.setOfferId(7L);
            session10.setStudentId(6L); // Estudiante Aplicado
            session10.setMentorName("David Silva");
            session10.setMentorImage("https://randomuser.me/api/portraits/men/67.jpg");
            session10.setOfferTitle("DevOps Essentials");
            session10.setStudentImage("https://randomuser.me/api/portraits/men/75.jpg");
            session10.setTopic("¿Cómo dockerizar una aplicación de Node.js?");
            session10.setDate("2026-05-21"); // Past date
            session10.setTime("11:00");
            session10.setDuration(45);
            session10.setPrice(18000.0);
            session10.setStatus("esperando_confirmacion");
            session10.setPlatformLink("https://meet.google.com/vwx-yzab-cde");

            MentorshipSession session11 = new MentorshipSession();
            session11.setMentorId(5L); // Ana Martínez
            session11.setOfferId(4L);
            session11.setStudentId(7L); // Carlos Rodríguez
            session11.setMentorName("Ana Martínez");
            session11.setMentorImage("https://randomuser.me/api/portraits/women/68.jpg");
            session11.setOfferTitle("Data Scientist & Machine Learning");
            session11.setTopic("El mentor no se presentó a la sesión.");
            session11.setDate("2026-05-18"); // Past date
            session11.setTime("10:00");
            session11.setDuration(30);
            session11.setPrice(20000.0);
            session11.setStatus("disputada");
            session11.setPlatformLink("https://meet.google.com/fgh-ijkl-mno");

            // Sesión "trampa" en el pasado para probar el botón "Finalizar"
            MentorshipSession session12 = new MentorshipSession();
            session12.setMentorId(2L); // Mentor Experto (mentor@mentorias.com)
            session12.setOfferId(1L);
            session12.setStudentId(6L); // Estudiante Aplicado (estudiante@mentorias.com)
            session12.setMentorName("Mentor Experto");
            session12.setMentorImage("https://randomuser.me/api/portraits/men/45.jpg");
            session12.setOfferTitle("Senior Full Stack Developer");
            session12.setStudentImage("https://randomuser.me/api/portraits/men/75.jpg");
            session12.setTopic("Revisión de flujo de pagos (Prueba)");
            session12.setDate("2026-05-15"); // Fecha intencionalmente en el pasado
            session12.setTime("10:00");
            session12.setDuration(30);
            session12.setPrice(15000.0);
            session12.setStatus("aprobada");
            session12.setPlatformLink("https://meet.google.com/test-flow");

            repository.saveAll(List.of(
                session1, session2, session3, session4, 
                session5, session6, session7, session8,
                session9, session10, session11, session12
            ));
            System.out.println("Sesiones de prueba inicializadas.");
        }
    }
}