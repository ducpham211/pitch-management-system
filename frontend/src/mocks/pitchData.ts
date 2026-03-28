// src/mocks/pitchData.ts

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