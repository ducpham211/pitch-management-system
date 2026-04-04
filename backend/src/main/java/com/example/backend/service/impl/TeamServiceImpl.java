package com.example.backend.service.impl;

import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.request.TeamCreateRequest;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.entity.Enums;
import com.example.backend.entity.Team;
import com.example.backend.mapper.TeamMapper;
import com.example.backend.repository.TeamRepository;
import com.example.backend.service.NotificationService;
import com.example.backend.service.TeamService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class TeamServiceImpl implements TeamService {
    private final TeamRepository teamRepository;
    private final TeamMapper teamMapper;
    private final NotificationService notificationService;
    @Override
    public TeamResponse createTeam(String userId, TeamCreateRequest request){
        Team team = teamMapper.toEntity(request);
        team = teamRepository.save(team);
        NotificationCreateRequest notifRequest = new NotificationCreateRequest();
        notifRequest.setTitle("🎉 Đặt sân thành công (Chờ thanh toán)!");
        String content = "Bạn đã tạo thành công đội bóng "+team.getName();
        notifRequest.setContent(content);
        notifRequest.setType(Enums.NotificationType.BOOKING_UPDATE);
        notificationService.createAndSendNotification(userId, notifRequest);
        return teamMapper.toResponse(team);
    }
    @Override
    public TeamResponse updateTeam(String teamId, TeamCreateRequest request){
        Team team = teamRepository.findById(teamId).orElseThrow(() -> new RuntimeException("Team not found"));
        teamMapper.updateEntityFromRequest(request, team);
        team = teamRepository.save(team);
        return teamMapper.toResponse(team);
    }
}
