import axiosClient from './axiosClient';

export const adminApi = {
  getStats: () => axiosClient.get('/admin/stats'),
  getPendingOwners: () => axiosClient.get('/admin/users/pending-owners'),
  approveOwner: (userId: string) => axiosClient.put(`/admin/users/${userId}/approve-owner`),
  toggleUserStatus: (userId: string, status: string) => axiosClient.put(`/admin/users/${userId}/status?status=${status}`),
};