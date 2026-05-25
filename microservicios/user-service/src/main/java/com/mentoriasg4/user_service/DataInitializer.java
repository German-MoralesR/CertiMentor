package com.mentoriasg4.user_service;

import com.mentoriasg4.user_service.model.Rol;
import com.mentoriasg4.user_service.model.Solicitud;
import com.mentoriasg4.user_service.model.Usuario;
import com.mentoriasg4.user_service.repository.RolRepository;
import com.mentoriasg4.user_service.repository.SolicitudRepository;
import com.mentoriasg4.user_service.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private SolicitudRepository solicitudRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        
        if (rolRepository.count() == 0) {
            rolRepository.saveAll(List.of(
                new Rol(null, "ADMIN"),
                new Rol(null, "MENTOR"),
                new Rol(null, "ESTUDIANTE")
            ));
            System.out.println("Roles inicializados.");
        }

        if (usuarioRepository.count() == 0) {
            Rol rolAdmin = rolRepository.findById(1).orElseThrow();
            Rol rolMentor = rolRepository.findById(2).orElseThrow();
            Rol rolEstudiante = rolRepository.findById(3).orElseThrow();

            String defaultPassword = passwordEncoder.encode("123123");

            // 1. Admin (ID 1)
            Usuario admin = new Usuario();
            admin.setName("Administrador Principal");
            admin.setEmail("admin@mentorias.com");
            admin.setPassword(defaultPassword);
            admin.setRole(rolAdmin);
            admin.setProfileImage("https://randomuser.me/api/portraits/men/32.jpg");

            // 2. Mentores (IDs 2 al 5)
            Usuario mentor1 = new Usuario();
            mentor1.setName("Mentor Experto");
            mentor1.setEmail("mentor@mentorias.com");
            mentor1.setPassword(defaultPassword);
            mentor1.setRole(rolMentor);
            mentor1.setProfileImage("https://randomuser.me/api/portraits/men/45.jpg");
            mentor1.setDescription("Desarrollador con más de 10 años de experiencia construyendo aplicaciones escalables. Apasionado por la enseñanza y el código limpio.");

            Usuario mentor2 = new Usuario();
            mentor2.setName("Laura Gómez");
            mentor2.setEmail("laura@mentorias.com");
            mentor2.setPassword(defaultPassword);
            mentor2.setRole(rolMentor);
            mentor2.setProfileImage("https://randomuser.me/api/portraits/women/44.jpg");
            mentor2.setDescription("Especialista en interfaces de usuario y experiencia de usuario. Te ayudo a llevar tus diseños de Figma a código perfecto.");

            Usuario mentor3 = new Usuario();
            mentor3.setName("David Silva");
            mentor3.setEmail("david@mentorias.com");
            mentor3.setPassword(defaultPassword);
            mentor3.setRole(rolMentor);
            mentor3.setProfileImage("https://randomuser.me/api/portraits/men/67.jpg");
            mentor3.setDescription("Ingeniero DevOps y Arquitecto Cloud certificado en AWS. Experto en automatización, CI/CD y microservicios.");

            Usuario mentor4 = new Usuario();
            mentor4.setName("Ana Martínez");
            mentor4.setEmail("ana@mentorias.com");
            mentor4.setPassword(defaultPassword);
            mentor4.setRole(rolMentor);
            mentor4.setProfileImage("https://randomuser.me/api/portraits/women/68.jpg");
            mentor4.setDescription("Científica de datos con maestría en IA. Amo enseñar Python, Machine Learning y análisis de datos de forma sencilla.");

            // 3. Estudiantes (IDs 6 al 10)
            Usuario estudiante1 = new Usuario();
            estudiante1.setName("Estudiante Aplicado");
            estudiante1.setEmail("estudiante@mentorias.com");
            estudiante1.setPassword(defaultPassword);
            estudiante1.setRole(rolEstudiante);
            estudiante1.setProfileImage("https://randomuser.me/api/portraits/men/75.jpg");

            Usuario estudiante2 = new Usuario();
            estudiante2.setName("Carlos Rodríguez");
            estudiante2.setEmail("carlos@mentorias.com");
            estudiante2.setPassword(defaultPassword);
            estudiante2.setRole(rolEstudiante);
            estudiante2.setProfileImage("https://randomuser.me/api/portraits/men/90.jpg");

            Usuario estudiante3 = new Usuario();
            estudiante3.setName("Sofía Castro");
            estudiante3.setEmail("sofia@mentorias.com");
            estudiante3.setPassword(defaultPassword);
            estudiante3.setRole(rolEstudiante);
            estudiante3.setProfileImage("https://randomuser.me/api/portraits/women/79.jpg");

            Usuario estudiante4 = new Usuario();
            estudiante4.setName("Luis Rojas");
            estudiante4.setEmail("luis@mentorias.com");
            estudiante4.setPassword(defaultPassword);
            estudiante4.setRole(rolEstudiante);
            estudiante4.setProfileImage("https://randomuser.me/api/portraits/men/22.jpg");

            Usuario estudiante5 = new Usuario();
            estudiante5.setName("María Pinto");
            estudiante5.setEmail("maria@mentorias.com");
            estudiante5.setPassword(defaultPassword);
            estudiante5.setRole(rolEstudiante);
            estudiante5.setProfileImage("https://randomuser.me/api/portraits/women/12.jpg");

            usuarioRepository.saveAll(List.of(
                admin, mentor1, mentor2, mentor3, mentor4, 
                estudiante1, estudiante2, estudiante3, estudiante4, estudiante5
            ));

            Solicitud solicitud = new Solicitud();
            solicitud.setUser(estudiante2);
            solicitud.setType("MENTOR");
            solicitud.setStatus("PENDIENTE");
            solicitud.setCertificationCode("CERT-555");
            solicitud.setInstitution("Universidad de Prueba");
            solicitudRepository.save(solicitud);

            System.out.println("Usuarios de prueba de MentoríasG4 inicializados.");
        }
    }
}
