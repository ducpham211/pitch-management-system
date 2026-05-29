package com.example.backend.service.impl;

import com.example.backend.dto.request.NotificationCreateRequest;
import com.example.backend.dto.request.TeamCreateRequest;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.utils.Enums;
import com.example.backend.entity.Team;
import com.example.backend.entity.TeamMember;
import com.example.backend.entity.User;
import com.example.backend.mapper.TeamMapper;
import com.example.backend.repository.TeamRepository;
import com.example.backend.repository.TeamMemberRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.NotificationService;
import com.example.backend.service.TeamService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import com.example.backend.exception.AppException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class TeamServiceImpl implements TeamService {
    private final TeamRepository teamRepository;
    private final TeamMapper teamMapper;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final TeamMemberRepository teamMemberRepository;

    @Override
    public TeamResponse createTeam(String userId, TeamCreateRequest request) {
        Team team = teamMapper.toEntity(request);
        team.setCaptainId(userId);
        team.setCreatedAt(LocalDateTime.now());
        team = teamRepository.save(team);
        
        NotificationCreateRequest notifRequest = new NotificationCreateRequest();
        notifRequest.setTitle("🎉 Tạo đội bóng thành công");
        notifRequest.setContent("Bạn đã tạo thành công đội bóng " + team.getName());
        notifRequest.setType(Enums.NotificationType.BOOKING_UPDATE);
        notificationService.createAndSendNotification(userId, notifRequest);
        
        TeamResponse res = teamMapper.toResponse(team);
        res.setIsCaptain(true);
        return res;
    }

    @Override
    public TeamResponse updateTeam(String teamId, String userId, TeamCreateRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đội bóng"));
        
        if (!team.getCaptainId().equals(userId)) {
            throw new AppException(403, "Bạn không có quyền cập nhật đội bóng này!");
        }

        teamMapper.updateEntityFromRequest(request, team);
        team = teamRepository.save(team);
        
        TeamResponse res = teamMapper.toResponse(team);
        res.setIsCaptain(true);
        return res;
    }

    @Override
    public List<TeamResponse> getMyTeams(String userId) {
        // Lấy đội mà mình làm đội trưởng
        List<Team> teamsAsCaptain = teamRepository.findByCaptainId(userId);
        
        // Lấy đội mà mình làm thành viên đã chấp nhận
        List<TeamMember> memberships = teamMemberRepository.findByUserIdAndStatus(userId, "ACCEPTED");
        List<Team> teamsAsMember = memberships.stream()
                .map(TeamMember::getTeam)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        // Gộp lại và loại bỏ trùng lặp (dùng Set)
        Set<Team> allTeams = new HashSet<>(teamsAsCaptain);
        allTeams.addAll(teamsAsMember);

        return allTeams.stream().map(team -> {
            TeamResponse res = teamMapper.toResponse(team);
            res.setIsCaptain(team.getCaptainId().equals(userId));
            return res;
        }).sorted(Comparator.comparing(TeamResponse::getCreatedAt).reversed())
          .collect(Collectors.toList());
    }

    @Override
    public void deleteTeam(String teamId, String userId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đội bóng"));
        
        if (!team.getCaptainId().equals(userId)) {
            throw new AppException(403, "Bạn không phải đội trưởng của đội này!");
        }
        teamRepository.delete(team);
    }

    @Override
    public List<Map<String, Object>> getTeamMembers(String teamId) {
        return teamMemberRepository.findByTeamId(teamId).stream().map(member -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", member.getId());
            map.put("teamId", member.getTeamId());
            map.put("userId", member.getUserId());
            map.put("status", member.getStatus());
            if (member.getUser() != null) {
                // SỬA: getUser().getFullName() thay vì getName()
                map.put("userName", member.getUser().getFullName());
                map.put("userEmail", member.getUser().getEmail());
            }
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public void inviteMember(String teamId, String captainId, String email) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đội bóng"));
        
        if (!team.getCaptainId().equals(captainId)) {
            throw new AppException(403, "Chỉ đội trưởng mới có quyền mời thành viên");
        }

        User userToInvite = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy người dùng với email này"));

        if (team.getCaptainId().equals(userToInvite.getId())) {
            throw new AppException(400, "Bạn không thể tự mời chính mình");
        }

        if (teamMemberRepository.findByTeamIdAndUserId(teamId, userToInvite.getId()).isPresent()) {
            throw new AppException(400, "Người dùng này đã ở trong đội hoặc đã được mời");
        }

        TeamMember member = new TeamMember();
        member.setTeamId(teamId);
        member.setUserId(userToInvite.getId());
        member.setStatus("PENDING");
        member.setCreatedAt(LocalDateTime.now());
        teamMemberRepository.save(member);
    }

    @Override
    public void removeMember(String teamId, String captainId, String memberId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy đội bóng"));
        
        if (!team.getCaptainId().equals(captainId)) {
            throw new AppException(403, "Chỉ đội trưởng mới có quyền xóa thành viên");
        }

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy thành viên"));

        if (!member.getTeamId().equals(teamId)) {
            throw new AppException(400, "Thành viên không thuộc đội này");
        }

        teamMemberRepository.delete(member);
    }

    @Override
    public List<Map<String, Object>> getMyInvitations(String userId) {
        return teamMemberRepository.findByUserIdAndStatus(userId, "PENDING").stream().map(inv -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", inv.getId());
            map.put("teamId", inv.getTeamId());
            if (inv.getTeam() != null) {
                map.put("teamName", inv.getTeam().getName());
                if (inv.getTeam().getCaptain() != null) {
                    // SỬA: getCaptain().getFullName() thay vì getName()
                    map.put("captainName", inv.getTeam().getCaptain().getFullName());
                }
            }
            return map;
        }).collect(Collectors.toList());
    }

    @Override
    public void respondToInvitation(String invitationId, String userId, boolean accept) {
        TeamMember invitation = teamMemberRepository.findById(invitationId)
                .orElseThrow(() -> new AppException(404, "Không tìm thấy lời mời"));

        if (!invitation.getUserId().equals(userId)) {
            throw new AppException(403, "Bạn không có quyền thao tác trên lời mời này");
        }

        if (accept) {
            invitation.setStatus("ACCEPTED");
            teamMemberRepository.save(invitation);
        } else {
            teamMemberRepository.delete(invitation);
        }
    }
}