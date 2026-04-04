package com.example.backend.dto.request;

import com.example.backend.entity.Enums;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class BookingCreateRequest {
    private String timeSlotId;
    private String note;
    // Bác có thể thêm mã voucher, ghi chú... vào đây sau
}