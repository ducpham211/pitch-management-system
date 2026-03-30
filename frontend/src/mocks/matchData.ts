export interface MatchPost {
  id: string;
  creatorName: string;
  title: string;
  pitchName: string;
  time: string;
  date: string;
  levelRequired: string;
  paymentPercentage: string;
  status: 'OPENING' | 'MATCHED' | 'CANCELLED';
}

export const MOCK_MATCHES: MatchPost[] = [
  {
    id: 'm1',
    creatorName: 'FC Anh Em',
    title: 'Tìm đội đá giao lưu, vui vẻ không quạu',
    pitchName: 'Sân Bóng Chảo Lửa',
    time: '18:30 - 20:00',
    date: new Date().toISOString().split('T')[0],
    levelRequired: 'Trung bình yếu',
    paymentPercentage: '50-50',
    status: 'OPENING'
  },
  {
    id: 'm2',
    creatorName: 'Storm FC',
    title: 'Cần cọ xát chuẩn bị giải, tìm đối cứng',
    pitchName: 'Sân Vận Động Hoa Lư',
    time: '20:00 - 21:30',
    date: new Date().toISOString().split('T')[0],
    levelRequired: 'Khá / Tốt',
    paymentPercentage: '70-30',
    status: 'OPENING'
  },
  {
    id: 'm3',
    creatorName: 'Gà Con FC',
    title: 'Đội thiếu người, cần ghép thêm 2 bạn',
    pitchName: 'Sân Mini Thanh Đa',
    time: '17:00 - 18:30',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    levelRequired: 'Vui vẻ',
    paymentPercentage: 'Campuchia',
    status: 'OPENING'
  }
];