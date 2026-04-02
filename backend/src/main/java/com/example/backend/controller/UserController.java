package com.example.backend.controller;

import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser() {
        String userId = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setRole(user.getRole().toString());

        return ResponseEntity.ok(response);
    }
}