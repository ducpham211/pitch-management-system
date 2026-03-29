import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_MATCHES } from '../../mocks/matchData';
import MatchCard from '../../components/common/MatchCard';
import Button from '../../components/common/Button';
import { FaPlus } from 'react-icons/fa';
import CreateMatchModal from '../../components/match/CreateMatchModal';
import ConfirmApplyModal from '../../components/match/ConfirmApplyModal';

const MatchBoard = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState(MOCK_MATCHES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [applyingMatchId, setApplyingMatchId] = useState<string | null>(null);

  const handleCreatePostSubmit = (postData: any) => {
    const createdMatch = {
      id: `m${Date.now()}`,
      creatorName: 'FC Của Bạn',
      title: postData.title,
      pitchName: postData.pitchName,
      time: postData.time,
      date: postData.date,
      levelRequired: postData.levelRequired,
      paymentPercentage: postData.paymentPercentage,
      status: 'OPENING' as const
    };
    setMatches([createdMatch, ...matches]);
    setIsCreateModalOpen(false);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
          <MatchCard 
            key={match.id} 
            match={match} 
            onApply={() => setApplyingMatchId(match.id)} 
          />
        ))}
      </div>

      <CreateMatchModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreatePostSubmit} 
      />

      <ConfirmApplyModal 
        isOpen={!!applyingMatchId} 
        onClose={() => setApplyingMatchId(null)} 
        onConfirm={handleConfirmApply} 
      />

    </div>
  );
};

export default MatchBoard;