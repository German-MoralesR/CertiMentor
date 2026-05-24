package com.mentoriasg4.user_service.controller;

import com.mentoriasg4.user_service.model.Solicitud;
import com.mentoriasg4.user_service.repository.SolicitudRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
@CrossOrigin(origins = "*")
public class SolicitudController {

    @Autowired
    private SolicitudRepository solicitudRepository;

    @GetMapping
    public ResponseEntity<List<Solicitud>> getAllSolicitudes() {
        // Traer todas las solicitudes desde la más reciente
        return ResponseEntity.ok(solicitudRepository.findAll());
    }
}