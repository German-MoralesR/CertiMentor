package com.mentoriasg4.mentorship_service.controller;

import com.mentoriasg4.mentorship_service.model.MentorshipOffer;
import com.mentoriasg4.mentorship_service.service.MentorshipOfferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mentorship-offers")
@CrossOrigin(origins = "*", maxAge = 3600) // Habilitamos CORS directamente para evitar bloqueos del navegador
public class MentorshipOfferController {

    @Autowired
    private MentorshipOfferService service;

    @GetMapping
    public List<MentorshipOffer> getAll() {
        return service.getAllOffers();
    }

    @GetMapping("/search")
    public List<MentorshipOffer> search(@RequestParam(name = "topic", required = false) String topic) {
        return service.searchOffersByTopic(topic);
    }

    @GetMapping("/mentor/{mentorId}")
    public List<MentorshipOffer> getByMentor(@PathVariable Long mentorId) {
        return service.getOffersByMentorId(mentorId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MentorshipOffer> getById(@PathVariable Long id) {
        return service.getOfferById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody MentorshipOffer offer) {
        if (offer.getImage() == null || offer.getImage().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "La imagen es requerida."));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(service.createOffer(offer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MentorshipOffer> update(@PathVariable Long id, @RequestBody MentorshipOffer offer) {
        try {
            return ResponseEntity.ok(service.updateOffer(id, offer));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        MentorshipOffer offer = service.getOfferById(id).orElse(null);
        if (offer != null) {
            offer.setStatus("eliminada");
            service.updateOffer(id, offer);
        }
        return ResponseEntity.noContent().build();
    }

}
