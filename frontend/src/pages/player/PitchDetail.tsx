import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaFutbol, FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import Button from '../../components/common/Button';
import axios from 'axios';

interface Pitch {
  id: string;
  name: string;
  type: string;
  coverImage: string | null;
  status: string;
}

interface TimeSlot {
  timeSlotId: string;
  startTime: string;
  endTime: string;
  price: number;
  status: string;
}

const PitchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const [pitch, setPitch] = useState<Pitch | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPitchDetail = async () => {
      try {
        const response = await axios.get(`${API_URL}/fields/${id}`);
        setPitch(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    if (id) {
      fetchPitchDetail();
    }
  }, [id, API_URL]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id) return;
      try {
        const response = await axios.get(`${API_URL}/fields/${id}/availability?date=${selectedDate}`);
        setAvailableSlots(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAvailability();
  }, [id, selectedDate, API_URL]);

  const handleBooking = () => {
    if (!selectedSlot || !pitch) return;
    navigate('/thanh-toan', {
      state: {
        pitch: pitch,
        slot: selectedSlot,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!pitch) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Không tìm thấy thông tin sân
        </h2>
        <Button variant="primary" onClick={() => navigate('/tim-san')}>
          Quay lại tìm sân
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button
        onClick={() => navigate('/tim-san')}
        className="flex items-center gap-2 text-gray-600 hover:text-green-600 transition mb-6"
      >
        <FaArrowLeft /> Quay lại danh sách
      </button>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{pitch.name}</h1>
        <div className="flex flex-col md:flex-row gap-4 text-gray-600 mb-6">
          <p className="flex items-center gap-2">
            <FaMapMarkerAlt className="text-red-500" />
            <span>Cơ sở chính</span>
          </p>
          <p className="flex items-center gap-2">
            <FaFutbol className="text-black" />
            <span>Sân {pitch.type}</span>
          </p>
        </div>
        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
          * Mô tả chi tiết sân sẽ được hiển thị ở đây. Hệ thống chiếu sáng đạt chuẩn, mặt
          cỏ nhân tạo chất lượng cao, có khu vực căng tin và bãi giữ xe rộng rãi.
        </p>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FaCalendarAlt className="text-green-500" /> Chọn lịch trống
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ngày đặt sân
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlot(null);
            }}
            className="border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>

        {availableSlots.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {availableSlots.map((slot) => {
              const isSelected = selectedSlot?.timeSlotId === slot.timeSlotId;
              const isBooked = slot.status !== 'AVAILABLE';
              
              const formatTime = (timeStr: string) => {
                if (timeStr.includes('T')) {
                  return timeStr.split('T')[1].substring(0, 5);
                }
                return timeStr.substring(0, 5);
              };

              return (
                <button
                  key={slot.timeSlotId}
                  disabled={isBooked}
                  onClick={() => setSelectedSlot(slot)}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all
                    ${
                      isBooked
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : isSelected
                          ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                          : 'bg-white border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50'
                    }
                  `}
                >
                  <span className="font-bold text-lg">
                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                  </span>
                  <span
                    className={`text-sm mt-1 ${isBooked ? 'text-gray-400' : isSelected ? 'text-green-600 font-medium' : 'text-green-600'}`}
                  >
                    {isBooked
                      ? 'Đã đặt'
                      : `${slot.price.toLocaleString('vi-VN')}đ`}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-xl mb-8">
            <p className="text-gray-500">
              Chưa có lịch trống nào được cập nhật cho ngày này.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
          <div className="text-left w-full sm:w-auto">
            <p className="text-sm text-gray-500 mb-1">Tổng tiền cọc dự kiến (30%)</p>
            <p className="text-2xl font-bold text-green-600">
              {selectedSlot
                ? `${(selectedSlot.price * 0.3).toLocaleString('vi-VN')}đ`
                : '0đ'}
            </p>
          </div>
          <Button
            variant="primary"
            className="w-full sm:w-auto px-8 py-3 text-lg !bg-green-600 hover:!bg-green-700"
            onClick={handleBooking}
            disabled={!selectedSlot}
          >
            Thanh Toán Đặt Cọc
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PitchDetail;