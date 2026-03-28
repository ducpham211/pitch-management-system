

export interface Pitch {
  id: number;
  name: string;
  location: string;
  type: string;
  price: string;
  image_url?: string;
}

export const MOCK_PITCHES: Pitch[] = [
  {
    id: 1,
    name: "Sân Bóng Chảo Lửa",
    location: "Tân Bình, TP. HCM",
    type: "Sân 5 người",
    price: "150.000đ - 300.000đ/giờ",
  },
  {
    id: 2,
    name: "Sân Cỏ Nhân Tạo KTX khu B",
    location: "Dĩ An, Bình Dương",
    type: "Sân 7 người",
    price: "200.000đ - 400.000đ/giờ",
  },
  {
    id: 3,
    name: "Sân Bóng Thống Nhất",
    location: "Quận 10, TP. HCM",
    type: "Sân 11 người",
    price: "500.000đ - 800.000đ/giờ",
  },
  {
    id: 4,
    name: "Sân Mini Thanh Đa",
    location: "Bình Thạnh, TP. HCM",
    type: "Sân 5 người",
    price: "120.000đ - 250.000đ/giờ",
  },
  {
    id: 5,
    name: "Sân Vận Động Hoa Lư",
    location: "Quận 1, TP. HCM",
    type: "Sân 7 người",
    price: "300.000đ - 500.000đ/giờ",
  }
];

export interface TimeSlot {
  id: string;
  pitchId: number;
  date: string; 
  startTime: string; 
  endTime: string; 
  price: number;
  isBooked: boolean;
}


const today = new Date().toISOString().split('T')[0];

export const MOCK_SLOTS: TimeSlot[] = [
  { id: 'slot_1', pitchId: 1, date: today, startTime: '17:00', endTime: '18:30', price: 300000, isBooked: true },
  { id: 'slot_2', pitchId: 1, date: today, startTime: '18:30', endTime: '20:00', price: 300000, isBooked: false },
  { id: 'slot_3', pitchId: 1, date: today, startTime: '20:00', endTime: '21:30', price: 250000, isBooked: false },
  { id: 'slot_4', pitchId: 1, date: today, startTime: '21:30', endTime: '23:00', price: 200000, isBooked: false },
  
  { id: 'slot_5', pitchId: 2, date: today, startTime: '18:00', endTime: '19:30', price: 400000, isBooked: false },
  { id: 'slot_6', pitchId: 2, date: today, startTime: '19:30', endTime: '21:00', price: 400000, isBooked: true },
];