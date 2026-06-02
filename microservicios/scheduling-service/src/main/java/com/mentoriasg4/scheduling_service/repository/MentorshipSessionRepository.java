package com.mentoriasg4.scheduling_service.repository;

import com.mentoriasg4.scheduling_service.model.MentorshipSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentorshipSessionRepository extends JpaRepository<MentorshipSession, Long> {
    List<MentorshipSession> findByMentorId(Long mentorId);
    List<MentorshipSession> findByStudentId(Long studentId);
    List<MentorshipSession> findByStatusIgnoreCaseIn(List<String> statuses);
}