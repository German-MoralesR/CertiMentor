package com.mentoriasg4.mentorship_service.service;

import com.mentoriasg4.mentorship_service.model.MentorshipOffer;
import com.mentoriasg4.mentorship_service.repository.MentorshipOfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MentorshipOfferService {

    @Autowired
    private MentorshipOfferRepository repository;

    public List<MentorshipOffer> getAllOffers() {
        List<MentorshipOffer> offers = repository.findAll();
        updateExpiredOffers(offers);
        return offers.stream()
                .filter(offer -> !isEliminada(offer))
                .collect(Collectors.toList());
    }

    public List<MentorshipOffer> getOffersByMentorId(Long mentorId) {
        List<MentorshipOffer> offers = repository.findByMentorId(mentorId);
        updateExpiredOffers(offers);
        return offers;
    }

    public List<MentorshipOffer> searchOffersByTopic(String topic) {
        if (topic == null || topic.isBlank()) {
            return getAllOffers();
        }
        String normalized = topic.trim().toLowerCase();
        return getAllOffers().stream()
                .filter(offer -> matchesTopic(offer, normalized))
                .collect(Collectors.toList());
    }

    public Optional<MentorshipOffer> getOfferById(Long id) {
        return repository.findById(id).map(offer -> {
            if (shouldExpire(offer, LocalDate.now()) && !isEliminada(offer)) {
                offer.setStatus("eliminada");
                return repository.save(offer);
            }
            return offer;
        });
    }

    public MentorshipOffer createOffer(MentorshipOffer offer) {
        return repository.save(offer);
    }

    public MentorshipOffer updateOffer(Long id, MentorshipOffer updatedOffer) {
        return repository.findById(id).map(offer -> {
            offer.setTitle(updatedOffer.getTitle());
            if (updatedOffer.getImage() != null && !updatedOffer.getImage().isBlank()) {
                offer.setImage(updatedOffer.getImage());
            }
            offer.setPrice(updatedOffer.getPrice());
            offer.setDescription(updatedOffer.getDescription());
            offer.setMentorId(updatedOffer.getMentorId());
            offer.setMentorName(updatedOffer.getMentorName());
            offer.setAvailability(updatedOffer.getAvailability());
            offer.setSkills(updatedOffer.getSkills());
            offer.setTimeStart(updatedOffer.getTimeStart());
            offer.setTimeEnd(updatedOffer.getTimeEnd());
            offer.setAvailableDates(updatedOffer.getAvailableDates());
            if (updatedOffer.getStatus() != null) {
                offer.setStatus(updatedOffer.getStatus());
            }
            return repository.save(offer);
        }).orElseThrow(() -> new RuntimeException("Offer not found with id: " + id));
    }

    public void deleteOffer(Long id) {
        repository.deleteById(id);
    }

    private void updateExpiredOffers(List<MentorshipOffer> offers) {
        if (offers == null || offers.isEmpty()) {
            return;
        }
        LocalDate today = LocalDate.now();
        List<MentorshipOffer> toUpdate = new ArrayList<>();
        for (MentorshipOffer offer : offers) {
            if (offer == null || isEliminada(offer)) {
                continue;
            }
            if (shouldExpire(offer, today)) {
                offer.setStatus("eliminada");
                toUpdate.add(offer);
            }
        }
        if (!toUpdate.isEmpty()) {
            repository.saveAll(toUpdate);
        }
    }

    private boolean shouldExpire(MentorshipOffer offer, LocalDate today) {
        if (offer.getAvailableDates() == null || offer.getAvailableDates().isEmpty()) {
            return false;
        }
        LocalDate latestDate = offer.getAvailableDates()
                .stream()
                .map(LocalDate::parse)
                .max(Comparator.naturalOrder())
                .orElse(null);
        return latestDate != null && latestDate.isBefore(today);
    }

    private boolean isEliminada(MentorshipOffer offer) {
        return offer.getStatus() != null && offer.getStatus().equalsIgnoreCase("eliminada");
    }

    private boolean matchesTopic(MentorshipOffer offer, String normalizedTopic) {
        return containsNormalized(offer.getTitle(), normalizedTopic)
                || containsNormalized(offer.getDescription(), normalizedTopic)
                || containsNormalized(offer.getMentorName(), normalizedTopic)
                || hasSkillMatch(offer.getSkills(), normalizedTopic);
    }

    private boolean containsNormalized(String value, String normalizedTopic) {
        return value != null && value.toLowerCase().contains(normalizedTopic);
    }

    private boolean hasSkillMatch(List<String> skills, String normalizedTopic) {
        if (skills == null || skills.isEmpty()) {
            return false;
        }
        return skills.stream().anyMatch(skill -> containsNormalized(skill, normalizedTopic));
    }
}
