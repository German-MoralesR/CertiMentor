package com.mentoriasg4.user_service;

import com.mentoriasg4.user_service.model.Rol;
import com.mentoriasg4.user_service.model.Usuario;
import com.mentoriasg4.user_service.repository.RolRepository;
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

            String defaultPassword = passwordEncoder.encode("123456");

            // 1. Admin (ID 1)
            Usuario admin = new Usuario();
            admin.setNombre("Administrador Principal");
            admin.setEmail("admin@mentorias.com");
            admin.setPassword(defaultPassword);
            admin.setRol(rolAdmin);
            admin.setProfileImage("https://randomuser.me/api/portraits/men/32.jpg");

            // 2. Mentores (IDs 2 al 5)
            Usuario mentor1 = new Usuario();
            mentor1.setNombre("Mentor Experto");
            mentor1.setEmail("mentor@mentorias.com");
            mentor1.setPassword(defaultPassword);
            mentor1.setRol(rolMentor);
            mentor1.setProfileImage("https://randomuser.me/api/portraits/men/45.jpg");

            Usuario mentor2 = new Usuario();
            mentor2.setNombre("Laura Gómez");
            mentor2.setEmail("laura@mentorias.com");
            mentor2.setPassword(defaultPassword);
            mentor2.setRol(rolMentor);
            mentor2.setProfileImage("https://randomuser.me/api/portraits/women/44.jpg");

            Usuario mentor3 = new Usuario();
            mentor3.setNombre("David Silva");
            mentor3.setEmail("david@mentorias.com");
            mentor3.setPassword(defaultPassword);
            mentor3.setRol(rolMentor);
            mentor3.setProfileImage("https://randomuser.me/api/portraits/men/67.jpg");

            Usuario mentor4 = new Usuario();
            mentor4.setNombre("Ana Martínez");
            mentor4.setEmail("ana@mentorias.com");
            mentor4.setPassword(defaultPassword);
            mentor4.setRol(rolMentor);
            mentor4.setProfileImage("https://randomuser.me/api/portraits/women/68.jpg");

            // 3. Estudiantes (IDs 6 al 10)
            Usuario estudiante1 = new Usuario();
            estudiante1.setNombre("Estudiante Aplicado");
            estudiante1.setEmail("estudiante@mentorias.com");
            estudiante1.setPassword(defaultPassword);
            estudiante1.setRol(rolEstudiante);
            estudiante1.setProfileImage("https://randomuser.me/api/portraits/men/75.jpg");

            Usuario estudiante2 = new Usuario();
            estudiante2.setNombre("Carlos Rodríguez");
            estudiante2.setEmail("carlos@mentorias.com");
            estudiante2.setPassword(defaultPassword);
            estudiante2.setRol(rolEstudiante);
            estudiante2.setMentorRequest(true); // ¡Pide ser mentor!
            estudiante2.setProfileImage("https://randomuser.me/api/portraits/men/90.jpg");

            Usuario estudiante3 = new Usuario();
            estudiante3.setNombre("Sofía Castro");
            estudiante3.setEmail("sofia@mentorias.com");
            estudiante3.setPassword(defaultPassword);
            estudiante3.setRol(rolEstudiante);
            estudiante3.setProfileImage("https://randomuser.me/api/portraits/women/79.jpg");

            usuarioRepository.saveAll(List.of(
                admin, mentor1, mentor2, mentor3, mentor4, 
                estudiante1, estudiante2, estudiante3
            ));
            System.out.println("Usuarios de prueba de MentoríasG4 inicializados.");
        }
    }
}
