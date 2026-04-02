import { FaFutbol, FaClock, FaCalendarAlt, FaMoneyBillWave, FaUserCircle } from 'react-icons/fa';
import Button from './Button';

// Định nghĩa lại cấu trúc Match theo API Backend
type MatchCardProps = {
  match: {
    id: string;
    userId: string;
    teamId: string | null;
    fieldId: string | null;
    bookingId: string | null;
    date: string;
    timeStart: string;
    timeEnd: string;
    postType: string;
    skillLevel: string;
    costSharing: string;
    message: string;
    status: string;
    createdAt: string;
  };
  onApply: () => void;
};

const MatchCard = ({ match, onApply }: MatchCardProps) => {
  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    if (timeStr.includes('T')) return timeStr.split('T')[1].substring(0, 5);
    return timeStr.substring(0, 5);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    if (dateStr.includes('T')) dateStr = dateStr.split('T')[0];
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <FaUserCircle className="text-3xl text-gray-400" />
          <div>
            <h4 className="font-bold text-gray-800">
              {match.userId ? `User: ${match.userId.substring(0, 6)}...` : 'Người chơi ẩn danh'}
            </h4>
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              match.status === 'OPENING' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}>
              {match.status}
            </span>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-2 truncate" title={match.message}>
        {match.message || 'Cần tìm đối giao hữu'}
      </h3>
      
      <div className="space-y-2 text-sm text-gray-600 flex-1 mb-4 border-t border-gray-50 pt-3">
        <p className="flex items-center gap-2">
          <FaFutbol className="text-green-500" />
          <span className="font-medium truncate" title={match.fieldId || ''}>
            Sân ID: {match.fieldId ? match.fieldId.substring(0, 8) + '...' : 'Chưa có'}
          </span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <p className="flex items-center gap-2">
            <FaCalendarAlt className="text-red-500" />
            <span>{formatDate(match.date)}</span>
          </p>
          <p className="flex items-center gap-2">
            <FaClock className="text-orange-500" />
            <span>{formatTime(match.timeStart)} - {formatTime(match.timeEnd)}</span>
          </p>
        </div>
        <p className="flex items-center gap-2 mt-2">
          <span className="font-bold text-gray-700">Trình độ:</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">{match.skillLevel || 'Mọi trình độ'}</span>
        </p>
        <p className="flex items-center gap-2">
          <FaMoneyBillWave className="text-green-500" />
          <span className="font-bold text-gray-700">Tỉ lệ chia tiền:</span>
          <span>{match.costSharing || '5/5'}</span>
        </p>
      </div>

      <Button variant="primary" className="w-full !bg-green-600 hover:!bg-green-700" onClick={onApply}>
        Nhận Kèo / Liên Hệ
      </Button>
    </div>
  );
};

export default MatchCard;