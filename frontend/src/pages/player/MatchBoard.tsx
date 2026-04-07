import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import MatchCard from '../../components/common/MatchCard';
import Button from '../../components/common/Button';
import { FaPlus, FaGlobe, FaListAlt, FaClock, FaCalendarAlt, FaRobot, FaCheckCircle, FaHistory } from 'react-icons/fa';
import CreateMatchModal from '../../components/match/CreateMatchModal';
import AutoMatchModal from '../../components/match/AutoMatchModal';
import ConfirmApplyModal from '../../components/match/ConfirmApplyModal';
import AutoMatchView from '../../components/match/AutoMatchView';
import axios from 'axios';

const MatchBoard = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'all' | 'my' | 'ai' | 'history'>('all');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAutoMatchModalOpen, setIsAutoMatchModalOpen] = useState(false);
  const [applyingMatch, setApplyingMatch] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [aiStep, setAiStep] = useState<'SEARCHING' | 'MATCH_FOUND' | 'WAITING_OPPONENT' | 'RECEIVE_REQUEST' | 'FINISHED'>('SEARCHING');
  const [aiResults, setAiResults] = useState<any[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [isProcessingMatch, setIsProcessingMatch] = useState(false);
  
  const [searchCriteria, setSearchCriteria] = useState<any>(null);
  const [silentPostId, setSilentPostId] = useState<string | null>(null);
  const [skippedMatchIds, setSkippedMatchIds] = useState<string[]>([]);
  
  const [pendingRequest, setPendingRequest] = useState<any>(null);
  const [foundLivePost, setFoundLivePost] = useState<any>(null);
  const [waitingForPostId, setWaitingForPostId] = useState<string | null>(null);

  const searchCriteriaRef = useRef<any>(null);
  const silentPostIdRef = useRef<string | null>(null);
  const skippedMatchIdsRef = useRef<string[]>([]);
  const currentUserIdRef = useRef<string>('');
  const aiStepRef = useRef<string>('SEARCHING');
  const waitingForPostIdRef = useRef<string | null>(null);

  useEffect(() => { searchCriteriaRef.current = searchCriteria; }, [searchCriteria]);
  useEffect(() => { silentPostIdRef.current = silentPostId; }, [silentPostId]);
  useEffect(() => { skippedMatchIdsRef.current = skippedMatchIds; }, [skippedMatchIds]);
  useEffect(() => { currentUserIdRef.current = currentUserId; }, [currentUserId]);
  useEffect(() => { aiStepRef.current = aiStep; }, [aiStep]);
  useEffect(() => { waitingForPostIdRef.current = waitingForPostId; }, [waitingForPostId]);

  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setCurrentUserId(decodedPayload.sub || decodedPayload.id || decodedPayload.userId);
      } catch (e) {}
    }
    
    const savedPostId = localStorage.getItem('autoMatch_silentPostId');
    const savedCriteria = localStorage.getItem('autoMatch_criteria');
    const savedWaitId = localStorage.getItem('autoMatch_waitingForPostId');
    
    if (savedPostId && savedCriteria) {
        setSilentPostId(savedPostId);
        setSearchCriteria(JSON.parse(savedCriteria));
        setViewMode('ai');
        if (savedWaitId) {
            setWaitingForPostId(savedWaitId);
            setAiStep('WAITING_OPPONENT');
        } else {
            setAiStep('SEARCHING');
        }
        setIsPolling(true);
    }
  }, []);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/match-posts`);
      setMatches(response.data.content || response.data || []);
    } catch (error) {} finally {
      setIsLoading(false);
    }
  };

  const fetchFields = async () => {
    try {
      const response = await axios.get(`${API_URL}/fields`);
      setFields(response.data.content || response.data || []);
    } catch (error) {}
  };

  useEffect(() => {
    fetchMatches();
    fetchFields();
  }, [API_URL]);

  const handleCancelSearch = async () => {
    setIsPolling(false);
    setSearchCriteria(null);
    setSkippedMatchIds([]);
    setPendingRequest(null);
    setFoundLivePost(null);
    setWaitingForPostId(null);
    
    if (silentPostIdRef.current) {
        const currentSilentId = String(silentPostIdRef.current);
        try {
            const token = localStorage.getItem('accessToken');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.delete(`${API_URL}/match-posts/${currentSilentId}`, config);
        } catch(e) {
        } finally {
            setSilentPostId(null);
            localStorage.removeItem('autoMatch_silentPostId');
            localStorage.removeItem('autoMatch_criteria');
            localStorage.removeItem('autoMatch_waitingForPostId');
        }
    }
    if (viewMode === 'ai') setViewMode('all');
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isMounted = true;
    let isActiveRequest = false;

    const pollForMatches = async () => {
      if (!isPolling || !searchCriteriaRef.current || isProcessingMatch || isActiveRequest) return;
      isActiveRequest = true;

      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const postsRes = await axios.get(`${API_URL}/match-posts`);
        const currentMatches = postsRes.data.content || postsRes.data || [];
        if (isMounted) setMatches(currentMatches);

        const currentSilentId = silentPostIdRef.current;
        if (currentSilentId) {
             const cleanSilentId = String(typeof currentSilentId === 'object' ? (currentSilentId as any).id : currentSilentId);
             const mySilentPost = currentMatches.find((p: any) => String(p.id) === cleanSilentId);
             
             if (!mySilentPost || mySilentPost.status === 'CLOSED') {
                 handleCancelSearch();
                 return;
             }
             
             if (mySilentPost && mySilentPost.requests && mySilentPost.requests.length > 0) {
                 const pending = mySilentPost.requests.find((r: any) => r.status === 'PENDING');
                 if (pending && aiStepRef.current !== 'MATCH_FOUND' && aiStepRef.current !== 'RECEIVE_REQUEST') {
                     if (isMounted) {
                         setPendingRequest(pending);
                         setFoundLivePost(null);
                         setAiStep('RECEIVE_REQUEST');
                         setIsPolling(false);
                     }
                     return;
                 }
             }
        }

        if (aiStepRef.current === 'WAITING_OPPONENT' && waitingForPostIdRef.current) {
             const targetPost = currentMatches.find((p: any) => p.id === waitingForPostIdRef.current);
             if (targetPost) {
                 const myReq = targetPost.requests?.find((r: any) => r.requesterId === currentUserIdRef.current);
                 if (myReq) {
                     if (myReq.status === 'ACCEPTED') {
                         if (isMounted) {
                             setIsPolling(false);
                             alert('🎉 Đối phương đã chốt kèo! Chuyển đến phòng chat...');
                             handleCancelSearch();
                             navigate('/tin-nhan');
                         }
                         return;
                     } else if (myReq.status === 'REJECTED') {
                         if (isMounted) {
                             setSkippedMatchIds(prev => [...prev, waitingForPostIdRef.current!]);
                             setWaitingForPostId(null);
                             localStorage.removeItem('autoMatch_waitingForPostId');
                             setAiStep('SEARCHING');
                         }
                     }
                 } else {
                     if (isMounted) {
                         setSkippedMatchIds(prev => [...prev, waitingForPostIdRef.current!]);
                         setWaitingForPostId(null);
                         localStorage.removeItem('autoMatch_waitingForPostId');
                         setAiStep('SEARCHING');
                     }
                 }
             } else {
                 if (isMounted) {
                     setSkippedMatchIds(prev => [...prev, waitingForPostIdRef.current!]);
                     setWaitingForPostId(null);
                     localStorage.removeItem('autoMatch_waitingForPostId');
                     setAiStep('SEARCHING');
                 }
             }
        }

        if (aiStepRef.current === 'SEARCHING' || aiStepRef.current === 'RESULTS') {
            const otherLivePost = currentMatches.find((p: any) =>
                p.userId !== currentUserIdRef.current &&
                p.message && p.message.startsWith("[LIVE_MATCH]") &&
                (p.status === 'OPEN' || p.status === 'OPENING') &&
                (!searchCriteriaRef.current.date || p.date.startsWith(searchCriteriaRef.current.date)) &&
                (!searchCriteriaRef.current.fieldId || p.fieldId === searchCriteriaRef.current.fieldId) &&
                !skippedMatchIdsRef.current.includes(p.id)
            );

            if (otherLivePost) {
                if (isMounted) {
                    setFoundLivePost(otherLivePost);
                    setPendingRequest(null);
                    setAiStep('MATCH_FOUND');
                    setIsPolling(false);
                }
                return;
            }

            let staticMatches: any[] = [];
            try {
                const resAi = await axios.get(`${API_URL}/match-posts/recommendations?playstyle=${encodeURIComponent(searchCriteriaRef.current.message)}`, config);
                staticMatches = resAi.data.map((rec: any) => {
                  const fullMatch = currentMatches.find((m: any) => 
                      m.id === rec.matchId && 
                      m.userId !== currentUserIdRef.current && 
                      (m.status === 'OPEN' || m.status === 'OPENING') && 
                      (!m.message || !m.message.startsWith("[LIVE_MATCH]"))
                  );
                  return { ...rec, fullMatch };
                }).filter((r: any) => r.fullMatch);
            } catch (error) {}

            if (staticMatches.length === 0) {
                const fallbackMatches = currentMatches.filter((m: any) => 
                    m.userId !== currentUserIdRef.current && 
                    (m.status === 'OPEN' || m.status === 'OPENING') && 
                    (!m.message || !m.message.startsWith("[LIVE_MATCH]"))
                );
                staticMatches = fallbackMatches.map((m: any) => ({
                    fullMatch: m,
                    aiExplanation: "Gợi ý tự động từ hệ thống dựa trên yêu cầu ngày giờ của bạn."
                }));
            }

            if (searchCriteriaRef.current.date) {
                staticMatches = staticMatches.filter((r: any) => r.fullMatch.date.startsWith(searchCriteriaRef.current.date));
            }
            if (searchCriteriaRef.current.fieldId) {
                staticMatches = staticMatches.filter((r: any) => r.fullMatch.fieldId === searchCriteriaRef.current.fieldId);
            }
            staticMatches = staticMatches.filter((r: any) => !skippedMatchIdsRef.current.includes(r.fullMatch.id));

            if (isMounted) {
                setAiResults(staticMatches);
            }
        }
      } catch (error) {
      } finally {
        isActiveRequest = false;
        if (isMounted && isPolling && !isProcessingMatch && (aiStepRef.current === 'SEARCHING' || aiStepRef.current === 'WAITING_OPPONENT' || aiStepRef.current === 'RESULTS')) {
            timeoutId = setTimeout(pollForMatches, 4000);
        }
      }
    };

    if (isPolling && !isProcessingMatch) {
       pollForMatches();
    }

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPolling, isProcessingMatch, API_URL, navigate]);

  const handleCreatePostSubmit = async (postData: any) => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      await axios.post(`${API_URL}/match-posts`, postData, config);
      fetchMatches();
      setIsCreateModalOpen(false);
    } catch (error) {
      alert('Không thể tạo bài đăng. Vui lòng thử lại!');
    }
  };

  const handleAutoMatchSubmit = async (criteria: any) => {
    setIsAutoMatchModalOpen(false);
    setViewMode('ai');
    setSearchCriteria(criteria);
    setSkippedMatchIds([]);
    setPendingRequest(null);
    setFoundLivePost(null);
    setWaitingForPostId(null);
    localStorage.removeItem('autoMatch_waitingForPostId');
    setAiStep('SEARCHING');
    setIsPolling(false);

    try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        let finalTimeStart = null;
        let finalTimeEnd = null;
        if (criteria.date && criteria.timeStartStr) {
            finalTimeStart = `${criteria.date}T${criteria.timeStartStr}:00`;
            finalTimeEnd = `${criteria.date}T${criteria.timeEndStr}:00`;
        }

        const postData = {
          message: "[LIVE_MATCH] " + criteria.message,
          date: criteria.date || new Date().toISOString().split('T')[0],
          timeStart: finalTimeStart,
          timeEnd: finalTimeEnd,
          skillLevel: criteria.skillLevel || 'BEGINNER',
          costSharing: '50-50',
          postType: 'FIND_OPPONENT',
          fieldId: criteria.fieldId || null
        };

        const resPost = await axios.post(`${API_URL}/match-posts`, postData, config);
        const newId = resPost.data.id || resPost.data.matchPostId || resPost.data;
        const stringId = String(typeof newId === 'object' ? newId.id : newId);
        
        setSilentPostId(stringId);
        localStorage.setItem('autoMatch_silentPostId', stringId);
        localStorage.setItem('autoMatch_criteria', JSON.stringify(criteria));
    } catch (error) {}

    setIsPolling(true);
  };

  const handleAcceptLiveMatch = async () => {
    setIsProcessingMatch(true);
    const token = localStorage.getItem('accessToken');
    const config = { headers: { Authorization: `Bearer ${token}` } };

    if (foundLivePost) {
        try {
            const postsRes = await axios.get(`${API_URL}/match-posts`, config);
            const currentMatches = postsRes.data.content || postsRes.data || [];
            const currentSilentId = String(typeof silentPostIdRef.current === 'object' ? (silentPostIdRef.current as any).id : silentPostIdRef.current);
            const mySilentPost = currentMatches.find((p: any) => String(p.id) === currentSilentId);
            
            if (mySilentPost && mySilentPost.requests && mySilentPost.requests.length > 0) {
                const pendingFromThem = mySilentPost.requests.find((r: any) => r.requesterId === foundLivePost.userId && r.status === 'PENDING');
                if (pendingFromThem) {
                    await axios.put(`${API_URL}/match-requests/${pendingFromThem.id}/status`, { status: 'ACCEPTED' }, config);
                    if (silentPostIdRef.current) {
                        try { await axios.delete(`${API_URL}/match-posts/${silentPostIdRef.current}`, config); } catch(e) {}
                        setSilentPostId(null);
                        localStorage.removeItem('autoMatch_silentPostId');
                        localStorage.removeItem('autoMatch_criteria');
                    }
                    alert('🎉 Đã chốt kèo thành công! Chuyển tới phòng chat...');
                    handleCancelSearch();
                    navigate('/tin-nhan');
                    setIsProcessingMatch(false);
                    return;
                }
            }

            await axios.post(`${API_URL}/match-requests`, {
                postId: foundLivePost.id,
                requesterId: currentUserIdRef.current,
                message: "Auto Match Live: Chốt kèo!"
            }, config);
            
            setWaitingForPostId(foundLivePost.id);
            localStorage.setItem('autoMatch_waitingForPostId', foundLivePost.id);
            setFoundLivePost(null);
            setAiStep('WAITING_OPPONENT');
            setIsPolling(true);
        } catch (e) {
            alert('Đối phương đã rời đi hoặc từ chối, Radar tiếp tục quét...');
            setSkippedMatchIds(prev => [...prev, foundLivePost.id]);
            setFoundLivePost(null);
            setAiStep('SEARCHING');
            setIsPolling(true);
        }
    }
    setIsProcessingMatch(false);
  };

  const handleDeclineLiveMatch = async () => {
    setIsProcessingMatch(true);
    if (foundLivePost) {
        setSkippedMatchIds(prev => [...prev, foundLivePost.id]);
        setFoundLivePost(null);
    }
    setAiStep('SEARCHING');
    setIsPolling(true);
    setIsProcessingMatch(false);
  };

  const handleAcceptStaticSuggestion = async (matchId: string) => {
    setIsProcessingMatch(true);
    setIsPolling(false);
    try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.post(`${API_URL}/match-requests`, {
            postId: matchId,
            requesterId: currentUserIdRef.current,
            message: "Gợi ý AI: Mình thấy rất phù hợp! Chốt kèo nhé."
        }, config);
        
        if (silentPostIdRef.current) {
            try { await axios.delete(`${API_URL}/match-posts/${silentPostIdRef.current}`, config); } catch(e) {}
            setSilentPostId(null);
            localStorage.removeItem('autoMatch_silentPostId');
            localStorage.removeItem('autoMatch_criteria');
            localStorage.removeItem('autoMatch_waitingForPostId');
        }

        alert('🎉 Đã gửi yêu cầu ghép trận! Đang chờ đối phương xác nhận. Bạn có thể xem ở tab Lịch Sử.');
        handleCancelSearch();
        setViewMode('history');
    } catch (error) {
        alert('Trận này đã bị đóng hoặc bạn đã gửi yêu cầu rồi!');
        setSkippedMatchIds(prev => [...prev, matchId]);
        setIsPolling(true);
    } finally {
        setIsProcessingMatch(false);
    }
  };

  const handleAcceptPending = async () => {
    setIsProcessingMatch(true);
    try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.put(`${API_URL}/match-requests/${pendingRequest.id}/status`, { status: 'ACCEPTED' }, config);
        
        if (silentPostIdRef.current) {
            setSilentPostId(null);
            localStorage.removeItem('autoMatch_silentPostId');
            localStorage.removeItem('autoMatch_criteria');
            localStorage.removeItem('autoMatch_waitingForPostId');
        }

        alert('🎉 Đã chốt kèo thành công! Chuyển tới phòng chat...');
        navigate('/tin-nhan');
    } catch (e) {
        alert('Rất tiếc, có lỗi xảy ra hoặc đối phương đã hủy.');
        setPendingRequest(null);
        setAiStep('SEARCHING');
        setIsPolling(true);
    } finally {
        setIsProcessingMatch(false);
    }
  };

  const handleRejectPending = async () => {
    setIsProcessingMatch(true);
    try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.put(`${API_URL}/match-requests/${pendingRequest.id}/status`, { status: 'REJECTED' }, config);
        
        const postsRes = await axios.get(`${API_URL}/match-posts`);
        const currentMatches = postsRes.data.content || postsRes.data || [];
        const theirPost = currentMatches.find((p: any) => p.userId === pendingRequest.requesterId && p.message?.startsWith("[LIVE_MATCH]"));
        if (theirPost) {
            setSkippedMatchIds(prev => [...prev, theirPost.id]);
        }
    } catch(e) {}
    
    setPendingRequest(null);
    setAiStep('SEARCHING');
    setIsPolling(true);
    setIsProcessingMatch(false);
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

  const handleConfirmApply = () => {
    setApplyingMatch(null);
    navigate('/tin-nhan');
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!window.confirm('Bạn chắc chắn muốn chốt kèo với người này? Bài đăng sẽ tự động đóng lại.')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`${API_URL}/match-requests/${requestId}/status`, { status: 'ACCEPTED' }, config);
      alert('Chốt kèo thành công! Bài đăng đã được đóng.');
      fetchMatches();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi chốt kèo!');
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
            <button onClick={() => { if(isPolling) handleCancelSearch(); setViewMode('all'); }} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${viewMode === 'all' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}><FaGlobe /> Bảng chung</button>
            <button onClick={() => { if(isPolling) handleCancelSearch(); setViewMode('my'); }} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${viewMode === 'my' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}><FaListAlt /> Bài của tôi</button>
            <button onClick={() => { if(isPolling) handleCancelSearch(); setViewMode('history'); }} className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition whitespace-nowrap ${viewMode === 'history' ? 'bg-white shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}><FaHistory /> Lịch sử</button>
            {viewMode === 'ai' && <button className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition whitespace-nowrap bg-white shadow-sm text-blue-600"><FaRobot className={isPolling ? "animate-spin" : ""} /> Đang Ghép Tự Động</button>}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {viewMode !== 'ai' && (
                <Button variant="primary" className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 py-2 shadow-md !bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 border-none transition-transform hover:scale-105" onClick={() => {
                    if (isPolling) { setViewMode('ai'); } else { setIsAutoMatchModalOpen(true); }
                }}>
                  <FaRobot className={`text-lg ${isPolling ? 'animate-spin' : 'animate-pulse'}`} /> {isPolling ? 'Đang Chạy Auto' : 'Auto Ghép'}
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
          aiStep={aiStep}
          aiResults={aiResults}
          pendingRequest={pendingRequest}
          fields={fields}
          isPolling={isPolling}
          onCancelSearch={handleCancelSearch}
          onAcceptLiveMatch={handleAcceptLiveMatch}
          onDeclineLiveMatch={handleDeclineLiveMatch}
          onAcceptPending={handleAcceptPending}
          onRejectPending={handleRejectPending}
          onAcceptStaticMatch={handleAcceptStaticSuggestion}
          onBackToBoard={() => { handleCancelSearch(); setViewMode('all'); }}
          onOpenCreate={() => { handleCancelSearch(); setIsCreateModalOpen(true); }}
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
                            <Button variant="primary" className="!bg-blue-600 hover:!bg-blue-700 shadow-md py-2 px-5 rounded-xl" onClick={() => navigate('/tin-nhan')}>Vào Chat</Button>
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
        onSubmit={handleAutoMatchSubmit} 
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
        onConfirm={handleConfirmApply} 
      />
    </div>
  );
};

export default MatchBoard;