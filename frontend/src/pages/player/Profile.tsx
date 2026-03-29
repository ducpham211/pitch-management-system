import { useState } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaHistory } from 'react-icons/fa';
import { MOCK_USER, MOCK_BOOKING_HISTORY } from '../../mocks/userData';
import Button from '../../components/common/Button';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Sắp tới</span>;
      case 'SUCCESS':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Đã hoàn thành</span>;
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Đã hủy</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl h-full">
      <div className="flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-1/3">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl font-bold mb-4">
              {MOCK_USER.avatar}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{MOCK_USER.name}</h2>
            <p className="text-gray-500 mb-6">{MOCK_USER.email}</p>
            
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
                    <input type="text" defaultValue={MOCK_USER.name} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaEnvelope /></div>
                    <input type="email" defaultValue={MOCK_USER.email} disabled className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaPhone /></div>
                    <input type="text" defaultValue={MOCK_USER.phone} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><FaMapMarkerAlt /></div>
                    <input type="text" defaultValue={MOCK_USER.address} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>
                <Button variant="primary" className="mt-4 px-6 py-2 !bg-green-600">Cập nhật thông tin</Button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Lịch sử giao dịch</h2>
              <div className="space-y-4">
                {MOCK_BOOKING_HISTORY.map((booking) => (
                  <div key={booking.id} className="p-4 border border-gray-100 rounded-xl hover:shadow-sm transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-xs text-gray-500 font-bold mb-1 block">MÃ ĐƠN: {booking.id}</span>
                        <h3 className="font-bold text-gray-800 text-lg">{booking.pitchName}</h3>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                      <div>
                        <p>Ngày đá: <span className="font-bold text-gray-800">{booking.date}</span></p>
                        <p>Khung giờ: <span className="font-bold text-gray-800">{booking.time}</span></p>
                      </div>
                      <div className="text-right">
                        <p>Đã cọc: <span className="font-bold text-blue-600">{booking.deposit.toLocaleString('vi-VN')}đ</span></p>
                        <p>Tổng tiền: <span className="font-bold text-gray-800">{booking.totalPrice.toLocaleString('vi-VN')}đ</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;