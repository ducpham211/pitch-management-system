import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import Button from '../common/Button';

type CreateMatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (postData: any) => void;
};

const CreateMatchModal = ({ isOpen, onClose, onSubmit }: CreateMatchModalProps) => {
  const [newPost, setNewPost] = useState({
    title: '', pitchName: '', date: '', time: '', levelRequired: 'Trung bình', paymentPercentage: '50-50'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newPost);
    setNewPost({ title: '', pitchName: '', date: '', time: '', levelRequired: 'Trung bình', paymentPercentage: '50-50' });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Tạo Kèo Mới</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề bài đăng</label>
            <input required type="text" placeholder="VD: Tìm đội đá giao lưu vui vẻ..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sân (Dự kiến)</label>
            <input required type="text" placeholder="VD: Sân Chảo Lửa" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" value={newPost.pitchName} onChange={e => setNewPost({...newPost, pitchName: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đá</label>
              <input required type="date" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" value={newPost.date} onChange={e => setNewPost({...newPost, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khung giờ</label>
              <input required type="text" placeholder="VD: 18:30 - 20:00" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" value={newPost.time} onChange={e => setNewPost({...newPost, time: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ yêu cầu</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white" value={newPost.levelRequired} onChange={e => setNewPost({...newPost, levelRequired: e.target.value})}>
                <option>Yếu / Vui vẻ</option>
                <option>Trung bình</option>
                <option>Khá / Tốt</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉ lệ tiền sân</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white" value={newPost.paymentPercentage} onChange={e => setNewPost({...newPost, paymentPercentage: e.target.value})}>
                <option>50-50</option>
                <option>60-40</option>
                <option>70-30</option>
                <option>Campuchia</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="w-full" onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="primary" className="w-full !bg-green-600 hover:!bg-green-700">Đăng Tin Ngay</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMatchModal;