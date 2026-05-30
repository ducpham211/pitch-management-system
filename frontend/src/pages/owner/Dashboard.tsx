import { useState, useEffect } from 'react';
import { FaChartLine, FaList, FaCalendarCheck, FaTimes, FaCalendarCheck as FaCalendarIcon } from 'react-icons/fa';
import Button from '../../components/common/Button';
import PitchFormModal from '../../components/owner/PitchFormModal';
import OverviewTab from '../../components/owner/OverviewTab';
import PitchesTab from '../../components/owner/PitchesTab';
import BookingsTab from '../../components/owner/BookingsTab';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PopupMessage from '../../components/common/PopupMessage';

const OwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pitches' | 'bookings'>('overview');
  
  const [pitches, setPitches] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  
  const [isPitchModalOpen, setIsPitchModalOpen] = useState(false);
  const [editingPitch, setEditingPitch] = useState<any | null>(null);
  
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPitch, setSelectedPitch] = useState<any | null>(null);

  const [isLoadingPitches, setIsLoadingPitches] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);
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
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  useEffect(() => {
    fetchPitches();
    fetchBookings();
  }, [activeTab]);

  const fetchPitches = async () => {
    setIsLoadingPitches(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return navigate('/login');
      const res = await axios.get(`${API_URL}/fields`, { headers: { Authorization: `Bearer ${token}` } });
      setPitches(res.data.content || res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sân:", error);
    } finally {
      setIsLoadingPitches(false);
    }
  };

  const fetchBookings = async () => {
    setIsLoadingBookings(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return navigate('/login');
      const res = await axios.get(`${API_URL}/bookings`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data.content || res.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn:", error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleViewPitchDetails = async (id: string) => {
    try {
      const res = await axios.get(`${API_URL}/fields/${id}`);
      setSelectedPitch(res.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin chi tiết sân:', error);
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Thất bại',
        message: 'Không thể tải thông tin sân',
        onConfirm: closePopup
      });
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
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Thất bại',
        message: 'Không thể tải thông tin sân',
        onConfirm: closePopup
      });
    }
  };

  const handleDeletePitch = (id: string) => {
    setPopupInfo({
      isOpen: true,
      type: 'warning',
      title: 'Xác nhận xóa sân',
      message: 'Bạn có chắc chắn muốn xóa sân này không? (Lưu ý: Không thể hoàn tác)',
      showCancel: true,
      onConfirm: async () => {
        closePopup();
        try {
          const token = localStorage.getItem('accessToken');
          await axios.delete(`${API_URL}/fields/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setPopupInfo({
            isOpen: true,
            type: 'success',
            title: 'Thành công',
            message: 'Đã xóa sân thành công!',
            onConfirm: closePopup,
            showCancel: false
          });
          fetchPitches();
        } catch (error) {
          console.error("Lỗi xóa sân:", error);
          setPopupInfo({
            isOpen: true,
            type: 'error',
            title: 'Thất bại',
            message: 'Xóa sân thất bại. Có thể sân này đang có đơn đặt.',
            onConfirm: closePopup,
            showCancel: false
          });
        }
      }
    });
  };

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

      if (editingPitch && editingPitch.id) {
        await axios.put(`${API_URL}/fields/${editingPitch.id}`, fieldPayload, config);
        savedFieldId = editingPitch.id;
      } else {
        const res = await axios.post(`${API_URL}/fields`, fieldPayload, config);
        savedFieldId = res.data.id;
      }

      if (deletedSlotIds && deletedSlotIds.length > 0) {
        for (const slotId of deletedSlotIds) {
          await axios.delete(`${API_URL}/fields/${savedFieldId}/time-slots/${slotId}`, config);
        }
      }

      if (pitchData.timeSlots && pitchData.timeSlots.length > 0) {
        for (const slot of pitchData.timeSlots) {
          const slotPayload = {
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
      setPopupInfo({
        isOpen: true,
        type: 'success',
        title: 'Thành công',
        message: 'Lưu sân thành công!',
        onConfirm: closePopup
      });
    } catch (error: any) {
      console.error('Lỗi lưu sân:', error);
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Thất bại',
        message: error.response?.data?.message || error.response?.data || 'Lỗi khi lưu sân. Vui lòng thử lại.',
        onConfirm: closePopup
      });
    }
  };

  const handleCheckIn = (bookingId: string) => {
    setPopupInfo({
      isOpen: true,
      type: 'warning',
      title: 'Xác nhận Check-in',
      message: 'Xác nhận khách đã đến nhận sân?',
      showCancel: true,
      onConfirm: async () => {
        closePopup();
        try {
          const token = localStorage.getItem('accessToken');
          await axios.put(`${API_URL}/bookings/${bookingId}/check-in`, {}, { headers: { Authorization: `Bearer ${token}` } });
          setPopupInfo({
            isOpen: true,
            type: 'success',
            title: 'Thành công',
            message: 'Check-in thành công! Khách đã nhận sân.',
            onConfirm: closePopup,
            showCancel: false
          });
          fetchBookings();
        } catch (error: any) {
          setPopupInfo({
            isOpen: true,
            type: 'error',
            title: 'Thất bại',
            message: error.response?.data || 'Lỗi khi Check-in',
            onConfirm: closePopup,
            showCancel: false
          });
        }
      }
    });
  };

  const handleNoShow = (bookingId: string) => {
    setPopupInfo({
      isOpen: true,
      type: 'warning',
      title: 'Tịch thu cọc',
      message: 'Đánh dấu khách KHÔNG ĐẾN và tịch thu cọc? Hành động này sẽ nhả lại sân trống.',
      showCancel: true,
      onConfirm: async () => {
        closePopup();
        try {
          const token = localStorage.getItem('accessToken');
          await axios.put(`${API_URL}/bookings/${bookingId}/no-show`, {}, { headers: { Authorization: `Bearer ${token}` } });
          setPopupInfo({
            isOpen: true,
            type: 'success',
            title: 'Thành công',
            message: 'Đã tịch thu cọc thành công!',
            onConfirm: closePopup,
            showCancel: false
          });
          fetchBookings();
        } catch (error: any) {
          setPopupInfo({
            isOpen: true,
            type: 'error',
            title: 'Thất bại',
            message: error.response?.data || 'Lỗi khi Hủy đơn',
            onConfirm: closePopup,
            showCancel: false
          });
        }
      }
    });
  };

  const handleCheckOut = (bookingId: string) => {
    setPopupInfo({
      isOpen: true,
      type: 'warning',
      title: 'Xác nhận Check-out',
      message: 'Xác nhận thu nốt tiền mặt và Hoàn tất đơn này?',
      showCancel: true,
      onConfirm: async () => {
        closePopup();
        try {
          const token = localStorage.getItem('accessToken');
          await axios.post(`${API_URL}/bookings/${bookingId}/check-out?method=CASH`, {}, { headers: { Authorization: `Bearer ${token}` } });
          setPopupInfo({
            isOpen: true,
            type: 'success',
            title: 'Thành công',
            message: 'Đã Check-out và thu đủ tiền thành công!',
            onConfirm: closePopup,
            showCancel: false
          });
          fetchBookings();
        } catch (error: any) {
          setPopupInfo({
            isOpen: true,
            type: 'error',
            title: 'Thất bại',
            message: error.response?.data || 'Lỗi khi Check-out',
            onConfirm: closePopup,
            showCancel: false
          });
        }
      }
    });
  };

  const translateFieldType = (type: string) => {
    switch(type) {
      case 'FIVE_A_SIDE': return 'Sân 5 người';
      case 'SEVEN_A_SIDE': return 'Sân 7 người';
      case 'ELEVEN_A_SIDE': return 'Sân 11 người';
      default: return type;
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
        {activeTab === 'overview' && <OverviewTab bookings={bookings} isLoading={isLoadingBookings} />}
        
        {activeTab === 'pitches' && (
          <PitchesTab 
            pitches={pitches} 
            isLoadingPitches={isLoadingPitches} 
            handleOpenAddModal={handleOpenAddModal} 
            handleViewPitchDetails={handleViewPitchDetails} 
            handleOpenEditModal={handleOpenEditModal} 
            handleDeletePitch={handleDeletePitch} 
            translateFieldType={translateFieldType} 
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab 
            bookings={bookings} 
            pitches={pitches} 
            isLoadingBookings={isLoadingBookings} 
            handleCheckIn={handleCheckIn} 
            handleNoShow={handleNoShow} 
            handleCheckOut={handleCheckOut} 
          />
        )}
      </div>

      <PitchFormModal 
        isOpen={isPitchModalOpen} 
        onClose={() => setIsPitchModalOpen(false)} 
        onSave={handleSavePitch} 
        initialData={editingPitch} 
      />

      {isDetailModalOpen && selectedPitch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl p-6 md:p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Chi tiết sân: {selectedPitch.name}</h3>
              <button onClick={() => setIsDetailModalOpen(false)} className="text-gray-400 hover:text-gray-800 transition bg-gray-100 hover:bg-gray-200 p-2 rounded-full">
                <FaTimes className="text-xl" />
              </button>
            </div>
            
            <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl">
              <p className="text-blue-800"><span className="font-bold">Phân loại sân:</span> {translateFieldType(selectedPitch.type)}</p>
            </div>

            <div>
              <h4 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
                <FaCalendarIcon className="text-blue-500" /> Trạng thái các ca đá
              </h4>
              
              {selectedPitch.timeSlots && selectedPitch.timeSlots.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedPitch.timeSlots.map((slot: any) => {
                    const startTime = new Date(slot.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    const endTime = new Date(slot.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                    const isBooked = slot.status !== 'AVAILABLE';
                    
                    return (
                      <div key={slot.id} className={`p-4 rounded-xl border-2 transition ${isBooked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-extrabold text-gray-800 text-lg">{startTime} - {endTime}</span>
                          <span className={`text-xs font-bold px-3 py-1 rounded-full ${isBooked ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                            {isBooked ? 'Đã được đặt' : 'Đang trống'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-600 mt-2">Giá thuê: <span className="text-blue-600 font-bold">{slot.price ? Number(slot.price).toLocaleString('vi-VN') : 0}đ</span></p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                  <p className="text-gray-500 font-medium">Chưa có ca đá nào được cấu hình cho sân này.</p>
                </div>
              )}
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button variant="secondary" className="px-6" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
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

export default OwnerDashboard;