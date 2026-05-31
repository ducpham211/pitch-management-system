package com.example.backend.repository;

import com.example.backend.entity.OpponentReview;
import com.example.backend.utils.Enums;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OpponentReviewRepository extends JpaRepository<OpponentReview, String> {
    List<OpponentReview> findByStatusOrderByCreatedAtDesc(Enums.FairplayStatus status);
    List<OpponentReview> findByRevieweeIdOrderByCreatedAtDesc(String revieweeId);
}