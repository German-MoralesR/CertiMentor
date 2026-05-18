package com.mentoriasg4.user_service.controller;

import com.mentoriasg4.user_service.model.Usuario;
import com.mentoriasg4.user_service.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${internal.service.token}")
    private String internalToken;

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> getUserById(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/internal/{id}")
    public ResponseEntity<Usuario> getUserByIdInternal(@PathVariable Long id, @RequestHeader(value = "X-Service-Token", required = false) String token) {
        if (!internalToken.equals(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return usuarioRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody java.util.Map<String, String> passwords) {
        return usuarioRepository.findById(id).map(usuario -> {
            String currentPassword = passwords.get("currentPassword");
            String newPassword = passwords.get("newPassword");

            // Verificamos que la contraseña actual coincida con la encriptada en DB
            if (passwordEncoder.matches(currentPassword, usuario.getPassword())) {
                // Encriptamos la nueva contraseña y la guardamos
                usuario.setPassword(passwordEncoder.encode(newPassword));
                usuarioRepository.save(usuario);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                        .body("La contraseña actual es incorrecta");
            }
        }).orElse(ResponseEntity.notFound().build());
    }
}