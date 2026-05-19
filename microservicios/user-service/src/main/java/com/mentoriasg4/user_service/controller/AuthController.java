package com.mentoriasg4.user_service.controller;

import com.mentoriasg4.user_service.dto.LoginDto;
import com.mentoriasg4.user_service.dto.RegisterDto;
import com.mentoriasg4.user_service.model.Rol;
import com.mentoriasg4.user_service.model.Usuario;
import com.mentoriasg4.user_service.repository.RolRepository;
import com.mentoriasg4.user_service.repository.UsuarioRepository;
import com.mentoriasg4.user_service.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private RolRepository rolRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

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

        return ResponseEntity.ok(Map.of(
                "token", token,
                "id", usuario.getId_usuario(),
                "name", usuario.getNombre(),
                "email", usuario.getEmail(),
                "role", usuario.getRol().getNombre().toLowerCase(),
                "profileImage", usuario.getProfileImage() != null ? usuario.getProfileImage() : "",
                "mentorRequest", usuario.getMentorRequest()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, Object> registerData) {
        String email = (String) registerData.get("email");
        String nombre = (String) registerData.get("nombre");
        String passwordStr = (String) registerData.get("password");
        Boolean mentorRequest = false;
        if (registerData.containsKey("mentorRequest")) {
            mentorRequest = (Boolean) registerData.get("mentorRequest");
        }

        // 1. Verificar si el email ya existe
        if (usuarioRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "El correo electrónico ya está registrado."));
        }

        // 2. Buscar el rol de "ESTUDIANTE"
        Rol rolEstudiante = rolRepository.findById(3)
                .orElseThrow(() -> new RuntimeException("Error: Rol de Estudiante no encontrado."));

        // 3. Crear el nuevo usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setNombre(nombre);
        nuevoUsuario.setEmail(email);
        nuevoUsuario.setPassword(passwordEncoder.encode(passwordStr)); // ¡Contraseña encriptada!
        nuevoUsuario.setRol(rolEstudiante);
        nuevoUsuario.setMentorRequest(mentorRequest);

        // 4. Guardar el usuario en la base de datos
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        // 5. Devolver una respuesta exitosa
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioGuardado);
    }
}