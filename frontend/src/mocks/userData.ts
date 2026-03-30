export const MOCK_USER = {
  name: 'Nguyễn Văn Player',
  email: 'player@pitchsync.com',
  phone: '0901234567',
  avatar: 'NP',
  address: 'Quận 1, TP. Hồ Chí Minh'
};

export interface BookingHistory {
  id: string;
  pitchName: string;
  date: string;
  time: string;
  totalPrice: number;
  deposit: number;
  status: 'SUCCESS' | 'UPCOMING' | 'CANCELLED';
}

export const MOCK_BOOKING_HISTORY: BookingHistory[] = [
  {
    id: 'BK00123',
    pitchName: 'Sân Bóng Chảo Lửa',
    date: new Date().toISOString().split('T')[0],
    time: '18:30 - 20:00',
    totalPrice: 300000,
    deposit: 90000,
    status: 'UPCOMING'
  },
  {
    id: 'BK00098',
    pitchName: 'Sân Vận Động Hoa Lư',
    date: '2023-10-15',
    time: '17:00 - 18:30',
    totalPrice: 500000,
    deposit: 150000,
    status: 'SUCCESS'
  },
  {
    id: 'BK00045',
    pitchName: 'Sân Mini Thanh Đa',
    date: '2023-09-20',
    time: '20:00 - 21:30',
    totalPrice: 250000,
    deposit: 75000,
    status: 'CANCELLED'
  }
];