package com.example.backend.service.impl;

import com.example.backend.dto.request.ConversationCreateRequest;
import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.request.MatchRequestStatusCreateRequest;
import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.dto.response.MatchRequestStatusResponse;
import com.example.backend.entity.Enums;
import com.example.backend.entity.MatchPost;
import com.example.backend.entity.MatchRequest;
import com.example.backend.mapper.MatchRequestMapper;
import com.example.backend.repository.MatchPostRepository;
import com.example.backend.repository.MatchRequestRepository;
import com.example.backend.service.ConversationService;
import com.example.backend.service.MatchRequestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class MatchRequestServiceImpl implements MatchRequestService {
    private final MatchRequestRepository matchRequestRepository;
    private final MatchRequestMapper matchRequestMapper;
    private final MatchPostRepository matchPostRepository;
    private final ConversationService conversationService;

    public MatchRequestServiceImpl(MatchRequestRepository matchRequestRepository, MatchRequestMapper matchRequestMapper, MatchPostRepository matchPostRepository, ConversationService conversationService) {
        this.matchRequestRepository = matchRequestRepository;
        this.matchRequestMapper = matchRequestMapper;
        this.matchPostRepository = matchPostRepository;
        this.conversationService = conversationService;
    }

    @Override
    @Transactional
    public MatchRequestResponse createMatchRequest(MatchRequestCreateRequest request) {
        MatchPost post = matchPostRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng!"));

        if (post.getUserId().equals(request.getRequesterId())) {
            throw new RuntimeException("Không thể tự nhận kèo của chính mình!");
        }

        boolean isAlreadyRequested = matchRequestRepository.existsByPostIdAndRequesterId(
                request.getPostId(),
                request.getRequesterId()
        );

        if (isAlreadyRequested) {
            throw new RuntimeException("Bạn đã gửi yêu cầu nhận kèo cho bài này rồi!");
        }

        MatchRequest matchRequest = matchRequestMapper.toEntity(request);
        matchRequest.setStatus(Enums.RequestStatus.PENDING);
        MatchRequest savedMatchRequest = matchRequestRepository.save(matchRequest);

        try {
            ConversationCreateRequest chatRequest = new ConversationCreateRequest();
            chatRequest.setType(Enums.ConversationType.DIRECT);
            chatRequest.setCreatedAt(LocalDateTime.now());

            conversationService.createDirectConversation(
                    chatRequest,
                    post.getUserId(),
                    request.getRequesterId() 
            );
        } catch (Exception e) {
            System.err.println("Lỗi khi auto-create phòng chat: " + e.getMessage());
        }

        return matchRequestMapper.toResponse(savedMatchRequest);
    }

    @Override
    @Transactional
    public MatchRequestStatusResponse updateRequestStatus(String requestId, String currentUserId, MatchRequestStatusCreateRequest requestDTO) {

        MatchRequest request = matchRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu ghép trận này!"));

        MatchPost post = matchPostRepository.findById(request.getPostId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài đăng!"));

        if (!post.getUserId().equals(currentUserId)) {
            throw new RuntimeException("Bạn không phải chủ bài đăng, không có quyền duyệt kèo này!");
        }

        matchRequestMapper.updateEntityFromDto(requestDTO, request);
        MatchRequest savedRequest = matchRequestRepository.save(request);

        if (requestDTO.getStatus() == Enums.RequestStatus.ACCEPTED) {
            post.setStatus(Enums.PostStatus.CLOSED);
            matchPostRepository.save(post);
        }

        return matchRequestMapper.toStatusResponse(savedRequest);
    }
}