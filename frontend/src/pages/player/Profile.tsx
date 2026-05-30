import { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHistory, FaCheckCircle, FaTimesCircle, FaClock, FaStar } from 'react-icons/fa';
import Button from '../../components/common/Button';
import axiosClient from '../../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import PopupMessage from '../../components/common/PopupMessage';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [updateData, setUpdateData] = useState({ fullName: '', phone: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [popupInfo, setPopupInfo] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    onConfirm: () => void;
    showCancel?: boolean;
    cancelLabel?: string;
    confirmLabel?: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const closePopup = () => {
    setPopupInfo(prev => ({ ...prev, isOpen: false }));
  };

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileAndBookings = async () => {
      try {
        const profileRes = await axiosClient.get('/users/me');
        setUserProfile(profileRes.data);
        console.log(profileRes.data);
        setUpdateData({ fullName: profileRes.data.fullName || '', phone: profileRes.data.phone || '' });
        
        const bookingsRes = await axiosClient.get('/bookings');
        const rawBookings = bookingsRes.data.content || bookingsRes.data || [];
        
        const sortedBookings = rawBookings.sort((a: any, b: any) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return timeB - timeA;
        });
        
        setBookings(sortedBookings);
      } catch (error) {
        console.error('Lỗi tải hồ sơ:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileAndBookings();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.id) return;
    setIsUpdating(true);
    try {
      await axiosClient.put(`/users/${userProfile.id}`, { 
        fullName: updateData.fullName, 
        phone: updateData.phone,
      });
      setPopupInfo({
        isOpen: true,
        type: 'success',
        title: 'Thành công',
        message: '🎉 Đã cập nhật thông tin cá nhân thành công!',
        onConfirm: closePopup,
        showCancel: false
      });
      setUserProfile({ ...userProfile, ...updateData });
    } catch (error: any) {
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Thất bại',
        message: 'Cập nhật thất bại: ' + (error.response?.data?.message || 'Có lỗi xảy ra.'),
        onConfirm: closePopup,
        showCancel: false
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'DEPOSIT_PAID': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaClock /> Sắp tới</span>;
      case 'COMPLETED': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaCheckCircle /> Hoàn thành</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"><FaTimesCircle /> Đã hủy</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status || 'Chưa rõ'}</span>;
    }
  };

  const formatDate = (dateStr: string) => {
     if (!dateStr) return 'Chưa có';
     const parts = dateStr.split('-');
     return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return 'Chưa có';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${mins} - ${day}/${month}/${year}`;
  };

  const formatTimeOnly = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        const parts = dateStr.split(':');
        if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
        return dateStr;
    }
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const safeSubstring = (str: string | undefined | null) => {
    if (!str) return 'Không xác định';
    return str.substring(0, 6).toUpperCase();
  };

  if (isLoading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div></div>;

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
            <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold mb-6">Vai trò: {userProfile?.role || 'PLAYER'}</span>
            
            <div className="w-full flex flex-col gap-2">
              <button onClick={() => setActiveTab('info')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition ${activeTab === 'info' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <FaUser /> Thông tin cá nhân
              </button>
              <button onClick={() => setActiveTab('history')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition ${activeTab === 'history' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <FaHistory /> Lịch sử Đặt Sân
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          {activeTab === 'info' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin chi tiết</h2>
              <form className="space-y-4" onSubmit={handleUpdateProfile}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaUser /></div>
                    <input type="text" value={updateData.fullName} onChange={e => setUpdateData({...updateData, fullName: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
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
                    <input type="text" value={updateData.phone} onChange={e => setUpdateData({...updateData, phone: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực (Đang phát triển)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaMapMarkerAlt /></div>
                    <input type="text" disabled defaultValue="Hồ Chí Minh, Việt Nam" className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 outline-none cursor-not-allowed" />
                  </div>
                </div>
                <Button type="submit" variant="primary" className="mt-4 px-6 py-2 !bg-green-600 hover:!bg-green-700" disabled={isUpdating}>
                  {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </Button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Lịch sử Tìm Sân</h2>
              {bookings.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300"><p className="text-gray-500 text-lg">Bạn chưa có đơn nào.</p></div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking, index) => (
                    <div key={booking.bookingId || index} className="p-5 border border-gray-100 rounded-xl hover:shadow-md transition">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                        <div>
                          <span className="text-xs text-gray-500 font-bold mb-1 block uppercase">MÃ ĐƠN: {safeSubstring(booking.bookingId || booking.id)}</span>
                          <h3 className="font-bold text-gray-800 text-lg">Sân {safeSubstring(booking.fieldId)}</h3>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                        <div>
                          <p className="mb-1 text-gray-500">Giờ đặt sân: <span className="font-bold text-gray-800">{formatDateTime(booking.createdAt)}</span></p>
                          <p className="mb-1 text-gray-500">Ngày ra sân: <span className="font-bold text-gray-800">{formatDate(booking.bookingDate)}</span></p>
                          <p className="mb-1 text-gray-500">Ca đá: <span className="font-bold text-gray-800">{booking.startTime && booking.endTime ? `${formatTimeOnly(booking.startTime)} - ${formatTimeOnly(booking.endTime)}` : 'Đang cập nhật'}</span></p>
                          <p className="text-gray-500">Tổng chi phí: <span className="font-bold text-gray-800">{(booking.totalAmount || 0).toLocaleString('vi-VN')}đ</span></p>
                        </div>
                        <div className="sm:text-right flex flex-col justify-end items-start sm:items-end">
                           {booking.status === 'COMPLETED' && (
                              <span className="text-green-600 font-bold flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                <FaCheckCircle /> Ca đá đã kết thúc
                              </span>
                           )}
                           {booking.status === 'CANCELLED' && (
                              <span className="text-red-600 font-bold flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100">
                                <FaTimesCircle /> Đã hủy cọc
                              </span>
                           )}
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
      <PopupMessage
        isOpen={popupInfo.isOpen}
        onClose={closePopup}
        type={popupInfo.type}
        title={popupInfo.title}
        message={popupInfo.message}
        onConfirm={popupInfo.onConfirm}
        showCancel={popupInfo.showCancel}
        cancelLabel={popupInfo.cancelLabel}
        confirmLabel={popupInfo.confirmLabel}
      />
    </div>
  );
};

export default Profile;