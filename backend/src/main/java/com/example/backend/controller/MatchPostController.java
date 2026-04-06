package com.example.backend.controller;

import com.example.backend.dto.request.MatchPostCreateRequest;
import com.example.backend.dto.response.MatchPostResponse;
import com.example.backend.dto.response.RecommendedMatchResponse;
import com.example.backend.entity.Enums;
import com.example.backend.service.MatchPostService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/match-posts")
@RequiredArgsConstructor
public class MatchPostController {

    private final MatchPostService matchPostService;

    @GetMapping
    public ResponseEntity<Object> getMatchPosts(@RequestParam(required = false) Enums.TeamLevel skillLevel,
                                                @RequestParam(required = false) Enums.PostType postType) {
        return ResponseEntity.ok(matchPostService.getMatchPosts(skillLevel, postType));
    }
    @PostMapping
    public ResponseEntity<MatchPostResponse> createMatchPost(@RequestBody MatchPostCreateRequest request) {
        MatchPostResponse response = matchPostService.createMatchPost(request);
        return ResponseEntity.ok(response);
    }
    @PutMapping("/{id}")
    public ResponseEntity<MatchPostResponse> updateMatchPost(
            @PathVariable("id") String postId,
            @RequestBody MatchPostCreateRequest request
    ) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        MatchPostResponse response = matchPostService.updateMatchPost(postId, currentUserId, request);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMatchPost(@PathVariable("id") String postId) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        matchPostService.deleteMatchPost(postId, currentUserId);
        return ResponseEntity.noContent().build();
    }
    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendedMatchResponse>> getSmartRecommendations(
            // Lấy tham số playstyle từ trên URL (VD: ?playstyle=đá vui vẻ)
            @RequestParam String playstyle) {

        // 👉 Tuyệt chiêu bảo mật: Tự động trích xuất ID người dùng từ JWT Token
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();

        // Gọi Service nhờ AI phán xử
        List<RecommendedMatchResponse> recommendations = matchPostService.getSmartRecommendations(currentUserId, playstyle);

        return ResponseEntity.ok(recommendations);
    }
}
