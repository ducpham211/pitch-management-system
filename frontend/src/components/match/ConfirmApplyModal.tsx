import { useState } from 'react';
import { FaHandshake } from 'react-icons/fa';
import Button from '../common/Button';
import axios from 'axios';

type ConfirmApplyModalProps = {
  isOpen: boolean;
  match: any;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmApplyModal = ({ isOpen, match, onClose, onConfirm }: ConfirmApplyModalProps) => {
  const [message, setMessage] = useState('Chào bạn, đội mình muốn nhận kèo này!');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  if (!isOpen || !match) return null;

  const handleApplyMatch = async () => {
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('Vui lòng đăng nhập để nhận kèo!');
        setIsSubmitting(false);
        return;
      }

      const payloadBase64 = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payloadBase64));
      const currentUserId = decodedPayload.sub || decodedPayload.id || decodedPayload.userId;

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(`${API_URL}/match-requests`, {
        postId: match.id,
        requesterId: currentUserId,
        message: message
      }, config);

      alert('Đã gửi yêu cầu nhận kèo và tạo phòng chat thành công!');
      onConfirm();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 500) {
         setError('Bạn đã gửi yêu cầu nhận kèo này trước đó rồi! Vui lòng vào mục Tin nhắn để chat.');
      } else {
        setError(err.response?.data?.message || 'Không thể gửi yêu cầu nhận kèo lúc này.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
          <FaHandshake />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Xác Nhận Nhận Kèo</h3>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-left">
            {error}
          </div>
        )}

        <p className="text-gray-600 mb-4 text-sm">
          Nhập lời nhắn gửi đến chủ bài đăng:
        </p>
        
        <textarea 
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none mb-6 resize-none h-24"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ví dụ: Đội mình 7 người, trình độ trung bình..."
        />

        <div className="flex gap-3">
          <Button variant="secondary" className="w-full border border-gray-300" onClick={onClose} disabled={isSubmitting}>Hủy</Button>
          <Button variant="primary" className="w-full !bg-green-600 hover:!bg-green-700" onClick={handleApplyMatch} disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Gửi Yêu Cầu'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmApplyModal;