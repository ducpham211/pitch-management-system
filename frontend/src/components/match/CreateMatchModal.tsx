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
    message: '', 
    date: '', 
    timeStartStr: '18:00', 
    timeEndStr: '19:30',   
    skillLevel: 'BEGINNER', 
    costSharing: '50-50',
    postType: 'FIND_OPPONENT' 
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let finalTimeStart = null;
    let finalTimeEnd = null;

    if (newPost.date) {
        finalTimeStart = `${newPost.date}T${newPost.timeStartStr}:00`;
        finalTimeEnd = `${newPost.date}T${newPost.timeEndStr}:00`;
    }

    const formattedPost = {
        message: newPost.message,
        date: newPost.date,
        timeStart: finalTimeStart,
        timeEnd: finalTimeEnd,
        skillLevel: newPost.skillLevel,
        costSharing: newPost.costSharing,
        postType: newPost.postType,
    };

    onSubmit(formattedPost);

    setNewPost({ 
      message: '', date: '', timeStartStr: '18:00', timeEndStr: '19:30', 
      skillLevel: 'BEGINNER', costSharing: '50-50', postType: 'FIND_OPPONENT' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">Đăng Tin Tìm Đối/Thành Viên</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mục đích</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white" value={newPost.postType} onChange={e => setNewPost({...newPost, postType: e.target.value})}>
              <option value="FIND_OPPONENT">Tìm Đối Thủ (Giao Hữu)</option>
              <option value="FIND_MEMBER">Tìm Đồng Đội (Tuyển Thành Viên)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề / Lời nhắn</label>
            <input required type="text" placeholder="VD: Sân Chảo Lửa, đá vui vẻ..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none" value={newPost.message} onChange={e => setNewPost({...newPost, message: e.target.value})} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày đá</label>
              <input required type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none text-sm" value={newPost.date} onChange={e => setNewPost({...newPost, date: e.target.value})} />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
              <input required type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none text-sm" value={newPost.timeStartStr} onChange={e => setNewPost({...newPost, timeStartStr: e.target.value})} />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
              <input required type="time" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 outline-none text-sm" value={newPost.timeEndStr} onChange={e => setNewPost({...newPost, timeEndStr: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trình độ yêu cầu</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white" value={newPost.skillLevel} onChange={e => setNewPost({...newPost, skillLevel: e.target.value})}>
                <option value="BEGINNER">Yếu / Vui vẻ</option>
                <option value="INTERMEDIATE">Trung bình / Khá</option>
                <option value="ADVANCED">Tốt / Chuyên nghiệp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉ lệ tiền sân</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none bg-white" value={newPost.costSharing} onChange={e => setNewPost({...newPost, costSharing: e.target.value})}>
                <option value="50-50">50-50</option>
                <option value="60-40">60-40</option>
                <option value="70-30">70-30</option>
                <option value="Share đều">Chia đều / Campuchia</option>
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