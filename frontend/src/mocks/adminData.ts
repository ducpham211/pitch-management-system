export const ADMIN_STATS = {
  totalPlatformRevenue: 155000000,
  totalUsers: 1250,
  totalPitches: 45,
  pendingApprovals: 3
};

export const ADMIN_USERS = [
  { id: 'U01', name: 'Nguyễn Văn Player', email: 'player@gmail.com', role: 'PLAYER', status: 'ACTIVE' },
  { id: 'U02', name: 'Trần Văn Owner', email: 'owner@gmail.com', role: 'OWNER', status: 'ACTIVE' },
  { id: 'U03', name: 'Lê Cường', email: 'cuongle@gmail.com', role: 'PLAYER', status: 'LOCKED' },
];

export const ADMIN_PENDING_PITCHES = [
  { id: 'P01', name: 'Sân Cỏ Nhân Tạo KTX', owner: 'Trần Văn Owner', type: 'Sân 7 người', requestDate: '2023-10-25', status: 'PENDING' },
  { id: 'P02', name: 'Sân Mini Quận 9', owner: 'Phạm Thị D', type: 'Sân 5 người', requestDate: '2023-10-26', status: 'PENDING' },
];