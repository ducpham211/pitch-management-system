import { useState, useEffect } from 'react';
import { FaChartLine, FaList, FaCalendarCheck, FaPlus, FaCheck, FaTimes, FaEdit, FaTrash, FaMoneyBillWave } from 'react-icons/fa';
import { OWNER_STATS } from '../../mocks/ownerData';
import Button from '../../components/common/Button';
import PitchFormModal from '../../components/owner/PitchFormModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pitches' | 'bookings'>('overview');
  
  const [pitches, setPitches] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [editingPitch, setEditingPitch] = useState<any | null>(null);
  
  const [isLoadingPitches, setIsLoadingPitches] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    if (activeTab === 'pitches') fetchPitches();
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab]);

  // ================= API QUẢN LÝ SÂN =================
  const fetchPitches = async () => {
    setIsLoadingPitches(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return navigate('/dang-nhap');
      const res = await axios.get(`${API_URL}/fields`, { headers: { Authorization: `Bearer ${token}` } });
      setPitches(res.data.content || res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sân:", error);
    } finally {
      setIsLoadingPitches(false);
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

  const handleOpenAddModal = () => { setEditingPitch(null); setIsPitchModalOpen(true); };
  
  const handleOpenEditModal = async (pitch: any) => { 
    try {
      const res = await axios.get(`${API_URL}/fields/${pitch.id}`);
      setEditingPitch(res.data);
      setIsPitchModalOpen(true);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chi tiết sân:', error);
      alert('Không thể tải thông tin sân');
    }
  };

  const handleDeletePitch = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sân này không? (Lưu ý: Không thể hoàn tác)')) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${API_URL}/fields/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        alert("Đã xóa sân thành công!");
        fetchPitches();
      } catch (error) {
        console.error("Lỗi xóa sân:", error);
        alert("Xóa sân thất bại. Có thể sân này đang có đơn đặt.");
      }
    }
  };

  // Cập nhật hàm Save để xử lý cả thông tin sân và mảng TimeSlots
  const handleSavePitch = async (pitchData: any, deletedSlotIds: string[]) => {
    try {
      const token = localStorage.getItem('accessToken');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const fieldPayload = {
        name: pitchData.name,
        type: pitchData.type,
        coverImage: pitchData.coverImage || ''
      };

      let savedFieldId = '';

      // 1. Lưu thông tin Sân
      if (editingPitch && editingPitch.id) {
        await axios.put(`${API_URL}/fields/${editingPitch.id}`, fieldPayload, config);
        savedFieldId = editingPitch.id;
      } else {
        const res = await axios.post(`${API_URL}/fields`, fieldPayload, config);
        savedFieldId = res.data.id;
      }

      // 2. Xóa các ca bị bỏ đi
      if (deletedSlotIds && deletedSlotIds.length > 0) {
        for (const slotId of deletedSlotIds) {
          await axios.delete(`${API_URL}/fields/${savedFieldId}/time-slots/${slotId}`, config);
        }
      }

      // 3. Thêm hoặc Cập nhật các ca đá (Convert HH:mm sang LocalDateTime ảo)
      if (pitchData.timeSlots && pitchData.timeSlots.length > 0) {
        for (const slot of pitchData.timeSlots) {
          const slotPayload = {
            // Chèn ngày ảo 2000-01-01 để map chuẩn với LocalDateTime của Backend
            startTime: `2000-01-01T${slot.startTime}:00`,
            endTime: `2000-01-01T${slot.endTime}:00`,
            price: Number(slot.price),
            status: slot.status || 'AVAILABLE'
          };
          
          if (slot.id) {
            await axios.put(`${API_URL}/fields/${savedFieldId}/time-slots/${slot.id}`, slotPayload, config);
          } else {
            await axios.post(`${API_URL}/fields/${savedFieldId}/time-slots`, slotPayload, config);
          }
        }
      }

      setIsPitchModalOpen(false);
      setEditingPitch(null);
      fetchPitches();
      alert('Lưu sân thành công!');
    } catch (error: any) {
      console.error('Lỗi lưu sân:', error);
      alert(error.response?.data?.message || error.response?.data || 'Lỗi khi lưu sân. Vui lòng thử lại.');
    }
  };

  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return navigate('/dang-nhap');
      const res = await axios.get(`${API_URL}/bookings`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data.content || res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn:", error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Chờ thanh toán</span>;
      case 'DEPOSIT_PAID': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Đã nhận cọc (Chờ đá)</span>;
      case 'COMPLETED': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Hoàn thành</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Bùng kèo / Hủy</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const handleCheckIn = async (bookingId: string) => {
    if (!window.confirm('Xác nhận khách đã đến nhận sân?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_URL}/bookings/${bookingId}/check-in`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Check-in thành công! Khách đã nhận sân.");
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data || "Lỗi khi Check-in");
    }
  };

  const handleNoShow = async (bookingId: string) => {
    if (!window.confirm('Đánh dấu khách KHÔNG ĐẾN và tịch thu cọc? Hành động này sẽ nhả lại sân trống.')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_URL}/bookings/${bookingId}/no-show`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Đã tịch thu cọc thành công!");
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data || "Lỗi khi Hủy đơn");
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    if (!window.confirm('Xác nhận thu nốt tiền mặt và Hoàn tất đơn này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_URL}/bookings/${bookingId}/check-out?method=CASH`, {}, { headers: { Authorization: `Bearer ${token}` } });
      alert("Đã Check-out và thu đủ tiền thành công!");
      fetchBookings();
    } catch (error: any) {
      alert(error.response?.data || "Lỗi khi Check-out");
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
              <h2 className="text-2xl font-bold text-gray-800">Quản lý Đơn đặt sân</h2>
              <Button variant="secondary" className="flex items-center gap-2 border border-gray-300"><FaPlus /> Khách vãng lai</Button>
            </div>
            
            {isLoadingBookings ? (
               <div className="text-center py-10 text-gray-500">Đang tải danh sách đơn...</div>
            ) : bookings.length === 0 ? (
               <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">Chưa có đơn đặt sân nào.</div>
            ) : (
              <div className="space-y-4">
                {bookings.map((bk) => (
                  <div key={bk.id} className="p-5 border border-gray-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-sm transition gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-gray-500">#{bk.id.substring(0,8)}</span>
                        {getBookingStatusBadge(bk.status)}
                      </div>
                      <h3 className="font-bold text-gray-800 text-lg">Khách ID: {bk.userId.substring(0,8)}</h3>
                      <p className="text-gray-600 text-sm mt-1">Ghi chú: {bk.note || 'Không có'}</p>
                    </div>
                    
                    <div className="flex flex-col items-end w-full md:w-auto">
                      <div className="text-right mb-3">
                         <p className="text-sm text-gray-500">Tổng tiền: <span className="font-bold text-gray-800">{bk.totalAmount ? bk.totalAmount.toLocaleString('vi-VN') : 0}đ</span></p>
                         <p className="text-sm text-blue-600">Đã cọc: <span className="font-bold">{bk.depositAmount ? bk.depositAmount.toLocaleString('vi-VN') : 0}đ</span></p>
                      </div>

                      {bk.status === 'DEPOSIT_PAID' && (
                        <div className="flex gap-2">
                          <Button variant="primary" className="!bg-green-600 px-3 py-1 flex items-center gap-1 text-sm" onClick={() => handleCheckIn(bk.id)}>
                            <FaCheck /> Nhận Sân
                          </Button>
                          <Button variant="danger" className="px-3 py-1 flex items-center gap-1 text-sm" onClick={() => handleNoShow(bk.id)}>
                            <FaTimes /> Bùng Kèo
                          </Button>
                        </div>
                      )}

                      {bk.status === 'COMPLETED' && (
                         <Button variant="secondary" className="!bg-blue-600 text-white px-3 py-1 flex items-center gap-1 text-sm" onClick={() => handleCheckOut(bk.id)}>
                            <FaMoneyBillWave /> Thu nốt tiền
                         </Button>
                      )}

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <PitchFormModal 
        isOpen={isPitchModalOpen} 
        onClose={() => setIsPitchModalOpen(false)} 
        onSave={handleSavePitch} 
        initialData={editingPitch} 
      />
    </div>
  );
};

export default OwnerDashboard;