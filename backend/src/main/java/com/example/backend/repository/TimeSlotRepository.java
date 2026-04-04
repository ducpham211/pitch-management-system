package com.example.backend.repository;

import com.example.backend.entity.TimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Repository
public interface TimeSlotRepository extends JpaRepository<TimeSlot, String> {
    boolean existsByFieldIdAndStartTime(String fieldId, LocalDateTime startTime);
}

