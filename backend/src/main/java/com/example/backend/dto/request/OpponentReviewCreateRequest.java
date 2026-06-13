package com.example.backend.dto.request;
import com.example.backend.utils.Enums;
import lombok.Data;

@Data
public class OpponentReviewCreateRequest {
    private String matchId;
    private String revieweeId;
    private String comment;
    private String imageUrl;
}