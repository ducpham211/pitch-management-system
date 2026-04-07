import { FaRobot, FaTimes, FaCheck, FaMapMarkerAlt, FaUserCircle, FaMoneyBillWave, FaFutbol, FaCalendarAlt, FaClock, FaCheckCircle, FaListAlt, FaHourglassHalf } from 'react-icons/fa';
import Button from '../common/Button';

type AutoMatchViewProps = {
  aiStep: 'SEARCHING' | 'MATCH_FOUND' | 'WAITING_OPPONENT' | 'RECEIVE_REQUEST' | 'FINISHED';
  aiResults: any[];
  pendingRequest: any;
  fields: any[];
  isPolling: boolean;
  onCancelSearch: () => void;
  onAcceptLiveMatch: () => void;
  onDeclineLiveMatch: () => void;
  onAcceptPending: () => void;
  onRejectPending: () => void;
  onAcceptStaticMatch: (matchId: string) => void;
  onBackToBoard: () => void;
  onOpenCreate: () => void;
};

const AutoMatchView = ({
  aiStep,
  aiResults,
  pendingRequest,
  fields,
  isPolling,
  onCancelSearch,
  onAcceptLiveMatch,
  onDeclineLiveMatch,
  onAcceptPending,
  onRejectPending,
  onAcceptStaticMatch,
  onBackToBoard,
  onOpenCreate
}: AutoMatchViewProps) => {

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

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[70vh] relative">
        
        {aiStep === 'MATCH_FOUND' && (
            <div className="absolute inset-0 z-50 bg-black/70 flex items-center justify-center backdrop-blur-sm rounded-3xl">
                <div className="bg-white p-8 rounded-3xl max-w-md w-full text-center shadow-2xl animate-fade-in-up border-4 border-green-500 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
                    <h2 className="text-3xl font-black text-green-600 mb-2 tracking-widest uppercase mt-4">KÈO TỚI!</h2>
                    <p className="text-gray-500 font-medium mb-6">Hệ thống đã kết nối thành công với một đối thủ trực tuyến.</p>
                    
                    <div className="w-28 h-28 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-100 shadow-inner">
                        <FaUserCircle className="text-7xl" />
                    </div>
                    
                    <div className="flex gap-4">
                        <Button variant="secondary" onClick={onDeclineLiveMatch} className="flex-1 py-4 text-lg border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-xl font-bold transition-all">
                            <FaTimes className="inline mr-2" /> Bỏ Qua
                        </Button>
                        <Button variant="primary" onClick={onAcceptLiveMatch} className="flex-1 py-4 text-lg !bg-green-500 hover:!bg-green-600 rounded-xl font-bold shadow-lg shadow-green-200 transition-all transform hover:scale-105">
                            <FaCheck className="inline mr-2" /> Chốt Kèo
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
                        <Button variant="secondary" onClick={onRejectPending} className="flex-1 py-4 text-lg border-2 border-red-100 text-red-500 hover:bg-red-50 hover:border-red-300 rounded-xl font-bold transition-all">
                            <FaTimes className="inline mr-2" /> Từ Chối
                        </Button>
                        <Button variant="primary" onClick={onAcceptPending} className="flex-1 py-4 text-lg !bg-blue-500 hover:!bg-blue-600 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all transform hover:scale-105">
                            <FaCheck className="inline mr-2" /> Đồng Ý
                        </Button>
                    </div>
                </div>
            </div>
        )}

        <div className="lg:w-1/3 bg-white rounded-3xl shadow-sm border border-blue-100 flex flex-col items-center justify-center relative overflow-hidden p-6">
            <div className={`absolute top-1/2 left-1/2 w-64 h-64 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 -translate-y-1/2 ${aiStep === 'WAITING_OPPONENT' ? 'bg-orange-400 animate-pulse' : 'bg-blue-400 animate-ping'}`}></div>
            <div className="relative mb-8 z-10">
                <div className={`w-32 h-32 border-4 rounded-full ${aiStep === 'WAITING_OPPONENT' ? 'border-orange-100' : 'border-blue-50'}`}></div>
                <div className={`w-32 h-32 border-4 rounded-full border-t-transparent absolute top-0 left-0 ${aiStep === 'WAITING_OPPONENT' ? 'border-orange-500' : 'border-blue-600'} ${isPolling ? 'animate-spin' : ''}`}></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    {aiStep === 'WAITING_OPPONENT' ? (
                        <FaHourglassHalf className="text-5xl text-orange-500 animate-pulse" />
                    ) : (
                        <FaRobot className={`text-5xl text-blue-600 ${isPolling ? 'animate-pulse' : ''}`} />
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
                        {isPolling ? 'Radar Đang Quét...' : 'Đang Tạm Dừng'}
                    </h4>
                    <p className="text-gray-500 text-sm text-center mb-8 z-10 px-4 leading-relaxed">
                        Hệ thống đang dò tìm ngầm các đối thủ trực tuyến phù hợp nhất với bạn.
                    </p>
                </>
            )}

            <Button variant="secondary" className="rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-6 py-3 flex items-center gap-2 z-10 shadow-sm" onClick={onCancelSearch}>
                <FaTimes /> Hủy Ghép Trận
            </Button>
        </div>

        <div className="lg:w-2/3 bg-gray-50 rounded-3xl border border-gray-200 p-6 flex flex-col shadow-inner">
            <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2 border-b border-gray-200 pb-4">
                <FaListAlt className="text-green-600"/> Bài Đăng Phù Hợp ({aiResults.length})
            </h3>
            
            {aiStep === 'SEARCHING' && aiResults.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                    <FaRobot className="text-6xl mb-4 opacity-20" />
                    <p className="text-lg">Không có bài đăng tĩnh nào khớp. Đợi radar quét người dùng trực tuyến...</p>
                </div>
            )}

            {aiStep === 'FINISHED' && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                        <FaRobot className="text-4xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Đã quét hết các gợi ý hiện có!</h3>
                    <p className="text-gray-500 mb-6">Radar vẫn đang tiếp tục chạy ngầm để đón lõng đối thủ mới. Hoặc bạn có thể về lại bảng tin.</p>
                    <div className="w-full max-w-sm flex gap-3 mx-auto">
                        <Button variant="secondary" className="flex-1 rounded-xl bg-gray-100 text-gray-700" onClick={onBackToBoard}>Về Bảng Tin</Button>
                        <Button variant="primary" className="flex-1 rounded-xl !bg-green-600 hover:!bg-green-700" onClick={onOpenCreate}>Đăng Tin Mới</Button>
                    </div>
                </div>
            )}

            {aiStep === 'SEARCHING' && aiResults.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pb-4" style={{ scrollbarWidth: 'none' }}>
                    {aiResults.map((res, idx) => (
                        <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:shadow-lg hover:border-green-300 transition duration-300 transform hover:-translate-y-1 overflow-hidden">
                            <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2.5 py-1 rounded-md border border-green-100 flex items-center gap-1 uppercase tracking-wide">
                                        <FaCheckCircle /> Phù hợp
                                    </span>
                                    <span className="text-xs text-gray-400 font-bold uppercase">U:{res.fullMatch.userId.substring(0,6)}</span>
                                </div>
                                
                                <h4 className="font-bold text-gray-800 text-lg mb-4 line-clamp-2 leading-snug">
                                    "{res.fullMatch.message.replace('[LIVE_MATCH]', '').trim()}"
                                </h4>
                                
                                <div className="space-y-2 text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100 flex-1">
                                    <div className="flex justify-between items-center">
                                        <span className="flex items-center gap-2"><FaCalendarAlt className="text-red-400"/> {formatDateStr(res.fullMatch.date)}</span>
                                        <span className="flex items-center gap-2"><FaClock className="text-orange-400"/> {formatTimeStr(res.fullMatch.timeStart)}</span>
                                    </div>
                                    <p className="flex items-center gap-2 truncate" title={fields.find(f => f.id === res.fullMatch.fieldId)?.name || 'Sân tự do'}>
                                        <FaMapMarkerAlt className="text-green-500 flex-shrink-0" /> 
                                        <span className="truncate">{fields.find(f => f.id === res.fullMatch.fieldId)?.name || 'Sân tự do'}</span>
                                    </p>
                                </div>

                                <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 relative mt-auto">
                                    <FaRobot className="absolute -top-2.5 -left-2 text-xl text-blue-400 bg-white rounded-full" />
                                    <p className="text-xs text-blue-800 italic ml-2 line-clamp-2">"{res.aiExplanation}"</p>
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 border-t border-gray-100">
                                <Button variant="primary" onClick={() => onAcceptStaticMatch(res.fullMatch.id)} className="w-full !bg-green-600 hover:!bg-green-700 shadow-md py-2.5 flex items-center justify-center gap-2 rounded-xl">
                                    <FaCheck /> Nhận Kèo Này
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default AutoMatchView;