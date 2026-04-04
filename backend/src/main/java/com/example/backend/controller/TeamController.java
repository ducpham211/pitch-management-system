package com.example.backend.controller;

import com.example.backend.dto.request.TeamCreateRequest;
import com.example.backend.dto.response.TeamResponse;
import com.example.backend.entity.Team;
import com.example.backend.service.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {
    private final TeamService teamService;
    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(@RequestBody TeamCreateRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        TeamResponse response = teamService.createTeam(userId, request);
        return ResponseEntity.ok(response);
    }
    @PutMapping("/{id}")
    public ResponseEntity<TeamResponse> updateTeam(@PathVariable ("id") String teamId, @RequestBody TeamCreateRequest request){
        TeamResponse response = teamService.updateTeam(teamId, request);
        return ResponseEntity.ok(response);
    };
}
