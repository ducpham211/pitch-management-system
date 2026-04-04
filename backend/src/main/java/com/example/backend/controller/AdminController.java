package com.example.backend.controller;

import com.example.backend.dto.request.AdminCreateRequest;
import com.example.backend.entity.Enums;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AdminService;
import com.example.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
// 👉 Tấm khiên bảo mật: Yêu cầu tài khoản có quyền ADMIN mới được gọi các API này
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final AdminService adminService;

    // 1. GET: Danh sách User có bộ lọc
    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minTrustScore) {

        List<User> users = userRepository.findUsersByFilters(role, minTrustScore);
        // Lưu ý: Trong thực tế bạn nên dùng Mapper chuyển Entity User sang UserResponse để giấu password nhé
        return ResponseEntity.ok(users);
    }

    // 2. GET: Lịch sử đánh giá (Có thể lọc theo trạng thái)
    @GetMapping("/reviews")
    public ResponseEntity<List<Review>> getReviews(
            @RequestParam(required = false) Enums.ReviewStatus status) {

        List<Review> reviews;
        if (status != null) {
            reviews = reviewRepository.findByStatus(status); // Chỉ lấy những bài chờ duyệt
        } else {
            reviews = reviewRepository.findAll(); // Lấy tất cả
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
}