package com.mentoriasg4.user_service.controller;

import com.mentoriasg4.user_service.dto.LoginDto;
import com.mentoriasg4.user_service.dto.RegisterDto;
import com.mentoriasg4.user_service.model.Rol;
import com.mentoriasg4.user_service.model.Usuario;
import com.mentoriasg4.user_service.model.Solicitud;
import com.mentoriasg4.user_service.repository.SolicitudRepository;
import com.mentoriasg4.user_service.repository.RolRepository;
import com.mentoriasg4.user_service.repository.UsuarioRepository;
import com.mentoriasg4.user_service.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Value("${notification.service.url:http://localhost:8085}")
    private String notificationServiceUrl;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private SolicitudRepository solicitudRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${internal.service.token}")
    private String internalToken;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getPassword())
            );
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Credenciales inválidas"));
        }

        final Usuario usuario = usuarioRepository.findByEmail(loginDto.getEmail()).orElseThrow();
        
        if ("inactivo".equalsIgnoreCase(usuario.getStatus())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Tu cuenta ha sido desactivada por un administrador."));
        }
        
        final String token = jwtUtil.generateToken(usuario);

        boolean hasPendingRequest = solicitudRepository.findByUser_IdAndTypeAndStatus(
                usuario.getId(), "MENTOR", "PENDIENTE").isPresent();

        return ResponseEntity.ok(Map.of(
                "token", token,
                "id", usuario.getId(),
                "name", usuario.getName(),
                "email", usuario.getEmail(),
                "role", usuario.getRole().getName().toLowerCase(),
                "profileImage", usuario.getProfileImage() != null ? usuario.getProfileImage() : "",
                "mentorRequest", hasPendingRequest
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto registerDto) {
        String email = registerDto.getEmail();
        String name = registerDto.getName();
        String phoneNumber = registerDto.getPhoneNumber();
        String passwordStr = registerDto.getPassword();
        Boolean mentorRequest = registerDto.getMentorRequest() != null ? registerDto.getMentorRequest() : false;

        // 1. Verificar si el email ya existe
        if (usuarioRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "este correo ya está registrado"));
        }

        // 1.1. Validar fortaleza de la contraseña
        String passwordValidationError = validatePassword(passwordStr);
        if (passwordValidationError != null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", passwordValidationError));
        }

        if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "El número de teléfono es obligatorio."));
        }

        // 2. Buscar el rol de "ESTUDIANTE"
        Rol rolEstudiante = rolRepository.findById(3)
                .orElseThrow(() -> new RuntimeException("Error: Rol de Estudiante no encontrado."));

        // 3. Crear el nuevo usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setName(name);
        nuevoUsuario.setEmail(email);
        nuevoUsuario.setPhoneNumber(phoneNumber.trim());
        nuevoUsuario.setPassword(passwordEncoder.encode(passwordStr)); // ¡Contraseña encriptada!
        nuevoUsuario.setRole(rolEstudiante);

        // 4. Guardar el usuario en la base de datos
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        if (mentorRequest) {
            Solicitud solicitud = new Solicitud();
            solicitud.setUser(usuarioGuardado);
            solicitud.setType("MENTOR");
            solicitud.setStatus("PENDIENTE");
            solicitud.setCertificationCode(registerDto.getCertificationCode());
            solicitud.setInstitution(registerDto.getInstitution());
            solicitudRepository.save(solicitud);
        }

        CompletableFuture.runAsync(() -> {
            try {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("X-Service-Token", internalToken);
                
                Map<String, String> body = Map.of("email", usuarioGuardado.getEmail(), "name", usuarioGuardado.getName());
                HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);
                restTemplate.postForEntity(notificationServiceUrl + "/api/notifications/email/welcome", request, Void.class);
            } catch (Exception ex) {
                logger.warn("No se pudo contactar a notification-service para el correo de bienvenida", ex);
            }
        });

        // 5. Devolver una respuesta exitosa
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioGuardado);
    }

    private String validatePassword(String password) {
        if (password == null || password.length() < 8) {
            return "La contraseña debe tener al menos 8 caracteres.";
        }

        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSymbol = false;
        String symbols = "!@#$%^&*()-_=+[]{}|;:'\",.<>/?~";

        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if (symbols.indexOf(c) >= 0) hasSymbol = true;
        }

        if (!hasUpper) return "La contraseña debe contener al menos una letra mayúscula.";
        if (!hasLower) return "La contraseña debe contener al menos una letra minúscula.";
        if (!hasDigit) return "La contraseña debe contener al menos un número.";
        if (!hasSymbol) return "La contraseña debe contener al menos un símbolo.";

        return null; // Sin errores
    }
}
