import axiosClient from './axiosClient';

export interface AdminCreateRequest {
  approve: boolean;
  finalPenalty?: number; 
}

export const adminApi = {
  // 1. GET: Danh sách User có bộ lọc
  getUsers: (params?: { role?: string; status?: string; minTrustScore?: number }) => 
    axiosClient.get('/admin/users', { params }),
    
  // 2. GET: Lịch sử đánh giá (Lọc theo trạng thái)
  getReviews: (params?: { status?: string }) => 
    axiosClient.get('/admin/reviews', { params }),
    
  // 3. PUT: Phán quyết của Admin cho một review
  adjudicateReview: (reviewId: string, data: AdminCreateRequest) => 
    axiosClient.put(`/admin/reviews/${reviewId}`, data),
};