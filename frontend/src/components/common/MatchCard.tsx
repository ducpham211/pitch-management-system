import { FaFutbol, FaClock, FaCalendarAlt, FaMoneyBillWave, FaUserCircle } from 'react-icons/fa';
import Button from './Button';

type MatchCardProps = {
  match: {
    id: string;
    creatorName: string;
    title: string;
    pitchName: string;
    time: string;
    date: string;
    levelRequired: string;
    paymentPercentage: string;
    status: string;
  };
  onApply: () => void;
};

const MatchCard = ({ match, onApply }: MatchCardProps) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <FaUserCircle className="text-3xl text-gray-400" />
          <div>
            <h4 className="font-bold text-gray-800">{match.creatorName}</h4>
            <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
              {match.status}
            </span>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-gray-800 mb-3">{match.title}</h3>
      
      <div className="space-y-2 text-sm text-gray-600 flex-1 mb-4">
        <p className="flex items-center gap-2">
          <FaFutbol className="text-blue-500" />
          <span className="font-medium">{match.pitchName}</span>
        </p>
        <p className="flex items-center gap-2">
          <FaCalendarAlt className="text-red-500" />
          <span>{match.date}</span>
        </p>
        <p className="flex items-center gap-2">
          <FaClock className="text-orange-500" />
          <span>{match.time}</span>
        </p>
        <p className="flex items-center gap-2">
          <span className="font-bold text-gray-700">Trình độ:</span>
          <span>{match.levelRequired}</span>
        </p>
        <p className="flex items-center gap-2">
          <FaMoneyBillWave className="text-green-500" />
          <span className="font-bold text-gray-700">Tỉ lệ chia tiền:</span>
          <span>{match.paymentPercentage}</span>
        </p>
      </div>

      <Button variant="primary" className="w-full" onClick={onApply}>
        Nhận Kèo / Liên Hệ
      </Button>
    </div>
  );
};

export default MatchCard;