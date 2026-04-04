package com.example.backend.service;

import com.example.backend.dto.request.AdminCreateRequest;

public interface AdminService {
    String adjudicateReview(String reviewId, AdminCreateRequest request);
}
