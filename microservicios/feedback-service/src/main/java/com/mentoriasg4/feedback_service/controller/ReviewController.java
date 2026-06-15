package com.mentoriasg4.feedback_service.controller;

import com.mentoriasg4.feedback_service.dto.ReviewResponseDto;
import com.mentoriasg4.feedback_service.dto.UserDto;
import com.mentoriasg4.feedback_service.model.Review;
import com.mentoriasg4.feedback_service.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = "*") // Permite peticiones desde React
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${internal.service.token}")
    private String internalToken;

    @Value("{$user.service.base-url:http://localhost:8081}")
    private String userServiceUrl;

    @GetMapping("/mentor/{mentorId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByMentor(@PathVariable Long mentorId) {
        List<Review> reviews = reviewRepository.findByMentorIdOrderByCreatedAtDesc(mentorId);
        return ResponseEntity.ok(mapReviewsToDto(reviews));
    }

    @GetMapping("/offer/{offerId}")
    public ResponseEntity<List<ReviewResponseDto>> getReviewsByOffer(@PathVariable Long offerId) {
        List<Review> reviews = reviewRepository.findByOfferIdOrderByCreatedAtDesc(offerId);
        return ResponseEntity.ok(mapReviewsToDto(reviews));
    }

    @GetMapping("/exists")
    public ResponseEntity<Boolean> checkReviewExists(@RequestParam Long offerId, @RequestParam Long studentId) {
        return ResponseEntity.ok(reviewRepository.existsByOfferIdAndStudentId(offerId, studentId));
    }

    private List<ReviewResponseDto> mapReviewsToDto(List<Review> reviews) {
        List<ReviewResponseDto> response = reviews.stream().map(review -> {
            ReviewResponseDto dto = new ReviewResponseDto();
            dto.setId(review.getId());
            dto.setMentorId(review.getMentorId());
            dto.setOfferId(review.getOfferId());
            dto.setStudentId(review.getStudentId());
            dto.setRating(review.getRating());
            dto.setComment(review.getComment());
            dto.setCreatedAt(review.getCreatedAt());

            try {
                // Petición HTTP síncrona al endpoint público de user-service
                String url = userServiceUrl + "/api/users/" + review.getStudentId();
                ResponseEntity<UserDto> responseTemplate = restTemplate.getForEntity(url, UserDto.class);
                UserDto user = responseTemplate.getBody();
                
                if (user != null) {
                    String userName = user.getName() != null ? user.getName() : user.getNombre();
                    dto.setUserName(userName != null ? userName : "Usuario Desconocido");
                } else {
                    dto.setUserName("Usuario Desconocido");
                }
            } catch (Exception e) {
                // Si user-service está apagado o falla, mostramos una alternativa amigable
                System.err.println("Error al obtener usuario con ID " + review.getStudentId() + ": " + e.getMessage());
                dto.setUserName("Usuario (No disponible)");
            }

            return dto;
        }).collect(Collectors.toList());
        return response;
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        Review savedReview = reviewRepository.save(review);
        return ResponseEntity.ok(savedReview);
    }
}