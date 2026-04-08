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
};
