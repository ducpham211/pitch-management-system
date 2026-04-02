import { useState, useEffect } from 'react';
import { FaChartLine, FaList, FaCalendarCheck, FaPlus, FaCheck, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { OWNER_STATS, OWNER_BOOKINGS } from '../../mocks/ownerData';
import Button from '../../components/common/Button';
import PitchFormModal from '../../components/owner/PitchFormModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pitches' | 'bookings'>('overview');
  
  const [pitches, setPitches] = useState<any[]>([]);
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [editingPitch, setEditingPitch] = useState<any | null>(null);
  const [isLoadingPitches, setIsLoadingPitches] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    if (activeTab === 'pitches') {
      fetchPitches();
    }
  }, [activeTab]);

  const fetchPitches = async () => {
    setIsLoadingPitches(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/dang-nhap');
        return;
      }
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${API_URL}/fields`, config);
      setPitches(res.data.content || res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sân:", error);
    } finally {
      setIsLoadingPitches(false);
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Chờ duyệt cọc</span>;
      case 'APPROVED': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Đã nhận cọc</span>;
      case 'COMPLETED': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Hoàn thành</span>;
      default: return null;
    }
  };

  const translateFieldType = (type: string) => {
    switch(type) {
      case 'FIVE_A_SIDE': return 'Sân 5 người';
      case 'SEVEN_A_SIDE': return 'Sân 7 người';
      case 'ELEVEN_A_SIDE': return 'Sân 11 người';
      default: return type;
    }
  };

  const handleOpenAddModal = () => {
    setEditingPitch(null);
    setIsPitchModalOpen(true);
  };

  const handleOpenEditModal = (pitch: any) => {
    setEditingPitch(pitch);
    setIsPitchModalOpen(true);
  };

  const handleDeletePitch = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sân này không? (Lưu ý: Không thể hoàn tác)')) {
      try {
        const token = localStorage.getItem('accessToken');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${API_URL}/fields/${id}`, config);
        alert("Đã xóa sân thành công!");
        fetchPitches(); // Tải lại danh sách
      } catch (error) {
        console.error("Lỗi xóa sân:", error);
        alert("Xóa sân thất bại. Có thể sân này đang có đơn đặt hoặc dữ liệu liên quan.");
      }
    }
  };

  const handleSavePitch = async (pitchData: any) => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const payload = {
        name: pitchData.name,
        type: pitchData.type
      };

      if (editingPitch && editingPitch.id) {
        // Cập nhật sân
        await axios.put(`${API_URL}/fields/${editingPitch.id}`, payload, config);
        alert("Cập nhật sân thành công!");
      } else {
        // Thêm sân mới
        await axios.post(`${API_URL}/fields`, payload, config);
        alert("Thêm sân mới thành công!");
      }
      
      setIsPitchModalOpen(false);
      fetchPitches(); // Tải lại danh sách
    } catch (error) {
      console.error("Lỗi lưu sân:", error);
      alert("Không thể lưu thông tin sân lúc này.");
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
            <h2 className="text-2xl font-bold text-gray-800">Báo cáo doanh thu (Dữ liệu mẫu)</h2>
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
              <Button variant="primary" className="flex items-center gap-2 !bg-blue-600" onClick={handleOpenAddModal}>
                <FaPlus /> Thêm sân
              </Button>
            </div>
            
            {isLoadingPitches ? (
               <div className="text-center py-10 text-gray-500">Đang tải dữ liệu sân...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
                      <th className="p-4 font-medium rounded-tl-lg">Tên sân</th>
                      <th className="p-4 font-medium">Loại sân</th>
                      <th className="p-4 font-medium">Khung giá (Tạm)</th>
                      <th className="p-4 font-medium rounded-tr-lg text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pitches.length > 0 ? (
                      pitches.map((pitch) => (
                        <tr key={pitch.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 font-bold text-gray-800">{pitch.name}</td>
                          <td className="p-4 text-gray-600">{translateFieldType(pitch.type)}</td>
                          <td className="p-4 text-blue-600 font-medium">Theo Ca Đá</td>
                          <td className="p-4 flex items-center justify-center gap-3">
                            <button onClick={() => handleOpenEditModal(pitch)} className="text-blue-500 hover:text-blue-700 transition">
                              <FaEdit className="text-lg" />
                            </button>
                            <button onClick={() => handleDeletePitch(pitch.id)} className="text-red-400 hover:text-red-600 transition">
                              <FaTrash className="text-lg" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-gray-500">Chưa có sân nào. Hãy thêm sân mới!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Quản lý Đơn đặt sân (Dữ liệu mẫu)</h2>
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

      <PitchFormModal 
        isOpen={isPitchModalOpen} 
        onClose={() => setIsPitchModalOpen(false)} 
        onSubmit={handleSavePitch} 
        initialData={editingPitch} 
      />
    </div>
  );
};

export default OwnerDashboard;