import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaFutbol, FaArrowLeft, FaCalendarAlt, FaClock, FaCheck, FaTimes, FaMapMarkerAlt, FaPhoneAlt, FaMoneyBillWave, FaStar, FaUserCircle } from 'react-icons/fa';
import Button from '../../components/common/Button';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import PopupMessage from '../../components/common/PopupMessage';

const PitchDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pitch, setPitch] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]); 
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [popupInfo, setPopupInfo] = useState({
    isOpen: false,
    type: 'info' as 'success' | 'error' | 'info',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const closePopup = () => {
    setPopupInfo(prev => ({ ...prev, isOpen: false }));
  };

  const formatTime = (isoString: any) => {
    if (!isoString) return '';
    if (Array.isArray(isoString)) {
        return `${isoString[0].toString().padStart(2, '0')}:${(isoString[1] || 0).toString().padStart(2, '0')}`;
    }
    const str = String(isoString);
    if (str.includes('T')) return str.split('T')[1].substring(0, 5);
    if (str.includes(' ')) return str.split(' ')[1].substring(0, 5);
    if (str.includes(':')) {
        const parts = str.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return str.substring(0, 5);
  };

  const isSlotAvailable = (s: any) => {
    if (s.available !== undefined) return s.available === true;
    if (s.isAvailable !== undefined) return s.isAvailable === true;
    return s.status === 'AVAILABLE';
  };

  useEffect(() => {
    const fetchPitchDetailAndReviews = async () => {
      try {
        // 1. Lấy thông tin sân
        const res = await axiosClient.get(`/fields/${id}`);
        setPitch(res.data?.data || res.data);

        // 2. Lấy đánh giá sân (Chỉ gọi ĐÚNG 1 API)
        try {
            const reviewRes = await axiosClient.get(`/reviews/field/${id}`);
            const reviewData = reviewRes.data?.content || reviewRes.data?.data || reviewRes.data;
            if (Array.isArray(reviewData)) {
                setReviews(reviewData);
            }
        } catch (e) {
            console.log("Sân chưa có đánh giá nào.");
        }
      } catch (error) {
        console.error("Lỗi tải chi tiết sân", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPitchDetailAndReviews();
  }, [id]);

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id || !selectedDate) return;
      try {
        const res = await axiosClient.get(`/fields/${id}/availability?date=${selectedDate}`);
        const rawSlots = Array.isArray(res.data) ? res.data : (res.data.availableTimeSlots || res.data.timeSlots || []);
        
        const uniqueSlots: any[] = [];
        const seen = new Set();
        
        rawSlots.forEach((slot: any) => {
          const startStr = formatTime(slot.startTime);
          const endStr = formatTime(slot.endTime);
          const timeKey = `${startStr}-${endStr}`;
          
          if (!seen.has(timeKey)) {
            seen.add(timeKey);
            uniqueSlots.push(slot);
          }
        });

        const sortedSlots = uniqueSlots.sort((a: any, b: any) => {
           const timeA = formatTime(a.startTime);
           const timeB = formatTime(b.startTime);
           return timeA.localeCompare(timeB);
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
    if (!user) {
      setPopupInfo({
        isOpen: true,
        type: 'info',
        title: 'Yêu cầu đăng nhập',
        message: 'Bạn cần đăng nhập để có thể tiếp tục đặt sân!',
        onConfirm: () => {
          closePopup();
          navigate('/login');
        }
      });
      return;
    }

    if (!selectedSlot) return;
    navigate(`/checkout/${id}`, {
      state: { pitch, selectedSlot, selectedDate }
    });
  };

  const translateFieldType = (type: string) => {
    if (type === 'FIVE_A_SIDE') return 'Sân 5 người';
    if (type === 'SEVEN_A_SIDE') return 'Sân 7 người';
    if (type === 'ELEVEN_A_SIDE') return 'Sân 11 người';
    return type;
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length).toFixed(1) 
    : 0;

  if (isLoading) return <div className="text-center py-20 text-gray-500 font-bold text-xl animate-pulse">Đang tải thông tin sân...</div>;
  if (!pitch) return <div className="text-center py-20 text-gray-500 font-bold text-xl">Không tìm thấy thông tin sân bóng!</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Link to="/pitches" className="inline-flex items-center text-gray-500 hover:text-green-600 mb-6 transition font-medium">
        <FaArrowLeft className="mr-2" /> Quay lại danh sách
      </Link>

      {/* THÔNG TIN SÂN BÓNG */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row mb-8">
        <div className="md:w-1/2 h-64 md:h-auto bg-gray-200 relative">
          <img 
            src={pitch.coverImage || 'https://images.unsplash.com/photo-1459865264687-595d652de67e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80'} 
            alt={pitch.name} 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                {translateFieldType(pitch.type)}
              </span>
              <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100 font-bold text-sm">
                 <FaStar /> {avgRating} ({reviews.length})
              </div>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-800 mb-4">{pitch.name}</h1>
            
            <div className="space-y-3 mb-6">
                <p className="flex items-start gap-3 text-gray-600">
                    <FaMapMarkerAlt className="text-red-500 mt-1" />
                    <span>{pitch.address || 'Chưa cập nhật địa chỉ'}</span>
                </p>
                <p className="flex items-center gap-3 text-gray-600">
                    <FaPhoneAlt className="text-blue-500" />
                    <span>{pitch.phone || 'Chưa cập nhật SĐT'}</span>
                </p>
                <p className="flex items-center gap-3 text-gray-600">
                    <FaMoneyBillWave className="text-green-500" />
                    <span className="font-bold text-green-700">
                        {pitch.price ? `${pitch.price.toLocaleString('vi-VN')} VNĐ / Giờ` : 'Liên hệ'}
                    </span>
                </p>
            </div>
          </div>
        </div>
      </div>

      {/* CHỌN CA ĐÁ */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Lịch Trống & Đặt Sân</h2>
        
        <div className="mb-6 max-w-xs">
          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
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
          <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <FaClock className="text-green-600" /> Chọn ca đá
          </label>
          
          {availableSlots.length === 0 ? (
            <div className="p-6 bg-gray-50 rounded-2xl text-center border border-dashed border-gray-300">
              <FaTimes className="text-gray-300 text-4xl mx-auto mb-2" />
              <p className="text-gray-500 font-medium">Không có ca đá nào được thiết lập hoặc còn trống trong ngày này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {availableSlots.map((slot, index) => {
                const isAvailable = isSlotAvailable(slot);
                return (
                  <button
                    key={slot.id || index}
                    disabled={!isAvailable}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1
                      ${!isAvailable 
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60' 
                        : selectedSlot?.id === slot.id 
                          ? 'bg-green-50 border-green-500 text-green-700 ring-2 ring-green-200 font-bold' 
                          : 'bg-white border-gray-200 hover:border-green-400 hover:bg-green-50/50 text-gray-700 font-medium'
                      }`}
                  >
                    <span className="text-lg">{formatTime(slot.startTime)} - {formatTime(slot.endTime)}</span>
                    <span className="text-xs">{slot.price.toLocaleString('vi-VN')}đ</span>
                    {isAvailable ? <FaCheck className="text-green-500 mt-1 text-xs" /> : <span className="text-xs text-red-400 mt-1 font-bold">Kín lịch</span>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-100">
          <Button 
            variant="primary" 
            className="px-8 py-3 text-lg !bg-green-600 hover:!bg-green-700 shadow-md font-bold rounded-xl"
            disabled={!selectedSlot}
            onClick={handleBooking}
          >
            Tiếp Tục Đặt Sân
          </Button>
        </div>
      </div>

      {/* ĐÁNH GIÁ SÂN TỪ NGƯỜI DÙNG */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <FaStar className="text-yellow-500" /> Nhận xét từ người chơi ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-500">Sân này chưa có đánh giá nào. Hãy là người đầu tiên trải nghiệm và để lại nhận xét nhé!</p>
              </div>
          ) : (
              <div className="space-y-4">
                  {reviews.map((review: any, index: number) => (
                      <div key={review.id || index} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-4 hover:shadow-md transition">
                          <div className="flex items-center gap-3 sm:w-1/4 sm:flex-col sm:items-start sm:gap-1">
                              <FaUserCircle className="text-4xl text-gray-400" />
                              <div>
                                  <p className="font-bold text-gray-800">{review.userName || review.reviewerName || review.userFullName || 'Khách hàng'}</p>
                                  <p className="text-xs text-gray-500">
                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('vi-VN') : 'Gần đây'}
                                  </p>
                              </div>
                          </div>
                          <div className="flex-1 border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-5">
                              <div className="flex gap-1 text-yellow-400 mb-2">
                                  {[1, 2, 3, 4, 5].map(star => (
                                      <FaStar key={star} className={star <= (review.rating || 5) ? 'text-yellow-400' : 'text-gray-200'} />
                                  ))}
                              </div>
                              <p className="text-gray-700 italic leading-relaxed">"{review.comment || 'Người chơi không để lại bình luận'}"</p>
                          </div>
                      </div>
                  ))}
              </div>
          )}
      </div>
      
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

export default PitchDetail;