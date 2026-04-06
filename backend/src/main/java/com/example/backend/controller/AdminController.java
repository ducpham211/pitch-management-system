package com.example.backend.controller;

import com.example.backend.dto.request.AdminCreateRequest;
import com.example.backend.dto.response.DashboardOverviewResponse;
import com.example.backend.dto.response.DashboardTransactionResponse;
import com.example.backend.dto.response.FieldResponse;
import com.example.backend.utils.Enums;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final AdminService adminService;

    // 1. GET: Danh sách User có bộ lọc (Đã fix lỗi 500 Infinite Recursion)
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minTrustScore) {

        try {
            // Lấy toàn bộ user và lọc bằng Java Stream để tránh lỗi ép kiểu JPQL Enum
            List<User> users = userRepository.findAll();

            if (role != null && !role.isEmpty()) {
                users = users.stream()
                        .filter(u -> u.getRole() != null && u.getRole().name().equalsIgnoreCase(role))
                        .collect(Collectors.toList());
            }

            if (minTrustScore != null) {
                users = users.stream()
                        .filter(u -> u.getTrustScore() != null && u.getTrustScore() >= minTrustScore)
                        .collect(Collectors.toList());
            }

            // Map thủ công để tránh trả về trực tiếp Entity User gây lỗi JSON và lộ Password
            List<java.util.Map<String, Object>> safeResponse = users.stream().map(u -> {
                java.util.Map<String, Object> map = new java.util.HashMap<>();
                map.put("id", u.getId());
                map.put("fullName", u.getFullName());
                map.put("email", u.getEmail());
                map.put("role", u.getRole());
                map.put("trustScore", u.getTrustScore());
                return map;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(safeResponse);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi máy chủ: " + e.getMessage());
        }
    }

    // 2. GET: Lịch sử đánh giá (Có thể lọc theo trạng thái)
    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getReviews(
            @RequestParam(required = false) Enums.ReviewStatus status) {

        List<Review> reviews;
        if (status != null) {
            reviews = reviewRepository.findByStatus(status);
        } else {
            reviews = reviewRepository.findAll();
        }
        return ResponseEntity.ok(reviews);
    }

    // 3. PUT: Phán quyết của Admin cho một review
    @PutMapping("/reviews/{reviewId}")
    public ResponseEntity<String> adjudicateReview(
            @PathVariable String reviewId,
            @RequestBody AdminCreateRequest request) {

        String message = adminService.adjudicateReview(reviewId, request);
        return ResponseEntity.ok(message);
    }
    @GetMapping("/fields")
    public ResponseEntity<List<FieldResponse>> getAllFields() {
        return ResponseEntity.ok(adminService.getAllFields());
    }

    // 5. GET: Thống kê tổng quan (Dashboard Overview)
    @GetMapping("/dashboard/overview")
    public ResponseEntity<DashboardOverviewResponse> getOverviewMetrics() {
        return ResponseEntity.ok(adminService.getOverviewMetrics());
    }

    // 6. GET: Thống kê dòng tiền (Dashboard Transactions)
    @GetMapping("/dashboard/transactions")
    public ResponseEntity<DashboardTransactionResponse> getTransactionMetrics() {
        return ResponseEntity.ok(adminService.getTransactionMetrics());
    }
}