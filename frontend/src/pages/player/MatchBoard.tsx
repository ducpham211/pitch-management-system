import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchCard from '../../components/common/MatchCard';
import Button from '../../components/common/Button';
import { FaPlus } from 'react-icons/fa';
import CreateMatchModal from '../../components/match/CreateMatchModal';
import ConfirmApplyModal from '../../components/match/ConfirmApplyModal';
import axios from 'axios';

const MatchBoard = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [applyingMatchId, setApplyingMatchId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get(`${API_URL}/match-posts`);
        setMatches(response.data.content || response.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, [API_URL]);

  const handleCreatePostSubmit = async (postData: any) => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      const response = await axios.post(`${API_URL}/match-posts`, postData, config);
      setMatches([response.data, ...matches]);
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error(error);
      alert('Không thể tạo bài đăng. Vui lòng thử lại!');
    }
  };

  const handleConfirmApply = () => {
    setApplyingMatchId(null);
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

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match, index) => (
            <MatchCard 
              key={match.id || index} 
              match={match} 
              onApply={() => setApplyingMatchId(match.id)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-lg">Hiện chưa có bài đăng tìm đối nào.</p>
        </div>
      )}

      <CreateMatchModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreatePostSubmit} 
      />

      <ConfirmApplyModal 
        isOpen={!!applyingMatchId} 
        matchId={applyingMatchId} 
        onClose={() => setApplyingMatchId(null)} 
        onConfirm={handleConfirmApply} 
      />

    </div>
  );
};

export default MatchBoard;