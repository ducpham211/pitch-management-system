import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_MATCHES } from '../../mocks/matchData';
import MatchCard from '../../components/common/MatchCard';
import Button from '../../components/common/Button';
import { FaPlus, FaTimes, FaHandshake } from 'react-icons/fa';

const MatchBoard = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState(MOCK_MATCHES);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '', pitchName: '', date: '', time: '', levelRequired: 'Trung bình', paymentPercentage: '50-50'
  });

  const [applyingMatchId, setApplyingMatchId] = useState<string | null>(null);

  const handleCreatePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const createdMatch = {
      id: `m${Date.now()}`,
      creatorName: 'FC Của Bạn',
      title: newPost.title,
      pitchName: newPost.pitchName,
      time: newPost.time,
      date: newPost.date,
      levelRequired: newPost.levelRequired,
      paymentPercentage: newPost.paymentPercentage,
      status: 'OPENING' as const
    };
    // Cập nhật state để hiển thị bài mới ngay lập tức
    setMatches([createdMatch, ...matches]);
    setIsCreateModalOpen(false);
    // Reset form
    setNewPost({ title: '', pitchName: '', date: '', time: '', levelRequired: 'Trung bình', paymentPercentage: '50-50' });
  };

  const handleConfirmApply = () => {
    setApplyingMatchId(null);
    // Chuyển hướng thẳng sang trang chat
    navigate('/tin-nhan');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative h-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bảng Tin Giao Hữu</h1>
          <p className="text-gray-600">Tìm kiếm đối thủ, ghép trận và mở rộng cộng đồng</p>
        </div>
        <Button 
          variant="primary" 
          className="flex items-center gap-2 px-6 py-3 shadow-md !bg-green-600 hover:!bg-green-700"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <FaPlus /> Đăng Tin Tìm Đối
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onApply={() => setApplyingMatchId(match.id)} 
          />
        ))}
      </div>

      {/* 1. Modal Form Đăng Tin Kèo Mới */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Tạo Kèo Mới</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                <FaTimes className="text-xl" />
              </button>
            </div>
            <form onSubmit={handleCreatePostSubmit} className="p-5 space-y-4">
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
                <Button type="button" variant="secondary" className="w-full" onClick={() => setIsCreateModalOpen(false)}>Hủy</Button>
                <Button type="submit" variant="primary" className="w-full !bg-green-600 hover:!bg-green-700">Đăng Tin Ngay</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal Xác Nhận Nhận Kèo */}
      {applyingMatchId && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
              <FaHandshake />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Xác Nhận Nhận Kèo</h3>
            <p className="text-gray-600 mb-6 text-sm">
              Bạn có chắc chắn muốn liên hệ nhận kèo này? Hệ thống sẽ mở một phòng chat riêng giữa đội bạn và chủ bài đăng để tiện thương lượng.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="w-full border border-gray-300" onClick={() => setApplyingMatchId(null)}>Đóng</Button>
              <Button variant="primary" className="w-full !bg-blue-600" onClick={handleConfirmApply}>Vào Chat</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MatchBoard;