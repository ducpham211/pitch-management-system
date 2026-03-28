export const OWNER_STATS = {
  totalRevenue: 15500000,
  totalBookings: 45,
  pendingDeposits: 5,
  completedMatches: 40
};

export const OWNER_PITCHES = [
  { id: 1, name: 'Sân Bóng Chảo Lửa', type: 'Sân 5 người', status: 'Hoạt động', price: '150k - 300k' },
  { id: 2, name: 'Sân Bóng Chảo Lửa 2', type: 'Sân 7 người', status: 'Hoạt động', price: '250k - 400k' },
  { id: 3, name: 'Sân Chảo Lửa VIP', type: 'Sân 5 người', status: 'Bảo trì', price: '200k - 350k' }
];

export const OWNER_BOOKINGS = [
  { id: 'BK101', customer: 'Nguyễn Văn A', phone: '090111222', pitch: 'Sân Bóng Chảo Lửa', time: '18:30, Hôm nay', deposit: 90000, status: 'PENDING' },
  { id: 'BK102', customer: 'Trần Thị B', phone: '090333444', pitch: 'Sân Bóng Chảo Lửa 2', time: '19:30, Hôm nay', deposit: 120000, status: 'APPROVED' },
  { id: 'BK103', customer: 'Lê Văn C', phone: '090555666', pitch: 'Sân Chảo Lửa VIP', time: '17:00, Hôm qua', deposit: 100000, status: 'COMPLETED' },
];