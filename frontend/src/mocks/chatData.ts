export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isMine: boolean;
}

export interface Conversation {
  id: string;
  partnerName: string;
  matchTitle: string;
  lastMessage: string;
  unread: number;
  avatar: string;
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv1',
    partnerName: 'FC Anh Em',
    matchTitle: 'Tìm đội đá giao lưu, vui vẻ không quạu',
    lastMessage: 'Ok chốt sân Chảo Lửa nhé bạn!',
    unread: 2,
    avatar: 'AE'
  },
  {
    id: 'conv2',
    partnerName: 'Storm FC',
    matchTitle: 'Cần cọ xát chuẩn bị giải',
    lastMessage: 'Đội bạn có áo màu gì để mình tránh?',
    unread: 0,
    avatar: 'ST'
  }
];

export const MOCK_MESSAGES: Message[] = [
  { id: 'msg1', senderId: 'them', text: 'Chào bạn, mình thấy đội bạn đang tìm đối.', timestamp: '14:30', isMine: false },
  { id: 'msg2', senderId: 'me', text: 'Chào bạn, đúng rồi. Đội bạn trình độ thế nào?', timestamp: '14:32', isMine: true },
  { id: 'msg3', senderId: 'them', text: 'Bên mình đá cũng trung bình khá thôi, chủ yếu rèn thể lực.', timestamp: '14:35', isMine: false },
  { id: 'msg4', senderId: 'me', text: 'Thế hợp lý rồi. Tiền sân chia 50-50 nhé?', timestamp: '14:36', isMine: true },
  { id: 'msg5', senderId: 'them', text: 'Ok chốt sân Chảo Lửa nhé bạn!', timestamp: '14:40', isMine: false },
];