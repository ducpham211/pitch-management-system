import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchCard from '../../components/common/MatchCard';
import Button from '../../components/common/Button';
import { FaPlus, FaGlobe, FaListAlt, FaCheckCircle } from 'react-icons/fa';
import CreateMatchModal from '../../components/match/CreateMatchModal';
import ConfirmApplyModal from '../../components/match/ConfirmApplyModal';
import axios from 'axios';

const MatchBoard = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'my'>('all');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [applyingMatch, setApplyingMatch] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setCurrentUserId(decodedPayload.sub || decodedPayload.id || decodedPayload.userId);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/match-posts`);
      setMatches(response.data.content || response.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [API_URL]);

  const handleCreatePostSubmit = async (postData: any) => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      await axios.post(`${API_URL}/match-posts`, postData, config);
      fetchMatches();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Không thể tạo bài đăng. Vui lòng thử lại!');
    }
  };

  const handleConfirmApply = () => {
    setApplyingMatch(null);
    navigate('/tin-nhan');
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!window.confirm('Bạn chắc chắn muốn chốt kèo với người này? Bài đăng sẽ tự động đóng lại.')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      await axios.put(`${API_URL}/match-requests/${requestId}/status`, {
        status: 'ACCEPTED'
      }, config);
      
      alert('Chốt kèo thành công! Bài đăng đã được đóng.');
      fetchMatches();
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi chốt kèo!');
    }
  };

  const publicMatches = matches.filter(m => m.status === 'OPEN' || m.status === 'OPENING');
  const myMatches = matches.filter(m => m.userId === currentUserId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative h-full">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bảng Tin Giao Hữu</h1>
          <p className="text-gray-600">Tìm kiếm đối thủ, ghép trận và mở rộng cộng đồng</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-gray-100 p-1 rounded-lg flex">
            <button 
              onClick={() => setViewMode('all')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${viewMode === 'all' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FaGlobe /> Bảng chung
            </button>
            <button 
              onClick={() => setViewMode('my')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition ${viewMode === 'my' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <FaListAlt /> Bài của tôi
            </button>
          </div>
          <Button 
            variant="primary" 
            className="flex items-center gap-2 px-6 py-2 shadow-md !bg-green-600 hover:!bg-green-700"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FaPlus /> Đăng Tin
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : viewMode === 'all' ? (
        publicMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicMatches.map((match, index) => (
              <MatchCard 
                key={match.id || index} 
                match={match} 
                onApply={() => setApplyingMatch(match)} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">Hiện chưa có bài đăng tìm đối nào.</p>
          </div>
        )
      ) : (
        <div className="space-y-6">
          {myMatches.length > 0 ? (
            myMatches.map((match) => (
              <div key={match.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3 border-r md:pr-6 border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-800">{match.message || 'Tin tìm đối'}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${match.status === 'CLOSED' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'}`}>
                      {match.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Ngày đá: {match.date ? match.date.split('T')[0] : 'Chưa rõ'}</p>
                  <p className="text-sm text-gray-600 mb-1">Trình độ: <span className="font-medium text-blue-600">{match.skillLevel}</span></p>
                  <p className="text-sm text-gray-600">Kiểu chia: <span className="font-medium text-green-600">{match.costSharing}</span></p>
                </div>
                
                <div className="md:w-2/3">
                  <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                    Danh sách người xin nhận kèo
                  </h4>
                  {match.requests && match.requests.length > 0 ? (
                    <div className="space-y-3">
                      {match.requests.map((req: any) => (
                        <div key={req.id} className="bg-gray-50 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-gray-200">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">User ID: {req.requesterId.substring(0,8)}...</p>
                            <p className="text-gray-600 text-sm mt-1 flex gap-1">
                              <span className="font-medium">Lời nhắn:</span> {req.message}
                            </p>
                          </div>
                          {match.status !== 'CLOSED' && req.status !== 'ACCEPTED' ? (
                            <Button variant="primary" className="!bg-green-600 text-sm py-2 px-4 whitespace-nowrap" onClick={() => handleAcceptRequest(req.id)}>
                              <FaCheckCircle className="inline mr-1"/> Chốt Kèo
                            </Button>
                          ) : req.status === 'ACCEPTED' ? (
                            <span className="text-green-600 font-bold text-sm bg-green-100 px-3 py-1 rounded-full">Đã chốt</span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic mt-2">Chưa có ai gửi yêu cầu nhận kèo này.</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">Bạn chưa đăng bài tìm đối nào.</p>
            </div>
          )}
        </div>
      )}

      <CreateMatchModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreatePostSubmit} 
      />

      <ConfirmApplyModal 
        isOpen={!!applyingMatch} 
        match={applyingMatch} 
        onClose={() => setApplyingMatch(null)} 
        onConfirm={handleConfirmApply} 
      />
    </div>
  );
};

export default MatchBoard;