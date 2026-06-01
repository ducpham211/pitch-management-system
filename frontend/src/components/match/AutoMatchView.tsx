import { FaRobot, FaTimes, FaCheck, FaMapMarkerAlt, FaUserCircle, FaMoneyBillWave, FaFutbol, FaCalendarAlt, FaClock, FaCheckCircle, FaListAlt, FaHourglassHalf } from 'react-icons/fa';
import Button from '../common/Button';
import MatchCard from '../common/MatchCard';

type AutoMatchViewProps = {
  aiStep: 'SEARCHING' | 'MATCH_FOUND' | 'WAITING_OPPONENT' | 'RECEIVE_REQUEST' | 'RESULTS' | 'FINISHED';
  aiResults: any[];
  pendingRequest: any;
  fields: any[];
  isPolling: boolean;
  isProcessingMatch: boolean;
  onCancelSearch: () => void;
  onAcceptLiveMatch: () => void;
  onDeclineLiveMatch: () => void;
  onAcceptPending: () => void;
  onRejectPending: () => void;
  onAcceptStaticMatch: (matchId: string) => void;
  foundLivePost: any;
};

const AutoMatchView = ({
  aiStep, aiResults, pendingRequest, fields, isPolling, isProcessingMatch,
  onCancelSearch, onAcceptLiveMatch, onDeclineLiveMatch, onAcceptPending, 
  onRejectPending, onAcceptStaticMatch, foundLivePost
}: AutoMatchViewProps) => {

  const translateSkillLevel = (level: string) => {
    switch(level) {
      case 'BEGINNER': return 'Yếu / Vui vẻ';
      case 'INTERMEDIATE': return 'Trung bình / Khá';
      case 'ADVANCED': return 'Tốt / Chuyên nghiệp';
      default: return level || 'Mọi trình độ';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[70vh] relative">
        
        {aiStep === 'MATCH_FOUND' && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center backdrop-blur-sm rounded-3xl">
                <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-fade-in-up border-4 border-green-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                    <h2 className="text-3xl font-black text-green-600 mb-2 tracking-widest uppercase mt-4">KÈO TỚI!</h2>
                    <p className="text-gray-500 font-medium mb-4">Hệ thống đã kết nối thành công với một đối thủ trực tuyến.</p>
                    
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-green-100 shadow-inner">
                        <FaUserCircle className="text-6xl" />
                    </div>

                    {foundLivePost && (
                        <div className="bg-gray-50 p-4 rounded-xl w-full border border-gray-100 mb-6 shadow-sm text-left">
                             <p className="text-sm text-gray-800 font-bold mb-1">Cầu thủ: <span className="font-normal uppercase text-gray-600">{foundLivePost.userId?.substring(0,8)}</span></p>
                             <p className="text-sm text-gray-800 font-bold mb-1">Sân: <span className="font-normal text-gray-600">{fields.find(f => f.id === foundLivePost.fieldId)?.name || 'Mọi sân'}</span></p>
                             <p className="text-sm text-gray-800 font-bold mb-1">Trình độ: <span className="font-normal text-blue-600">{translateSkillLevel(foundLivePost.skillLevel)}</span></p>
                             <p className="text-sm text-gray-800 font-bold mt-2 italic whitespace-pre-wrap flex items-center gap-2"><FaCheckCircle className="text-green-500"/> "{foundLivePost.message?.replace('[LIVE_MATCH]', '').trim()}"</p>
                        </div>
                    )}
                    
                    <div className="flex gap-4">
                        <Button disabled={isProcessingMatch} variant="secondary" onClick={onDeclineLiveMatch} className={`flex-1 py-4 text-lg border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-xl font-bold transition-all ${isProcessingMatch ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <FaTimes className="inline mr-2" /> Bỏ Qua
                        </Button>
                        <Button disabled={isProcessingMatch} variant="primary" onClick={onAcceptLiveMatch} className={`flex-1 py-4 text-lg !bg-green-500 hover:!bg-green-600 rounded-xl font-bold shadow-lg shadow-green-200 transition-all transform hover:scale-105 ${isProcessingMatch ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isProcessingMatch ? <FaHourglassHalf className="inline mr-2 animate-spin" /> : <FaCheck className="inline mr-2" />} 
                            {isProcessingMatch ? 'Đang Xử Lý...' : 'Chốt Kèo'}
                        </Button>
                    </div>
                </div>
            </div>
        )}

        {aiStep === 'RECEIVE_REQUEST' && pendingRequest && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center backdrop-blur-sm rounded-3xl">
                <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-fade-in-up border-4 border-blue-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-blue-500"></div>
                    <h2 className="text-3xl font-black text-blue-600 mb-2 tracking-widest uppercase mt-4">YÊU CẦU GHÉP!</h2>
                    <p className="text-gray-500 font-medium mb-4">User <span className="font-bold text-gray-800 uppercase">{pendingRequest.requesterId.substring(0,8)}</span> đã chốt kèo với bạn.</p>
                    
                    <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-5 border-4 border-blue-100 shadow-inner">
                        <FaUserCircle className="text-6xl" />
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-xl w-full border border-gray-100 mb-6 shadow-sm">
                         <p className="text-sm font-medium text-gray-700 italic">"{pendingRequest.message}"</p>
                    </div>

                    <div className="flex gap-4">
                        <Button disabled={isProcessingMatch} variant="secondary" onClick={onRejectPending} className={`flex-1 py-4 text-lg border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-xl font-bold transition-all ${isProcessingMatch ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            <FaTimes className="inline mr-2" /> Từ Chối
                        </Button>
                        <Button disabled={isProcessingMatch} variant="primary" onClick={onAcceptPending} className={`flex-1 py-4 text-lg !bg-blue-500 hover:!bg-blue-600 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform hover:scale-105 ${isProcessingMatch ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isProcessingMatch ? <FaHourglassHalf className="inline mr-2 animate-spin" /> : <FaCheck className="inline mr-2" />}
                            {isProcessingMatch ? 'Đang Xử Lý...' : 'Đồng Ý'}
                        </Button>
                    </div>
                </div>
            </div>
        )}

        <div className="lg:w-1/3 bg-white rounded-3xl shadow-sm border border-blue-100 flex flex-col items-center justify-center relative overflow-hidden p-6">
            <div className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 -translate-y-1/2 ${aiStep === 'WAITING_OPPONENT' ? 'bg-orange-400 animate-pulse' : (isPolling ? 'bg-blue-400 animate-ping' : 'bg-gray-300')}`}></div>
            <div className="relative mb-8 z-10">
                <div className={`w-32 h-32 border-4 rounded-full ${aiStep === 'WAITING_OPPONENT' ? 'border-orange-100' : 'border-blue-50'}`}></div>
                <div className={`w-32 h-32 border-4 rounded-full border-t-transparent absolute top-0 left-0 ${aiStep === 'WAITING_OPPONENT' ? 'border-orange-500' : (isPolling ? 'border-blue-600 animate-spin' : 'border-gray-400')}`}></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    {aiStep === 'WAITING_OPPONENT' ? (
                        <FaHourglassHalf className="text-5xl text-orange-500 animate-spin" />
                    ) : (
                        <FaRobot className={`text-5xl ${isPolling ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`} />
                    )}
                </div>
            </div>
            
            {aiStep === 'WAITING_OPPONENT' ? (
                <>
                    <h4 className="font-bold text-gray-800 text-xl mb-2 z-10 text-center">Đang Chờ Phản Hồi</h4>
                    <p className="text-gray-500 text-sm text-center mb-8 z-10 px-4 leading-relaxed">
                        Bạn đã đồng ý. Hệ thống đang đợi đối phương xác nhận để chuyển vào phòng tin nhắn...
                    </p>
                </>
            ) : (
                <>
                    <h4 className="font-bold text-gray-800 text-xl mb-2 z-10 text-center">
                        {isPolling ? 'Radar Đang Quét...' : 'Đã Quét Xong'}
                    </h4>
                    <p className="text-gray-500 text-sm text-center mb-8 z-10 px-4 leading-relaxed">
                        {isPolling ? 'Hệ thống đang dò tìm ngầm các đối thủ trực tuyến phù hợp nhất với bạn.' : 'Radar đã tạm dừng. Bạn có thể chốt các kèo phía trên hoặc thử tìm lại.'}
                    </p>
                </>
            )}

            <Button variant="secondary" className={`rounded-xl px-6 py-3 flex items-center gap-2 z-10 shadow-sm ${isPolling ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'}`} onClick={onCancelSearch}>
                {isPolling ? <><FaTimes /> Hủy Quét</> : <><FaTimes /> Thoát</>}
            </Button>
        </div>

        <div className="lg:w-2/3 bg-gray-50 rounded-3xl border border-gray-200 p-6 flex flex-col shadow-inner">
            <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2 border-b border-gray-200 pb-4">
                <FaRobot className="text-blue-600"/> Đề Xuất Phù Hợp ({aiResults.length})
            </h3>
            
            {aiResults.filter(r => r && r.fullMatch).length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <FaRobot className="text-6xl mb-4 opacity-20" />
                    <p className="text-lg">Không có bài đăng tĩnh nào khớp. Đợi radar quét người dùng trực tuyến...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 overflow-y-auto p-2 pb-4" style={{ scrollbarWidth: 'thin' }}>
                    {aiResults.filter(r => r && r.fullMatch).slice(0, 4).map((res, idx) => (
                        <div key={idx} className="flex flex-col gap-3">
                            <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-100 flex items-start gap-2">
                                <FaRobot className="text-xl text-blue-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-blue-800 italic font-medium">"{res.aiExplanation || res.aiReason}"</p>
                            </div>
                            <MatchCard 
                                match={res.fullMatch} 
                                fieldName={fields.find(f => f.id === res.fullMatch?.fieldId)?.name || ''}
                                onApply={() => {
                                    if(!isProcessingMatch && res.fullMatch?.id) onAcceptStaticMatch(res.fullMatch.id);
                                }} 
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default AutoMatchView;