package com.example.backend.service.impl;

import com.example.backend.dto.aiOpponentRecommendation.AiOpponentDto;
import com.example.backend.dto.aiOpponentRecommendation.AiRecommendationResult;
import com.example.backend.dto.request.MatchPostCreateRequest;
import com.example.backend.dto.response.MatchPostResponse;
import com.example.backend.dto.response.RecommendedMatchResponse;
import com.example.backend.utils.Enums;
import com.example.backend.entity.MatchPost;
import com.example.backend.entity.User;
import com.example.backend.mapper.MatchPostMapper;
import com.example.backend.repository.MatchPostRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.MatchPostService;
import com.example.backend.service.ai.GroqAiService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import lombok.AllArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import com.example.backend.exception.AppException;

@Service
@AllArgsConstructor
public class MatchPostServiceImpl implements MatchPostService {

    private final MatchPostRepository matchPostRepository;
    private final MatchPostMapper matchPostMapper;
    private final UserRepository userRepository;
    private final GroqAiService groqAiService;

    @Override
    public MatchPostResponse createMatchPost(MatchPostCreateRequest request) {
        MatchPost matchPost = matchPostMapper.toEntity(request);
        matchPost.setUserId(SecurityContextHolder.getContext().getAuthentication().getName());
        matchPost.setStatus(Enums.PostStatus.OPEN);
        matchPost.setCreatedAt(LocalDateTime.now());
        MatchPost savedMatchPost = matchPostRepository.save(matchPost);
        return matchPostMapper.toResponse(savedMatchPost);
    }

    @Override
    public Page<MatchPostResponse> getMatchPosts(Enums.TeamLevel skillLevel, Enums.PostType postType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MatchPost> matchPage = matchPostRepository.filterMatchPosts(skillLevel, postType, pageable);
        return matchPage.map(matchPostMapper::toResponse);
    }
    
    @Override
    public MatchPostResponse updateMatchPost(String postId, String currentUserId, MatchPostCreateRequest request){
        MatchPost matchPost = matchPostRepository.findById(postId).orElseThrow(()-> new AppException(404, "Không tìm thấy bài đăng!"));
        if(!matchPost.getUserId().equals(currentUserId)){
            throw new AppException(403, "Bạn không phải chủ bài đăng, không có quyền sửa bài đăng này");
        }
        matchPostMapper.updateEntityFromRequest(request, matchPost);
        MatchPost savedMatchPost = matchPostRepository.save(matchPost);
        return matchPostMapper.toResponse(savedMatchPost);
    }
    
    @Override
    public void deleteMatchPost(String postId, String currentUserId) {
        MatchPost matchPost = matchPostRepository.findById(postId).orElseThrow(()-> new AppException(404, "Không tìm thấy bài đăng!"));
        if(!matchPost.getUserId().equals(currentUserId)){
            throw new AppException(403, "Không có quyền xóa bài viết này ");
        }
        matchPostRepository.delete(matchPost);
    }
    
    @Override
    public List<RecommendedMatchResponse> getSmartRecommendations(String currentUserId, String playstyleNote) {

        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy User"));
        int currentTrust = currentUser.getTrustScore() != null ? currentUser.getTrustScore() : 100;

        Pageable top15 = PageRequest.of(0, 15);
        Page<MatchPost> rawMatchesPage = matchPostRepository.findPotentialMatches(currentUserId, top15);
        if (rawMatchesPage.isEmpty()) {
            return List.of(); 
        }

        List<MatchPost> top15Matches = rawMatchesPage.getContent();

        List<AiOpponentDto> aiInputData = top15Matches.stream()
                .map(m -> {
                    int opponentTrust = userRepository.findById(m.getUserId().toString())
                            .map(User::getTrustScore).orElse(100);

                    return new AiOpponentDto(m.getId().toString(), m.getMessage(), opponentTrust);
                })
                .toList();

        System.out.println("DỮ LIỆU ĐÃ ĐÓNG GÓI CHO AI: " + aiInputData);
        
        List<AiRecommendationResult> aiResults = groqAiService.recommendOpponents(
                playstyleNote, currentTrust, aiInputData
        );

        return aiResults.stream().map(aiRes -> {
            MatchPost fullMatchInfo = top15Matches.stream()
                    .filter(m -> m.getId().equals(aiRes.getMatchId()))
                    .findFirst()
                    .orElse(null);

            if (fullMatchInfo == null) return null;

            RecommendedMatchResponse response = new RecommendedMatchResponse();
            response.setMatchId(fullMatchInfo.getId());
            response.setOpponentNote(fullMatchInfo.getMessage());
            response.setAiExplanation(aiRes.getAiReason());
            return response;

        }).filter(java.util.Objects::nonNull).toList();
    }

    @Override
    public void markAsComplete(String postId, String currentUserId) {
        MatchPost matchPost = matchPostRepository.findById(postId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy bài đăng!"));
        
        matchPost.setStatus(Enums.PostStatus.CLOSED);
        matchPostRepository.save(matchPost);
    }
}