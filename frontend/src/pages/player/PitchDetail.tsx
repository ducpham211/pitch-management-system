import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaFutbol, FaArrowLeft, FaCalendarAlt, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import Button from '../../components/common/Button';
import axiosClient from '../../api/axiosClient';

const PitchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pitch, setPitch] = useState<any>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPitchDetail = async () => {
      try {
        const res = await axiosClient.get(`/fields/${id}`);
        setPitch(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPitchDetail();
  }, [id]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id || !selectedDate) return;
      try {
        const res = await axiosClient.get(`/fields/${id}/availability?date=${selectedDate}`);
        const sortedSlots = res.data.sort((a: any, b: any) => {
           const timeA = new Date(a.startTime || `2000-01-01T${a.startTime}`).getTime();
           const timeB = new Date(b.startTime || `2000-01-01T${b.startTime}`).getTime();
           return timeA - timeB;
        });
        setAvailableSlots(sortedSlots);
        setSelectedSlot(null);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAvailability();
  }, [id, selectedDate]);

  const handleBooking = () => {
    if (!selectedSlot) return;
    navigate(`/thanh-toan/${id}`, {
      state: { pitch, selectedSlot, selectedDate }
    });
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    return isoString.substring(11, 16);
  };

  const translateFieldType = (type: string) => {
    if (type === 'FIVE_A_SIDE') return 'Sân 5 người';
    if (type === 'SEVEN_A_SIDE') return 'Sân 7 người';
    if (type === 'ELEVEN_A_SIDE') return 'Sân 11 người';
    return type;
  };

  if (isLoading) return <div className="text-center py-20">Đang tải thông tin sân...</div>;
  if (!pitch) return <div className="text-center py-20 text-gray-500">Không tìm thấy thông tin sân bóng!</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/tim-san" className="inline-flex items-center text-gray-500 hover:text-green-600 mb-6 transition">
        <FaArrowLeft className="mr-2" /> Quay lại danh sách
      </Link>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
        <div className="md:w-1/2 h-64 md:h-auto bg-gray-200">
          <img 
            src={pitch.coverImage || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'} 
            alt={pitch.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {translateFieldType(pitch.type)}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{pitch.name}</h1>
            <p className="text-gray-600 mb-6 flex items-center gap-2">
              <FaFutbol className="text-gray-400" /> Chất lượng cỏ nhân tạo đạt chuẩn
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Đặt Sân</h2>
        
        <div className="mb-6 max-w-xs">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <FaCalendarAlt className="text-green-600" /> Chọn ngày đá
          </label>
          <input 
            type="date" 
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition"
          />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <FaClock className="text-green-600" /> Chọn ca đá
          </label>
          
          {availableSlots.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500 italic">
              Không có ca đá nào được thiết lập cho sân này.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.map((slot) => {
                const isAvailable = slot.available !== false && slot.isAvailable !== false;
                return (
                  <button
                    key={slot.id}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1
                      ${!isAvailable 
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
                        : selectedSlot?.id === slot.id 
                          ? 'bg-green-50 border-green-500 text-green-700 ring-2 ring-green-200' 
                          : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-gray-700'
                      }`}
                  >
                    <span className="font-bold text-lg">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                    <span className="text-xs font-medium">{slot.price.toLocaleString('vi-VN')}đ</span>
                    {isAvailable ? <FaCheck className="text-green-500 mt-1 text-xs" /> : <FaTimes className="text-red-400 mt-1 text-xs" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button 
            variant="primary" 
            className="px-8 py-3 text-lg !bg-green-600 hover:!bg-green-700 shadow-md"
            disabled={!selectedSlot}
            onClick={handleBooking}
          >
            Tiếp Tục Đặt Sân
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PitchDetail;