package com.mentoriasg4.scheduling_service.model;

import jakarta.persistence.*;

@Entity
@Table(name = "mentorship_sessions")
public class MentorshipSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long mentorId;
    private Long offerId;
    private Long studentId;
    private String mentorName;
    private String mentorImage;
    private String offerTitle;
    private String studentImage;
    private String topic;
    
    // Guardamos fecha como String (ej. "2026-05-14") para simplificar integración inicial
    private String date;
    private String time;
    private Integer duration;
    private Double price;
    
    private String status; // "pendiente" | "completada"
    
    private String platformLink; // Link de Zoom, Meet, etc.

    @Column(length = 1000)
    private String cancelReason;

    private boolean mentorReminderSent = false;
    private boolean studentReminderSent = false;

    public MentorshipSession() {}

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

    public Long getOfferId() {
        return offerId;
    }

    public void setOfferId(Long offerId) {
        this.offerId = offerId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getMentorName() {
        return mentorName;
    }

    public void setMentorName(String mentorName) {
        this.mentorName = mentorName;
    }

    public String getMentorImage() {
        return mentorImage;
    }

    public void setMentorImage(String mentorImage) {
        this.mentorImage = mentorImage;
    }

    public String getOfferTitle() {
        return offerTitle;
    }

    public void setOfferTitle(String offerTitle) {
        this.offerTitle = offerTitle;
    }

    public String getStudentImage() {
        return studentImage;
    }

    public void setStudentImage(String studentImage) {
        this.studentImage = studentImage;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPlatformLink() {
        return platformLink;
    }

    public void setPlatformLink(String platformLink) {
        this.platformLink = platformLink;
    }

    public String getCancelReason() {
        return cancelReason;
    }

    public void setCancelReason(String cancelReason) {
        this.cancelReason = cancelReason;
    }

    public boolean isMentorReminderSent() {
        return mentorReminderSent;
    }

    public void setMentorReminderSent(boolean mentorReminderSent) {
        this.mentorReminderSent = mentorReminderSent;
    }

    public boolean isStudentReminderSent() {
        return studentReminderSent;
    }

    public void setStudentReminderSent(boolean studentReminderSent) {
        this.studentReminderSent = studentReminderSent;
    }
}