package com.example.backend.service;

import com.example.backend.dto.request.TeamCreateRequest;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.entity.Team;

public interface TeamService {
    TeamResponse createTeam (String userId, TeamCreateRequest request);
    TeamResponse updateTeam (String teamId, TeamCreateRequest request);
}
