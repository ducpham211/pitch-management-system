// controller/ReviewController.java
package com.example.backend.controller;

import com.example.backend.dto.request.ReviewCreateRequest;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<ReviewResponse> createReview(@RequestBody ReviewCreateRequest request) {
        String reviewerId = SecurityContextHolder.getContext().getAuthentication().getName();
        ReviewResponse response = reviewService.createReview(reviewerId, request);
        return ResponseEntity.ok(response);
    }
}