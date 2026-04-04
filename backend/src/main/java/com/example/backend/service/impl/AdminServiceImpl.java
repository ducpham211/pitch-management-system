package com.example.backend.service.impl;

import com.example.backend.dto.request.AdminCreateRequest;
import com.example.backend.entity.Enums;
import com.example.backend.entity.Review;
import com.example.backend.entity.User;
import com.example.backend.repository.ReviewRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AdminService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@Service
@AllArgsConstructor
public class AdminServiceImpl implements AdminService {
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;


    public String adjudicateReview(String reviewId, AdminCreateRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá này"));

        // Chốt chặn: Chỉ xử lý các review đang nằm chờ duyệt
        if (review.getStatus() != Enums.ReviewStatus.PENDING_ADMIN_REVIEW) {
            throw new RuntimeException("Đánh giá này không ở trạng thái chờ duyệt!");
        }

        if (request.isApprove()) {
            // 1. ADMIN ĐỒNG Ý PHẠT
            User reviewee = userRepository.findById(review.getRevieweeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người bị đánh giá"));

            // Lấy điểm hiện tại, nếu null thì mặc định là 100
            int currentScore = reviewee.getTrustScore() != null ? reviewee.getTrustScore() : 100;

            // Lấy mức phạt (Nếu Admin không truyền lên thì lấy số của AI)
            int penalty = (request.getFinalPenalty() != null) ? request.getFinalPenalty() : review.getAiSuggestedPenalty();

            // Trừ điểm và lưu User
            reviewee.setTrustScore(currentScore - penalty);
            userRepository.save(reviewee);

            // Cập nhật trạng thái Review
            review.setScoreChange(penalty);
            review.setStatus(Enums.ReviewStatus.PENALIZED);
            reviewRepository.save(review);
            return "Đã duyệt phạt. " + reviewee.getFullName() + " bị trừ " + penalty + " điểm uy tín.";

        } else {
            // 2. ADMIN BÁC BỎ (Hủy bỏ báo cáo của AI)
            review.setScoreChange(0);
            review.setStatus(Enums.ReviewStatus.AUTO_PASSED); // Đổi thành pass bình thường
            reviewRepository.save(review);

            return "Đã bác bỏ đánh giá. Không có điểm uy tín nào bị trừ.";
        }
    }
}
