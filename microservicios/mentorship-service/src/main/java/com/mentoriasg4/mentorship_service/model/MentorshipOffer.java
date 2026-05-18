package com.mentoriasg4.mentorship_service.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "mentorship_offers")
public class MentorshipOffer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ID del mentor que viene del user-service
    private Long mentorId;
    
    // Lo guardamos aquí para facilidad de carga en el frontend sin tener que hacer join constante
    private String mentorName; 

    private String title;
    
    @Column(length = 1000)
    private String image;
    private Integer price; // Guardado como valor numérico CLP (ej: 15000) o 0 para gratis

    private Integer sessionsCompleted = 0;
    private Double rating = 5.0;
    private Integer reviews = 0;

    private String timeStart;
    private String timeEnd;
    private String availability;

    @ElementCollection
    @CollectionTable(name = "offer_skills", joinColumns = @JoinColumn(name = "offer_id"))
    @Column(name = "skill")
    private List<String> skills;

    @ElementCollection
    @CollectionTable(name = "offer_available_dates", joinColumns = @JoinColumn(name = "offer_id"))
    @Column(name = "available_date")
    private List<String> availableDates;

    public MentorshipOffer() {
    }

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMentorId() {
        return mentorId;
    }

    public void setMentorId(Long mentorId) {
        this.mentorId = mentorId;
    }

    public String getMentorName() {
        return mentorName;
    }

    public void setMentorName(String mentorName) {
        this.mentorName = mentorName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public Integer getSessionsCompleted() {
        return sessionsCompleted;
    }

    public void setSessionsCompleted(Integer sessionsCompleted) {
        this.sessionsCompleted = sessionsCompleted;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviews() {
        return reviews;
    }

    public void setReviews(Integer reviews) {
        this.reviews = reviews;
    }

    public String getTimeStart() {
        return timeStart;
    }

    public void setTimeStart(String timeStart) {
        this.timeStart = timeStart;
    }

    public String getTimeEnd() {
        return timeEnd;
    }

    public void setTimeEnd(String timeEnd) {
        this.timeEnd = timeEnd;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public List<String> getSkills() {
        return skills;
    }

    public void setSkills(List<String> skills) {
        this.skills = skills;
    }

    public List<String> getAvailableDates() {
        return availableDates;
    }

    public void setAvailableDates(List<String> availableDates) {
        this.availableDates = availableDates;
    }
}