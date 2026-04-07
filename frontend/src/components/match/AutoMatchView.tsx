import { FaRobot, FaTimes, FaCheck, FaMapMarkerAlt, FaUserCircle, FaMoneyBillWave, FaFutbol, FaCalendarAlt, FaClock, FaCheckCircle, FaListAlt } from 'react-icons/fa';
import Button from '../common/Button';

type AutoMatchViewProps = {
  aiStep: 'SEARCHING' | 'RESULTS' | 'FINISHED';
  aiResults: any[];
  currentAiMatchIndex: number;
  fields: any[];
  isPolling: boolean;
  onCancelSearch: () => void;
  onSkipMatch: () => void;
  onAcceptMatch: (matchId: string) => void;
  onBackToBoard: () => void;
  onOpenCreate: () => void;
};

const AutoMatchView = ({
  aiStep,
  aiResults,
  currentAiMatchIndex,
  fields,
  isPolling,
  onCancelSearch,
  onSkipMatch,
  onAcceptMatch,
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
    <div className="flex flex-col lg:flex-row gap-6 h-[70vh]">
        <div className="lg:w-1/3 bg-white rounded-3xl shadow-sm border border-blue-100 flex flex-col items-center justify-center relative overflow-hidden p-6">
            <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-ping transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative mb-8 z-10">
                <div className="w-32 h-32 border-4 border-blue-50 rounded-full"></div>
                <div className={`w-32 h-32 border-4 border-blue-600 rounded-full border-t-transparent ${isPolling ? 'animate-spin' : ''} absolute top-0 left-0`}></div>
                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <FaRobot className={`text-5xl text-blue-600 ${isPolling ? 'animate-pulse' : ''}`} />
                </div>
            </div>
            <h4 className="font-bold text-gray-800 text-xl mb-2 z-10 text-center">
                {isPolling ? 'Đang Tìm Trực Tuyến' : 'Đang Tạm Dừng'}
            </h4>
            <p className="text-gray-500 text-sm text-center mb-8 z-10 px-4 leading-relaxed">
                Hệ thống đang rà soát liên tục để tự động khớp nối với những người chơi khác đang bật tìm kiếm giống bạn...
            </p>
            <Button variant="secondary" className="rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 px-6 py-3 flex items-center gap-2 z-10 shadow-sm" onClick={onCancelSearch}>
                <FaTimes /> Hủy Ghép Trận
            </Button>
        </div>

        <div className="lg:w-2/3 bg-gray-50 rounded-3xl border border-gray-200 p-6 flex flex-col overflow-hidden shadow-inner">
            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
                <FaListAlt className="text-green-600"/> Hoặc Chủ Động Chọn (Gợi Ý AI)
            </h3>
            
            {aiStep === 'SEARCHING' && aiResults.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <FaRobot className="text-5xl mb-3 opacity-30" />
                    <p>Đang tìm các bài đăng có sẵn phù hợp với bạn...</p>
                </div>
            )}

            {aiStep === 'FINISHED' && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-200">
                        <FaRobot className="text-4xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Đã quét hết dữ liệu gợi ý!</h3>
                    <p className="text-gray-500 mb-6">Radar vẫn đang tiếp tục tìm đối thủ mới. Hoặc bạn có thể về lại bảng tin.</p>
                    <div className="w-full max-w-sm flex gap-3 mx-auto">
                        <Button variant="secondary" className="flex-1 rounded-xl bg-gray-100 text-gray-700" onClick={onBackToBoard}>Về Bảng Tin</Button>
                        <Button variant="primary" className="flex-1 rounded-xl !bg-green-600 hover:!bg-green-700" onClick={onOpenCreate}>Đăng Tin Mới</Button>
                    </div>
                </div>
            )}

            {aiStep === 'RESULTS' && aiResults[currentAiMatchIndex] && (
                <div className="flex-1 bg-white rounded-3xl shadow-md border border-gray-100 flex flex-col h-full animate-fade-in-up relative overflow-hidden p-6">
                    <div className="absolute top-0 right-0 bg-green-100 text-green-700 px-4 py-1.5 rounded-bl-xl font-bold text-xs shadow-sm z-10 flex items-center gap-1">
                        <FaCheckCircle /> Khớp Tiêu Chí
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                        <FaUserCircle className="text-5xl text-gray-300" />
                        <div>
                            <p className="text-xs text-gray-500 font-bold uppercase">Người Đăng</p>
                            <p className="text-base font-bold text-gray-800">User: {aiResults[currentAiMatchIndex].fullMatch.userId.substring(0, 8)}</p>
                        </div>
                    </div>

                    <h4 className="font-bold text-xl text-gray-800 mb-5 leading-snug bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        "{aiResults[currentAiMatchIndex].fullMatch.message}"
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
                        <p className="flex items-center gap-2"><FaCalendarAlt className="text-red-500 text-lg" /> <span className="font-medium">{formatDateStr(aiResults[currentAiMatchIndex].fullMatch.date)}</span></p>
                        <p className="flex items-center gap-2"><FaClock className="text-orange-500 text-lg" /> <span className="font-medium">{formatTimeStr(aiResults[currentAiMatchIndex].fullMatch.timeStart)}</span></p>
                        <p className="flex items-center gap-2 col-span-2 truncate" title={fields.find(f => f.id === aiResults[currentAiMatchIndex].fullMatch.fieldId)?.name || 'Chưa chốt sân'}>
                            <FaMapMarkerAlt className="text-green-600 text-lg flex-shrink-0" /> 
                            <span className="font-medium truncate">{fields.find(f => f.id === aiResults[currentAiMatchIndex].fullMatch.fieldId)?.name || 'Sân tự do'}</span>
                        </p>
                        <p className="flex items-center gap-2"><FaFutbol className="text-gray-500 text-lg" /> <span className="font-medium">{translateSkillLevel(aiResults[currentAiMatchIndex].fullMatch.skillLevel)}</span></p>
                        <p className="flex items-center gap-2"><FaMoneyBillWave className="text-green-500 text-lg" /> <span className="font-medium">{aiResults[currentAiMatchIndex].fullMatch.costSharing}</span></p>
                    </div>
                    
                    <div className="mt-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 relative">
                        <FaRobot className="absolute -top-3 -left-2 text-2xl text-blue-500 bg-white rounded-full border-2 border-blue-100" />
                        <p className="text-xs font-bold text-blue-800 mb-1 ml-3">Nhận xét từ AI:</p>
                        <p className="text-sm text-blue-900 italic leading-relaxed">
                            "{aiResults[currentAiMatchIndex].aiExplanation}"
                        </p>
                    </div>

                    <div className="flex justify-center gap-10 mt-6 pt-4 border-t border-gray-100">
                        <button onClick={onSkipMatch} className="w-16 h-16 rounded-full bg-white border border-gray-200 text-red-500 flex items-center justify-center text-2xl shadow-md hover:bg-red-50 hover:border-red-200 hover:scale-110 transition-all flex-col gap-1">
                            <FaTimes />
                        </button>
                        <button onClick={() => onAcceptMatch(aiResults[currentAiMatchIndex].fullMatch.id)} className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-400 to-green-600 text-white flex items-center justify-center text-2xl shadow-lg hover:shadow-xl hover:scale-110 transition-all flex-col gap-1">
                            <FaCheck />
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default AutoMatchView;