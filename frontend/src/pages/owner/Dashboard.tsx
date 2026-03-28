import { useState } from 'react';
import { FaChartLine, FaList, FaCalendarCheck, FaPlus, FaCheck, FaTimes } from 'react-icons/fa';
import { OWNER_STATS, OWNER_PITCHES, OWNER_BOOKINGS } from '../../mocks/ownerData';
import Button from '../../components/common/Button';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pitches' | 'bookings'>('overview');

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Chờ duyệt cọc</span>;
      case 'APPROVED': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Đã nhận cọc</span>;
      case 'COMPLETED': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Hoàn thành</span>;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-6 h-full">
      
      <div className="w-full md:w-1/4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Kênh Chủ Sân</h2>
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition ${activeTab === 'overview' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FaChartLine /> Tổng quan
          </button>
          <button onClick={() => setActiveTab('pitches')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition ${activeTab === 'pitches' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FaList /> Quản lý Sân
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition ${activeTab === 'bookings' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FaCalendarCheck /> Quản lý Đơn
          </button>
        </div>
      </div>

      <div className="w-full md:w-3/4">
        
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Báo cáo doanh thu</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                <p className="text-sm text-gray-500 font-medium">Tổng doanh thu</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{OWNER_STATS.totalRevenue.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                <p className="text-sm text-gray-500 font-medium">Đơn hoàn thành</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{OWNER_STATS.completedMatches}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                <p className="text-sm text-gray-500 font-medium">Chờ duyệt cọc</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{OWNER_STATS.pendingDeposits}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
                <p className="text-sm text-gray-500 font-medium">Tổng lượt đặt</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{OWNER_STATS.totalBookings}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pitches' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Danh sách Sân con</h2>
              <Button variant="primary" className="flex items-center gap-2 !bg-blue-600"><FaPlus /> Thêm sân</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <th className="p-4 font-medium rounded-tl-lg">Tên sân</th>
                    <th className="p-4 font-medium">Loại sân</th>
                    <th className="p-4 font-medium">Khung giá</th>
                    <th className="p-4 font-medium">Trạng thái</th>
                    <th className="p-4 font-medium rounded-tr-lg">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {OWNER_PITCHES.map((pitch) => (
                    <tr key={pitch.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-800">{pitch.name}</td>
                      <td className="p-4 text-gray-600">{pitch.type}</td>
                      <td className="p-4 text-blue-600 font-medium">{pitch.price}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${pitch.status === 'Hoạt động' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {pitch.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="text-blue-600 hover:underline mr-3 text-sm font-medium">Sửa</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Quản lý Đơn đặt sân</h2>
              <Button variant="secondary" className="flex items-center gap-2 border border-gray-300"><FaPlus /> Khách vãng lai</Button>
            </div>
            <div className="space-y-4">
              {OWNER_BOOKINGS.map((bk) => (
                <div key={bk.id} className="p-5 border border-gray-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-sm transition gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold text-gray-500">#{bk.id}</span>
                      {getBookingStatusBadge(bk.status)}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">{bk.customer} - {bk.phone}</h3>
                    <p className="text-gray-600 text-sm mt-1">{bk.pitch} | <span className="font-medium">{bk.time}</span></p>
                  </div>
                  <div className="flex flex-col items-end w-full md:w-auto">
                    <p className="text-sm text-gray-500 mb-2">Cọc: <span className="font-bold text-blue-600 text-lg">{bk.deposit.toLocaleString('vi-VN')}đ</span></p>
                    {bk.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button variant="primary" className="!bg-green-600 px-3 py-1 flex items-center gap-1 text-sm"><FaCheck /> Duyệt</Button>
                        <Button variant="danger" className="px-3 py-1 flex items-center gap-1 text-sm"><FaTimes /> Hủy</Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OwnerDashboard;