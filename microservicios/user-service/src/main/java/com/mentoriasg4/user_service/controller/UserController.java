package com.mentoriasg4.user_service.controller;

import com.mentoriasg4.user_service.dto.UsuarioDto;
import com.mentoriasg4.user_service.model.Solicitud;
import com.mentoriasg4.user_service.model.Usuario;
import com.mentoriasg4.user_service.repository.SolicitudRepository;
import com.mentoriasg4.user_service.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private SolicitudRepository solicitudRepository;

    @Value("${internal.service.token}")
    private String internalToken;

    private UsuarioDto convertToDto(Usuario u) {
        UsuarioDto dto = new UsuarioDto();
        dto.setId(u.getId());
        dto.setName(u.getName());
        dto.setEmail(u.getEmail());
        dto.setProfileImage(u.getProfileImage());
        dto.setDescription(u.getDescription());
        dto.setStatus(u.getStatus());
        dto.setRole(u.getRole());

        List<Solicitud> solicitudes = solicitudRepository.findByUser_Id(u.getId());
        Solicitud ultimaMentor = solicitudes.stream()
            .filter(s -> "MENTOR".equals(s.getType()))
            .reduce((first, second) -> second) // obtener la última
            .orElse(null);

        if (ultimaMentor != null) {
            if ("PENDIENTE".equals(ultimaMentor.getStatus())) {
                dto.setMentorRequest(true);
                dto.setCertificationCode(ultimaMentor.getCertificationCode());
                dto.setInstitution(ultimaMentor.getInstitution());
            } else if ("RECHAZADA".equals(ultimaMentor.getStatus())) {
                dto.setMentorRequest(false);
                dto.setMentorRejectionReason(ultimaMentor.getRejectionReason());
            } else {
                dto.setMentorRequest(false);
            }
        } else {
            dto.setMentorRequest(false);
        }
        return dto;
    }

    @GetMapping
    public ResponseEntity<List<UsuarioDto>> getAllUsers() {
        return ResponseEntity.ok(usuarioRepository.findAll().stream().map(this::convertToDto).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioDto> getUserById(@PathVariable Long id) {
        return usuarioRepository.findById(id)
                .map(this::convertToDto)
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
                // Validar fortaleza de la nueva contraseña
                String passwordValidationError = validatePassword(newPassword);
                if (passwordValidationError != null) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", passwordValidationError));
                }

                // Encriptamos la nueva contraseña y la guardamos
                usuario.setPassword(passwordEncoder.encode(newPassword));
                usuarioRepository.save(usuario);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.status(org.springframework.http.HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "La contraseña actual es incorrecta"));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable Long id, @RequestBody java.util.Map<String, String> data) {
        return usuarioRepository.findById(id).map(usuario -> {
            if (data.containsKey("name")) usuario.setName(data.get("name"));
            if (data.containsKey("profileImage")) usuario.setProfileImage(data.get("profileImage"));
            if (data.containsKey("description")) usuario.setDescription(data.get("description"));
            usuarioRepository.save(usuario);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/approve-mentor")
    public ResponseEntity<?> approveMentor(@PathVariable Long id) {
        return usuarioRepository.findById(id).map(usuario -> {
            // Buscamos o instanciamos el rol de Mentor (ID 2)
            com.mentoriasg4.user_service.model.Rol rolMentor = new com.mentoriasg4.user_service.model.Rol();
            rolMentor.setId(2);
            rolMentor.setName("MENTOR");
            
            usuario.setRole(rolMentor);
            usuarioRepository.save(usuario);
            
            List<Solicitud> pendientes = solicitudRepository.findByUser_Id(id);
            for (Solicitud s : pendientes) {
                if ("PENDIENTE".equals(s.getStatus()) && "MENTOR".equals(s.getType())) {
                    s.setStatus("APROBADA");
                    solicitudRepository.save(s);
                }
            }

            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/mentor-request")
    public ResponseEntity<?> requestMentor(@PathVariable Long id, @RequestBody java.util.Map<String, String> data) {
        return usuarioRepository.findById(id).map(usuario -> {
            Solicitud solicitud = new Solicitud();
            solicitud.setUser(usuario);
            solicitud.setType("MENTOR");
            solicitud.setStatus("PENDIENTE");
            solicitud.setCertificationCode(data.get("certificationCode"));
            solicitud.setInstitution(data.get("institution"));
            solicitudRepository.save(solicitud);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject-mentor")
    public ResponseEntity<?> rejectMentor(@PathVariable Long id, @RequestBody(required = false) java.util.Map<String, String> payload) {
        return usuarioRepository.findById(id).map(usuario -> {
            List<Solicitud> pendientes = solicitudRepository.findByUser_Id(id);
            for (Solicitud s : pendientes) {
                if ("PENDIENTE".equals(s.getStatus()) && "MENTOR".equals(s.getType())) {
                    s.setStatus("RECHAZADA");
                    if (payload != null && payload.containsKey("reason")) {
                        s.setRejectionReason(payload.get("reason"));
                    }
                    solicitudRepository.save(s);
                }
            }
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/admin-edit")
    public ResponseEntity<?> adminEditUser(@PathVariable Long id, @RequestBody java.util.Map<String, String> data) {
        return usuarioRepository.findById(id).map(usuario -> {
            if (data.containsKey("name")) usuario.setName(data.get("name"));
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