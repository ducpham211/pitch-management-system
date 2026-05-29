import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchCard from '../../components/common/MatchCard';
import Button from '../../components/common/Button';
import { FaPlus, FaGlobe, FaListAlt, FaClock, FaCalendarAlt, FaRobot, FaCheckCircle, FaHistory } from 'react-icons/fa';
import CreateMatchModal from '../../components/match/CreateMatchModal';
import AutoMatchModal from '../../components/match/AutoMatchModal';
import ConfirmApplyModal from '../../components/match/ConfirmApplyModal';
import AutoMatchView from '../../components/match/AutoMatchView';
import { useAutoMatch } from '../../hooks/useAutoMatch';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import PopupMessage from '../../components/common/PopupMessage';

const MatchBoard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [matches, setMatches] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'my' | 'ai' | 'history'>('all');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAutoMatchModalOpen, setIsAutoMatchModalOpen] = useState(false);
  const [applyingMatch, setApplyingMatch] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [popupInfo, setPopupInfo] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'info',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  const closePopup = () => {
    setPopupInfo(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (!user && !localStorage.getItem('accessToken')) {
      setPopupInfo({
        isOpen: true,
        type: 'info',
        title: 'Yêu cầu đăng nhập',
        message: 'Bạn cần đăng nhập để xem bảng tin và tham gia ghép trận!',
        onConfirm: () => {
          closePopup();
          navigate('/login');
        }
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setCurrentUserId(decodedPayload.sub || decodedPayload.id || decodedPayload.userId);
      } catch (e) {}
    }
  }, []);

  const autoMatch = useAutoMatch(currentUserId, (data) => setMatches(data), setViewMode);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const [postsRes, fieldsRes] = await Promise.all([
          axios.get(`${API_URL}/match-posts?size=100`, config),
          axios.get(`${API_URL}/fields`, config)
        ]);
        setMatches(postsRes.data.content || postsRes.data || []);
        setFields(fieldsRes.data.content || fieldsRes.data || []);
      } catch (error) {} finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [API_URL]);

  const handleCreatePostSubmit = async (postData: any) => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post(`${API_URL}/match-posts`, postData, config);
      const res = await axios.get(`${API_URL}/match-posts?size=100`, config);
      setMatches(res.data.content || res.data || []);
      setIsCreateModalOpen(false);
    } catch (error) {
      alert('Không thể tạo bài đăng. Vui lòng thử lại!');
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!window.confirm('Bạn chắc chắn muốn chốt kèo với người này? Bài đăng sẽ tự động đóng lại.')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/match-requests/${requestId}/status`, { status: 'ACCEPTED' }, config);
      alert('Chốt kèo thành công! Bài đăng đã được đóng.');
      const res = await axios.get(`${API_URL}/match-posts?size=100`, config);
      setMatches(res.data.content || res.data || []);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi chốt kèo!');
    }
  };

  const formatTimeStr = (timeStr: any) => {
    if (!timeStr) return '';
    if (Array.isArray(timeStr)) return `${timeStr[0].toString().padStart(2, '0')}:${(timeStr[1] || 0).toString().padStart(2, '0')}`;
    const str = String(timeStr);
    if (str.includes('T')) return str.split('T')[1].substring(0, 5);
    if (str.includes(' ')) return str.split(' ')[1].substring(0, 5);
    if (str.includes(':')) return str.substring(0, 5);
    return str;
  };

  const formatDateStr = (dateStr: any) => {
    if (!dateStr) return 'Chưa rõ';
    if (Array.isArray(dateStr)) return `${dateStr[2].toString().padStart(2, '0')}/${dateStr[1].toString().padStart(2, '0')}/${dateStr[0]}`;
    let str = String(dateStr);
    if (str.includes('T')) str = str.split('T')[0];
    else if (str.includes(' ')) str = str.split(' ')[0];
    const parts = str.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : str;
  };

  const translateSkillLevel = (level: string) => {
    switch(level) {
      case 'BEGINNER': return 'Yếu / Vui vẻ';
      case 'INTERMEDIATE': return 'Trung bình / Khá';
      case 'ADVANCED': return 'Tốt / Chuyên nghiệp';
      default: return level || 'Mọi trình độ';
    }
  };

  const publicMatches = matches.filter(m => (m.status === 'OPEN' || m.status === 'OPENING') && (!m.message || !m.message.startsWith("[LIVE_MATCH]")));
  const myMatches = matches.filter(m => m.userId === currentUserId && (!m.message || !m.message.startsWith("[LIVE_MATCH]")));
  
  const historyMatches = matches.filter(m => 
      (m.userId === currentUserId && (m.status === 'CLOSED' || (m.requests && m.requests.length > 0)) && (!m.message || !m.message.startsWith("[LIVE_MATCH]"))) || 
      (m.requests && m.requests.some((r: any) => r.requesterId === currentUserId))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative h-full">
      <div className="flex flex-col xl:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bảng Tin Giao Hữu</h1>
          <p className="text-gray-600">Tìm kiếm đối thủ, ghép trận và mở rộng cộng đồng</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          <div className="bg-gray-100 p-1 rounded-lg flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setViewMode('all')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${viewMode === 'all' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}><FaGlobe /> Bảng chung</button>
            <button onClick={() => setViewMode('my')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${viewMode === 'my' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}><FaListAlt /> Bài của tôi</button>
            <button onClick={() => setViewMode('history')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${viewMode === 'history' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}><FaHistory /> Lịch sử</button>
            {autoMatch.isPolling && <button onClick={() => setViewMode('ai')} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${viewMode === 'ai' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}><FaRobot className="animate-spin" /> Đang Ghép Tự Động</button>}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {viewMode !== 'ai' && (
                <Button variant="primary" className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 shadow-md !bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-none transition-transform hover:scale-105" onClick={() => {
                    if (autoMatch.isPolling) { setViewMode('ai'); } else { setIsAutoMatchModalOpen(true); }
                }}>
                  <FaRobot className={`text-lg ${autoMatch.isPolling ? 'animate-spin' : 'animate-pulse'}`} /> {autoMatch.isPolling ? 'Đang Chạy Auto' : 'Auto Ghép'}
                </Button>
            )}
            <Button variant="primary" className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 shadow-md !bg-green-600 hover:!bg-green-700" onClick={() => setIsCreateModalOpen(true)}>
              <FaPlus /> Đăng Tin
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : viewMode === 'ai' ? (
        <AutoMatchView 
          aiStep={autoMatch.aiStep}
          aiResults={autoMatch.aiResults}
          pendingRequest={autoMatch.pendingRequest}
          fields={fields}
          isPolling={autoMatch.isPolling}
          isProcessingMatch={autoMatch.isProcessingMatch}
          onCancelSearch={autoMatch.handleCancelSearch}
          onAcceptLiveMatch={autoMatch.handleAcceptLiveMatch}
          onDeclineLiveMatch={autoMatch.handleDeclineLiveMatch}
          onAcceptPending={autoMatch.handleAcceptPending}
          onRejectPending={autoMatch.handleRejectPending}
          onAcceptStaticMatch={autoMatch.handleAcceptStaticSuggestion}
          foundLivePost={autoMatch.foundLivePost}
        />
      ) : viewMode === 'history' ? (
        <div className="space-y-4 max-w-4xl mx-auto">
          {historyMatches.length > 0 ? historyMatches.map((match) => {
             const myRequest = match.requests?.find((r:any) => r.requesterId === currentUserId);
             const isMyPost = match.userId === currentUserId;
             const statusLabel = isMyPost 
                ? (match.status === 'CLOSED' ? 'Đã Chốt Kèo' : 'Đang Nhận Yêu Cầu') 
                : (myRequest?.status === 'ACCEPTED' ? 'Đã Được Duyệt' : (myRequest?.status === 'REJECTED' ? 'Bị Từ Chối' : 'Đang Chờ Duyệt'));
             
             return (
                <div key={match.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-md transition">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            {isMyPost ? <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Tôi Đăng Nhận Kèo</span> : <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Tôi Xin Nhận Kèo</span>}
                        </div>
                        <h4 className="font-bold text-gray-800 text-lg mb-1">{match.message.replace('[LIVE_MATCH]', '').trim()}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-3">
                            <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-red-400"/> {formatDateStr(match.date)}</span>
                            <span className="flex items-center gap-1.5"><FaClock className="text-orange-400"/> {formatTimeStr(match.timeStart)}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto justify-end border-t border-gray-100 md:border-none pt-3 md:pt-0">
                        <span className={`px-4 py-2 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
                            statusLabel.includes('Đã') || statusLabel.includes('Được') ? 'bg-green-50 text-green-700 border-green-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                        }`}>
                            {statusLabel.includes('Đã') || statusLabel.includes('Được') ? <FaCheckCircle/> : <FaClock/>} {statusLabel}
                        </span>
                        {(statusLabel.includes('Đã Chốt') || statusLabel.includes('Được Duyệt')) && (
                            <Button variant="primary" className="!bg-blue-600 hover:!bg-blue-700 shadow-md py-2 px-5 rounded-xl" onClick={() => navigate('/messages')}>Vào Chat</Button>
                        )}
                    </div>
                </div>
             )
          }) : (
             <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                <FaHistory className="text-5xl text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Bạn chưa có lịch sử ghép trận nào.</p>
             </div>
          )}
        </div>
      ) : viewMode === 'all' ? (
        publicMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publicMatches.map((match, index) => (
              <MatchCard 
                key={match.id || index} 
                match={match} 
                fieldName={fields.find(f => f.id === match.fieldId)?.name}
                onApply={() => { setApplyingMatch(match); }} 
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
                  <div className="flex flex-col gap-1.5 mt-3">
                    <p className="text-sm text-gray-600 flex items-center gap-2"><FaCalendarAlt className="text-red-500"/> Ngày đá: <span className="font-medium text-gray-800">{formatDateStr(match.date)}</span></p>
                    <p className="text-sm text-gray-600 flex items-center gap-2"><FaClock className="text-orange-500"/> Khung giờ: <span className="font-medium text-gray-800">{formatTimeStr(match.timeStart)} - {formatTimeStr(match.timeEnd)}</span></p>
                    <p className="text-sm text-gray-600">Trình độ: <span className="font-medium text-blue-600">{translateSkillLevel(match.skillLevel)}</span></p>
                    <p className="text-sm text-gray-600">Sân: <span className="font-medium text-green-600">{fields.find(f => f.id === match.fieldId)?.name || 'Chưa chọn'}</span></p>
                  </div>
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

      <AutoMatchModal 
        isOpen={isAutoMatchModalOpen} 
        onClose={() => setIsAutoMatchModalOpen(false)} 
        onSubmit={(criteria) => {
            autoMatch.handleAutoMatchSubmit(criteria);
            setIsAutoMatchModalOpen(false);
        }} 
        fields={fields}
      />

      <CreateMatchModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSubmit={handleCreatePostSubmit} 
        fields={fields}
      />

      <ConfirmApplyModal 
        isOpen={!!applyingMatch} 
        match={applyingMatch} 
        onClose={() => setApplyingMatch(null)} 
        onConfirm={() => { setApplyingMatch(null); navigate('/messages'); }} 
      />

      <PopupMessage
        isOpen={popupInfo.isOpen}
        onClose={closePopup}
        type={popupInfo.type}
        title={popupInfo.title}
        message={popupInfo.message}
        onConfirm={popupInfo.onConfirm}
      />
    </div>
  );
};

export default MatchBoard;