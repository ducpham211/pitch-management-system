package com.example.backend.service.impl;

import com.example.backend.dto.request.FairplayDecisionRequest;
import com.example.backend.dto.request.OpponentReviewCreateRequest;
import com.example.backend.entity.OpponentReview;
import com.example.backend.entity.User;
import com.example.backend.exception.AppException;
import com.example.backend.repository.OpponentReviewRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.FairplayService;
import com.example.backend.utils.Enums;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FairplayServiceImpl implements FairplayService {

    private final OpponentReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public void submitReview(String reviewerId, OpponentReviewCreateRequest request) {
        if (reviewerId.equals(request.getRevieweeId())) {
            throw new AppException(400, "Bạn không thể tự đánh giá chính mình!");
        }

        OpponentReview review = new OpponentReview();
        review.setMatchId(request.getMatchId());
        review.setReviewerId(reviewerId);
        review.setRevieweeId(request.getRevieweeId());
        review.setRatingType(request.getRatingType());
        review.setComment(request.getComment());
        review.setStatus(Enums.FairplayStatus.PENDING);
        review.setCreatedAt(LocalDateTime.now());
        
        reviewRepository.save(review);
    }

    @Override
    public List<?> getPendingReviews() {
        return reviewRepository.findByStatusOrderByCreatedAtDesc(Enums.FairplayStatus.PENDING);
    }

    @Override
    @Transactional
    public void resolveReview(String reviewId, FairplayDecisionRequest request) {
        OpponentReview review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy báo cáo"));

        if (review.getStatus() != Enums.FairplayStatus.PENDING) {
            throw new AppException(400, "Đánh giá này đã được xử lý");
        }

        if (request.isAccepted()) {
            review.setStatus(Enums.FairplayStatus.RESOLVED);
            review.setPointsApplied(request.getPointsApplied());

            // Cập nhật điểm uy tín cho đối tượng bị đánh giá
            User reviewee = userRepository.findById(review.getRevieweeId())
                    .orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng"));

            int currentScore = reviewee.getReputationScore() != null ? reviewee.getReputationScore() : 100;
            reviewee.setReputationScore(currentScore + request.getPointsApplied());
            userRepository.save(reviewee);
        } else {
            review.setStatus(Enums.FairplayStatus.REJECTED);
        }

        reviewRepository.save(review);
    }
}