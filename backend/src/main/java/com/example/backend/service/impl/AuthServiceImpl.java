package com.example.backend.service.impl;

import com.example.backend.dto.request.AuthRequest;
import com.example.backend.dto.response.AuthResponse;
import com.example.backend.utils.Enums;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.AuthService;
import com.example.backend.exception.AppException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class AuthServiceImpl implements AuthService {

    @Value("${supabase.url}")
    private String supabaseUrl;

    @Value("${supabase.anon.key}")
    private String supabaseKey;

    private final RestTemplate restTemplate = new RestTemplate();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Override
    public AuthResponse register(AuthRequest request) {
        String url = supabaseUrl + "/auth/v1/signup";
        HttpEntity<AuthRequest> entity = new HttpEntity<>(request, createHeaders());

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response.getBody());
            
            String userId = null;
            if (rootNode.has("id")) {
                userId = rootNode.get("id").asText();
            } else if (rootNode.has("user") && rootNode.get("user").has("id")) {
                userId = rootNode.get("user").get("id").asText();
            }

            if (userId != null) {
                User newUser = new User();
                newUser.setId(userId);
                newUser.setEmail(request.getEmail());
                newUser.setRole(Enums.UserRole.PLAYER);
                newUser.setFullName(request.getFullName());
                newUser.setPassword(request.getPassword());
                userRepository.save(newUser);
            }

            return new AuthResponse(null, "Đăng ký thành công!");
        } catch (Exception e) {
            throw new AppException(400, "Lỗi đăng ký: " + e.getMessage());
        }
    }

    @Override
    public AuthResponse login(AuthRequest request) {
        String url = supabaseUrl + "/auth/v1/token?grant_type=password";
        HttpEntity<AuthRequest> entity = new HttpEntity<>(request, createHeaders());

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode rootNode = mapper.readTree(response.getBody());

            String cleanToken = rootNode.path("access_token").asText();

            return new AuthResponse(cleanToken, "Đăng nhập thành công!");
        } catch (Exception e) {
            throw new AppException(400, "Lỗi phân tích token từ Supabase");
        }
    }

    @Override
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng với email này"));
        
        String otp = String.format("%06d", new Random().nextInt(999999));
        redisTemplate.opsForValue().set("OTP_" + email, otp, 5, TimeUnit.MINUTES);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Mã OTP Khôi Phục Mật Khẩu");
        message.setText("Mã OTP của bạn là: " + otp + ". Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho người khác.");
        mailSender.send(message);
    }

    @Override
    public void verifyOtp(String email, String otp) {
        String savedOtp = redisTemplate.opsForValue().get("OTP_" + email);
        if (savedOtp == null || !savedOtp.equals(otp)) {
            throw new AppException(400, "OTP không hợp lệ hoặc đã hết hạn");
        }
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        verifyOtp(email, otp);
        
        User user = userRepository.findByEmail(email).orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng"));
        user.setPassword(newPassword);
        userRepository.save(user);
        
        redisTemplate.delete("OTP_" + email);
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("apikey", supabaseKey);
        return headers;
    }
}