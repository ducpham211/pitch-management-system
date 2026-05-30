import axiosClient from './axiosClient';

export interface TeamCreateRequest {
  name: string;
  description: string;
  level: string;
}

export const teamApi = {
  getMyTeams: () => axiosClient.get('/teams/me'),
  createTeam: (data: TeamCreateRequest) => axiosClient.post('/teams', data),
  updateTeam: (id: string, data: TeamCreateRequest) => axiosClient.put(`/teams/${id}`, data),
  deleteTeam: (id: string) => axiosClient.delete(`/teams/${id}`),
  getTeamMembers: (teamId: string) => axiosClient.get(`/teams/${teamId}/members`),
  inviteMember: (teamId: string, email: string) => axiosClient.post(`/teams/${teamId}/invite`, { email }),
  removeMember: (teamId: string, memberId: string) => axiosClient.delete(`/teams/${teamId}/members/${memberId}`),
  getMyInvitations: () => axiosClient.get('/teams/invitations/me'),
  respondToInvitation: (invitationId: string, accept: boolean) => axiosClient.put(`/teams/invitations/${invitationId}`, { accept })
};