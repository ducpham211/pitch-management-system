package com.example.backend.service.impl;

import com.example.backend.dto.request.ConversationCreateRequest;
import com.example.backend.dto.request.MatchRequestCreateRequest;
import com.example.backend.dto.request.MatchRequestStatusCreateRequest;
import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.response.ConversationResponse;
import com.example.backend.dto.response.MatchRequestResponse;
import com.example.backend.dto.response.MatchRequestStatusResponse;
import com.example.backend.entity.Enums;
import com.example.backend.entity.MatchPost;
import com.example.backend.entity.MatchRequest;
import com.example.backend.entity.User;
import com.example.backend.mapper.MatchRequestMapper;
import com.example.backend.repository.MatchPostRepository;
import com.example.backend.repository.MatchRequestRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.ConversationService;
import com.example.backend.service.MatchRequestService;
import com.example.backend.service.NotificationService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@AllArgsConstructor
@Service
public class MatchRequestServiceImpl implements MatchRequestService {

    private final MatchRequestRepository matchRequestRepository;
    private final MatchRequestMapper matchRequestMapper;
    private final MatchPostRepository matchPostRepository;
    private final ConversationService conversationService;
    private final NotificationService notificationService;
    private final UserRepository userRepository; // Thêm repo này để lấy tên user

    // Hàm tiện ích để cắt ngắn ID còn 6 ký tự hiển thị cho đẹp
    private String truncateId(String id) {
        if (id == null || id.isEmpty()) return "Chưa xác định";
        return id.length() >= 6 ? id.substring(0, 6).toUpperCase() : id.toUpperCase();
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

        // --- BẮT ĐẦU LOGIC GỬI THÔNG BÁO HIỂN THỊ TÊN MỚI ---
        User requester = userRepository.findById(request.getRequesterId()).orElse(null);
        String requesterName = requester != null ? requester.getFullName() : "Một người chơi";
        String fieldCode = truncateId(post.getFieldId());

        NotificationCreateRequest notifRequest = new NotificationCreateRequest();
        notifRequest.setTitle("Có lời mời giao hữu mới!");
        notifRequest.setContent(requesterName + " đã gửi yêu cầu nhận kèo của bạn tại sân " + fieldCode);
        notifRequest.setType(Enums.NotificationType.MATCH_REQUEST);
        notificationService.createAndSendNotification(post.getUserId(), notifRequest);
        // --- KẾT THÚC ---

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

        // --- BẮT ĐẦU LOGIC BẮN THÔNG BÁO KHI CHỐT HOẶC TỪ CHỐI KÈO ---
        if (requestDTO.getStatus() == Enums.RequestStatus.ACCEPTED) {
            post.setStatus(Enums.PostStatus.CLOSED);
            matchPostRepository.save(post);

            User host = userRepository.findById(currentUserId).orElse(null);
            String hostName = host != null ? host.getFullName() : "Chủ bài đăng";
            String fieldCode = truncateId(post.getFieldId());

            NotificationCreateRequest notifReq = new NotificationCreateRequest();
            notifReq.setTitle("Kèo giao hữu đã được chốt!");
            notifReq.setContent("Tin vui! " + hostName + " đã CHỐT KÈO giao hữu với đội của bạn tại sân " + fieldCode + "!");
            notifReq.setType(Enums.NotificationType.MATCH_REQUEST);
            notificationService.createAndSendNotification(request.getRequesterId(), notifReq);

        } else if (requestDTO.getStatus() == Enums.RequestStatus.REJECTED) {
            NotificationCreateRequest notifReq = new NotificationCreateRequest();
            notifReq.setTitle("Kèo giao hữu bị từ chối");
            notifReq.setContent("Rất tiếc, yêu cầu tham gia trận đấu của bạn đã bị chủ bài đăng từ chối.");
            notifReq.setType(Enums.NotificationType.MATCH_REQUEST);
            notificationService.createAndSendNotification(request.getRequesterId(), notifReq);
        }
        // --- KẾT THÚC ---

        return matchRequestMapper.toStatusResponse(savedRequest);
    }
}