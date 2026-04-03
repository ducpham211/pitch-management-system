import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHistory, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';
import Button from '../../components/common/Button';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndBookings = async () => {
      try {
        const profileRes = await axiosClient.get('/users/me');
        setUserProfile(profileRes.data);

        const bookingsRes = await axiosClient.get('/bookings');
        setBookings(bookingsRes.data.content || bookingsRes.data || []);
      } catch (error) {
        console.error('Lỗi tải hồ sơ:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileAndBookings();
  }, [navigate]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'DEPOSIT_PAID':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaClock /> Sắp tới</span>;
      case 'COMPLETED':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaCheckCircle /> Hoàn thành</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaTimesCircle /> Đã hủy</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status || 'Chưa rõ'}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
     if (!dateStr) return 'Chưa có';
     const parts = dateStr.split('-');
     return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  const safeSubstring = (str: string | undefined | null, length: number) => {
    if (!str) return 'Không xác định';
    return str.substring(0, length);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl h-full">
      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center sticky top-24">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl font-bold mb-4">
              {userProfile?.fullName ? userProfile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{userProfile?.fullName || 'Chưa cập nhật tên'}</h2>
            <p className="text-gray-500 mb-2">{userProfile?.email}</p>
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold mb-6">
              Vai trò: {userProfile?.role || 'PLAYER'}
            </span>
            
            <div className="w-full flex flex-col gap-2">
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition ${activeTab === 'info' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FaUser /> Thông tin cá nhân
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition ${activeTab === 'history' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <FaHistory /> Lịch sử đặt sân
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          {activeTab === 'info' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin chi tiết</h2>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaUser /></div>
                    <input type="text" defaultValue={userProfile?.fullName || ''} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaEnvelope /></div>
                    <input type="email" defaultValue={userProfile?.email || ''} disabled className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 outline-none cursor-not-allowed" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaPhone /></div>
                    <input type="text" defaultValue={userProfile?.phone || ''} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="Chưa cập nhật số điện thoại" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực (Đang phát triển)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaMapMarkerAlt /></div>
                    <input type="text" disabled defaultValue="Hồ Chí Minh, Việt Nam" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 outline-none cursor-not-allowed" />
                  </div>
                </div>
                <Button type="button" variant="primary" className="mt-4 px-6 py-2 !bg-green-600 hover:!bg-green-700" onClick={() => alert('Chức năng cập nhật đang được phát triển!')}>Lưu thay đổi</Button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Lịch sử giao dịch</h2>
              
              {bookings.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                   <p className="text-gray-500 text-lg">Bạn chưa có lịch sử đặt sân nào.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking, index) => (
                    <div key={booking.bookingId || index} className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                        <div>
                          <span className="text-xs text-gray-500 font-bold mb-1 block uppercase">MÃ ĐƠN: {safeSubstring(booking.bookingId, 8)}</span>
                          <h3 className="font-bold text-gray-800 text-lg">Sân {safeSubstring(booking.fieldId, 8)}</h3>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                        <div>
                          <p className="mb-1">Ngày đá: <span className="font-bold text-gray-800">{formatDate(booking.bookingDate)}</span></p>
                          <p>Ghi chú: <span className="italic">{booking.note || 'Không có'}</span></p>
                        </div>
                        <div className="sm:text-right bg-gray-50 p-3 rounded-lg border border-gray-100">
                          <p className="mb-1">Đã cọc: <span className="font-bold text-blue-600">{(booking.depositAmount || 0).toLocaleString('vi-VN')}đ</span></p>
                          <p>Tổng tiền sân: <span className="font-bold text-gray-800">{(booking.totalAmount || 0).toLocaleString('vi-VN')}đ</span></p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;