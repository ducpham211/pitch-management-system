import { useState } from 'react';
import { FaUsers, FaCheckSquare, FaChartPie, FaLock, FaUnlock, FaCheck, FaTimes } from 'react-icons/fa';
import { ADMIN_STATS, ADMIN_USERS, ADMIN_PENDING_PITCHES } from '../../mocks/adminData';
import Button from '../../components/common/Button';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'approvals'>('overview');
  const [users, setUsers] = useState(ADMIN_USERS);
  const [pendingPitches, setPendingPitches] = useState(ADMIN_PENDING_PITCHES);

  const toggleUserStatus = (id: string) => {
    setUsers(users.map(u => {
      if (u.id === id) {
        return { ...u, status: u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE' };
      }
      return u;
    }));
  };

  const handleApprovePitch = (id: string, isApproved: boolean) => {
    const action = isApproved ? 'duyệt' : 'từ chối';
    if (window.confirm(`Bạn có chắc chắn muốn ${action} sân này?`)) {
      setPendingPitches(pendingPitches.filter(p => p.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl flex flex-col md:flex-row gap-6 h-full">
      {}
      <div className="w-full md:w-1/4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Kênh Quản Trị</h2>
        <div className="flex flex-col gap-2">
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition ${activeTab === 'overview' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FaChartPie /> Tổng quan hệ thống
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-3 w-full p-3 rounded-xl font-medium transition ${activeTab === 'users' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <FaUsers /> Quản lý Người dùng
          </button>
          <button onClick={() => setActiveTab('approvals')} className={`flex items-center justify-between w-full p-3 rounded-xl font-medium transition ${activeTab === 'approvals' ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}>
            <div className="flex items-center gap-3"><FaCheckSquare /> Kiểm duyệt Sân</div>
            {pendingPitches.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingPitches.length}</span>
            )}
          </button>
        </div>
      </div>

      <div className="w-full md:w-3/4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Thống kê Nền tảng</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-purple-500">
                <p className="text-sm text-gray-500 font-medium">Doanh thu nền tảng</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{ADMIN_STATS.totalPlatformRevenue.toLocaleString('vi-VN')}đ</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-blue-500">
                <p className="text-sm text-gray-500 font-medium">Tổng Users</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{ADMIN_STATS.totalUsers}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-green-500">
                <p className="text-sm text-gray-500 font-medium">Tổng Sân bóng</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{ADMIN_STATS.totalPitches}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-t-4 border-t-orange-500">
                <p className="text-sm text-gray-500 font-medium">Chờ duyệt</p>
                <p className="text-2xl font-bold text-gray-800 mt-2">{pendingPitches.length}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Tài khoản</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                    <th className="p-4 font-medium rounded-tl-lg">ID</th>
                    <th className="p-4 font-medium">Họ tên & Email</th>
                    <th className="p-4 font-medium">Vai trò</th>
                    <th className="p-4 font-medium">Trạng thái</th>
                    <th className="p-4 font-medium rounded-tr-lg text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-500">{user.id}</td>
                      <td className="p-4">
                        <p className="font-bold text-gray-800">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'OWNER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => toggleUserStatus(user.id)} className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 mx-auto transition ${user.status === 'ACTIVE' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                          {user.status === 'ACTIVE' ? <><FaLock /> Khóa</> : <><FaUnlock /> Mở</>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Yêu cầu đăng ký Sân mới</h2>
            {pendingPitches.length > 0 ? (
              <div className="space-y-4">
                {pendingPitches.map((pitch) => (
                  <div key={pitch.id} className="p-5 border border-gray-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center bg-orange-50/30">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{pitch.name}</h3>
                      <p className="text-gray-600 text-sm mt-1">Chủ sân: <span className="font-medium">{pitch.owner}</span> | Loại: {pitch.type}</p>
                      <p className="text-gray-500 text-xs mt-1">Ngày gửi yêu cầu: {pitch.requestDate}</p>
                    </div>
                    <div className="flex gap-2 mt-4 md:mt-0">
                      <Button variant="primary" className="!bg-green-600 px-4 py-2 flex items-center gap-2" onClick={() => handleApprovePitch(pitch.id, true)}>
                        <FaCheck /> Duyệt
                      </Button>
                      <Button variant="danger" className="px-4 py-2 flex items-center gap-2" onClick={() => handleApprovePitch(pitch.id, false)}>
                        <FaTimes /> Từ chối
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">Tuyệt vời! Không có yêu cầu chờ duyệt nào.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;