package com.mentoriasg4.user_service.controller;

import com.mentoriasg4.user_service.model.Usuario;
import com.mentoriasg4.user_service.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

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

    @GetMapping
    public ResponseEntity<List<Usuario>> getAllUsers() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

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

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody java.util.Map<String, String> data) {
        return usuarioRepository.findById(id).map(usuario -> {
            if (data.containsKey("name")) usuario.setNombre(data.get("name"));
            if (data.containsKey("profileImage")) usuario.setProfileImage(data.get("profileImage"));
            usuarioRepository.save(usuario);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/approve-mentor")
    public ResponseEntity<?> approveMentor(@PathVariable Long id) {
        return usuarioRepository.findById(id).map(usuario -> {
            // Buscamos o instanciamos el rol de Mentor (ID 2)
            com.mentoriasg4.user_service.model.Rol rolMentor = new com.mentoriasg4.user_service.model.Rol();
            rolMentor.setId_rol(2);
            rolMentor.setNombre("MENTOR");
            
            usuario.setRol(rolMentor);
            usuario.setMentorRequest(false); // Limpiamos la solicitud
            usuarioRepository.save(usuario);
            
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/admin-edit")
    public ResponseEntity<?> adminEditUser(@PathVariable Long id, @RequestBody java.util.Map<String, String> data) {
        return usuarioRepository.findById(id).map(usuario -> {
            if (data.containsKey("name")) usuario.setNombre(data.get("name"));
            if (data.containsKey("email")) usuario.setEmail(data.get("email"));
            usuarioRepository.save(usuario);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable Long id) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setStatus("activo".equals(usuario.getStatus()) ? "inactivo" : "activo");
            usuarioRepository.save(usuario);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserSoft(@PathVariable Long id) {
        return usuarioRepository.findById(id).map(usuario -> {
            usuario.setStatus("inactivo");
            usuarioRepository.save(usuario);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}