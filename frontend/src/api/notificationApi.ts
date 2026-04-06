import axiosClient from './axiosClient';

export const notificationApi = {
  getMyNotifications: () => axiosClient.get('/notifications'),
  markAsRead: (id: string) => axiosClient.put(`/notifications/${id}/read`),
  markAllAsRead: () => axiosClient.put('/notifications/read-all'),
};