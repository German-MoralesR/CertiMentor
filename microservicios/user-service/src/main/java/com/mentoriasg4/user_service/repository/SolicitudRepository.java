package com.mentoriasg4.user_service.repository;

import com.mentoriasg4.user_service.model.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
    
    @Query("SELECT s FROM Solicitud s WHERE s.user.id = ?1")
    List<Solicitud> findByUser_Id(Long userId);
    
    @Query("SELECT s FROM Solicitud s WHERE s.user.id = ?1 AND s.type = ?2 AND s.status = ?3")
    Optional<Solicitud> findByUser_IdAndTypeAndStatus(Long userId, String type, String status);
}