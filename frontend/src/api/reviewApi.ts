import axiosClient from './axiosClient';

export const reviewApi = {
  createReview: (revieweeId: string, matchRequestId: string, reason: string) =>
    axiosClient.post('/reviews', { revieweeId, matchRequestId, reason }),
};