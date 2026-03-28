import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_MATCHES } from '../../mocks/matchData';
import MatchCard from '../../components/common/MatchCard';
import Button from '../../components/common/Button';
import { FaPlus } from 'react-icons/fa';

const MatchBoard = () => {
  const navigate = useNavigate();
  const [matches] = useState(MOCK_MATCHES);

  const handleApplyMatch = (matchId: string) => {
    alert(`Đã gửi yêu cầu tham gia trận đấu ID: ${matchId}`);
  };

  const handleCreatePost = () => {
    alert('Chuyển đến trang Đăng tin mới');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bảng Tin Giao Hữu</h1>
          <p className="text-gray-600">Tìm kiếm đối thủ, ghép trận và mở rộng cộng đồng</p>
        </div>
        <Button 
          variant="primary" 
          className="flex items-center gap-2 px-6 py-3 shadow-md"
          onClick={handleCreatePost}
        >
          <FaPlus /> Đăng Tin Tìm Đối
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onApply={() => handleApplyMatch(match.id)} 
          />
        ))}
      </div>
    </div>
  );
};

export default MatchBoard;