package com.example.backend.dto.request;
import lombok.Data;

@Data
public class FairplayDecisionRequest {
    private boolean isAccepted; // true: Phê duyệt, false: Bác bỏ
    private Integer pointsApplied; // Số điểm thực tế Admin quyết định cộng/trừ
}