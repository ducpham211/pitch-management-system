package com.example.backend.service;

import com.example.backend.dto.request.AuthRequest;
import com.example.backend.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(AuthRequest request);
    AuthResponse login(AuthRequest request);
    void forgotPassword(String email);
    void verifyOtp(String email, String otp);
    void resetPassword(String email, String otp, String newPassword);
}