package com.example.backend.repository;

import com.example.backend.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, String> {
    
    boolean existsByBookingId(String bookingId);
    
    List<Review> findByUserIdOrderByCreatedAtDesc(String userId);
    
    List<Review> findByFieldIdOrderByCreatedAtDesc(String fieldId);
}