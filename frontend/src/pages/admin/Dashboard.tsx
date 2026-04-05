import { useState, useEffect } from 'react';
import { FaUsers, FaFutbol, FaMoneyBillWave, FaChartBar, FaCheck, FaBan } from 'react-icons/fa';
import Button from '../../components/common/Button';
import { adminApi } from '../../api/adminApi';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'reports'>('overview');
  const [stats, setStats] = useState<any>(null);
  const [pendingOwners, setPendingOwners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const statsRes = await adminApi.getStats();
      setStats(statsRes.data);
      const ownersRes = await adminApi.getPendingOwners();
      setPendingOwners(ownersRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveOwner = async (userId: string) => {
    if (!window.confirm('Xác nhận cấp quyền Chủ Sân cho người dùng này?')) return;
    try {
      await adminApi.approveOwner(userId);
      alert('Đã cấp quyền Chủ Sân thành công!');
      fetchData();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  if (isLoading) return <div className="p-10 text-center text-gray-500">Đang tải dữ liệu quản trị...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-6 h-full">
      <div className="w-full md:w-1/4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Admin Panel</h2>
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition ${activeTab === 'overview' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FaChartBar /> Tổng quan
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition ${activeTab === 'users' ? 'bg-purple-50 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FaUsers /> Quản lý Người Dùng
          </button>
        </div>
      </div>

      <div className="w-full md:w-3/4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Thống Kê Hệ Thống</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                <p className="text-sm text-gray-500 font-medium">Tổng Người Dùng</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats?.totalUsers || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                <p className="text-sm text-gray-500 font-medium">Tổng Sân Bóng</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats?.totalFields || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
                <p className="text-sm text-gray-500 font-medium">Lượt Đặt Sân</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{stats?.totalBookings || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
                <p className="text-sm text-gray-500 font-medium">Dòng Tiền Lưu Thông</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{(stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Yêu Cầu Làm Chủ Sân</h2>
            {pendingOwners.length === 0 ? (
               <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-500">Không có yêu cầu duyệt chủ sân nào.</div>
            ) : (
              <div className="space-y-4">
                {pendingOwners.map((user: any) => (
                  <div key={user.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-xl">
                    <div>
                      <p className="font-bold text-gray-800">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="primary" className="!bg-green-600 px-3 py-1 flex items-center gap-1 text-sm" onClick={() => handleApproveOwner(user.id)}>
                        <FaCheck /> Duyệt
                      </Button>
                      <Button variant="danger" className="px-3 py-1 flex items-center gap-1 text-sm" onClick={() => alert('Đang phát triển')}>
                        <FaBan /> Từ chối
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;