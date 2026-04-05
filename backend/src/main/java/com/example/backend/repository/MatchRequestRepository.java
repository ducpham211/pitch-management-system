package com.example.backend.repository;

import com.example.backend.entity.MatchRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface MatchRequestRepository extends JpaRepository<MatchRequest, String> {
    boolean existsByPostIdAndRequesterId(String postId, String requesterId);
    @Query("SELECT COUNT(m) FROM MatchRequest m WHERE m.status = 'ACCEPTED'")
    long countSuccessfulMatches();
}

