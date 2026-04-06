import { useState } from 'react';
import { FaPlus, FaCheck, FaTimes, FaMoneyBillWave, FaFilter } from 'react-icons/fa';
import Button from '../common/Button';

interface BookingsTabProps {
  bookings: any[];
  pitches: any[];
  isLoadingBookings: boolean;
  handleCheckIn: (id: string) => void;
  handleNoShow: (id: string) => void;
  handleCheckOut: (id: string) => void;
}

const BookingsTab = ({ bookings, pitches, isLoadingBookings, handleCheckIn, handleNoShow, handleCheckOut }: BookingsTabProps) => {
  const [selectedDate, setSelectedDate] = useState<string>('');

  const getBookingStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">Chờ thanh toán</span>;
      case 'DEPOSIT_PAID': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Đã nhận cọc</span>;
      case 'COMPLETED': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Hoàn thành</span>;
      case 'CANCELLED': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Bùng kèo / Hủy</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const filteredBookings = bookings.filter((bk) => {
    if (!selectedDate) return true;
    return bk.bookingDate === selectedDate;
  });

  return (
    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Quản lý Đơn đặt sân</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-200 w-full sm:w-auto">
            <FaFilter className="text-gray-400" />
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">Chọn ngày:</span>
            <input 
              type="date" 
              className="bg-transparent border-none outline-none text-sm font-medium text-gray-800 w-full"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {selectedDate && (
              <button onClick={() => setSelectedDate('')} className="text-xs text-red-500 hover:text-red-700 ml-2 font-medium whitespace-nowrap">Xóa lọc</button>
            )}
          </div>
          <Button variant="secondary" className="flex items-center gap-2 border border-gray-300 w-full sm:w-auto justify-center"><FaPlus /> Khách vãng lai</Button>
        </div>
      </div>
      
      {isLoadingBookings ? (
        <div className="text-center py-10 text-gray-500">Đang tải danh sách đơn...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
          {selectedDate ? `Không có đơn đặt sân nào cho ngày ${selectedDate}.` : 'Chưa có đơn đặt sân nào.'}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((bk) => {
            const pitchName = pitches.find(p => p.id === bk.fieldId)?.name || bk.fieldId || 'Không xác định';
            const bookingIdToDisplay = bk.id || bk.bookingId || 'N/A';
            const total = bk.totalAmount || 0;
            const deposit = bk.depositAmount || 0;
            const remaining = total - deposit;
            
            return (
            <div key={bookingIdToDisplay} className="p-5 border border-gray-100 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-sm transition gap-4">
              <div className="w-full md:w-auto">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-gray-500">#{bookingIdToDisplay.substring(0,8)}</span>
                  {getBookingStatusBadge(bk.status)}
                </div>
                <h3 className="font-bold text-gray-800 text-lg">Khách ID: {bk.userId ? bk.userId.substring(0,8) : 'Khách'}</h3>
                
                <div className="mt-3 bg-gray-50 p-3 rounded-lg text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                  <p><span className="font-semibold text-gray-500">Sân bóng:</span> <span className="font-medium">{pitchName}</span></p>
                  <p><span className="font-semibold text-gray-500">Ngày đặt:</span> <span className="font-medium">{bk.bookingDate || 'Chưa cập nhật'}</span></p>
                  <p><span className="font-semibold text-gray-500">Ca đá ID:</span> <span className="font-medium text-blue-600">{bk.timeSlotId ? bk.timeSlotId.substring(0,8) : 'N/A'}</span></p>
                  <p><span className="font-semibold text-gray-500">Ghi chú:</span> <span className="font-medium">{bk.note || 'Không có'}</span></p>
                </div>
              </div>
              
              <div className="flex flex-col items-end w-full md:w-auto mt-4 md:mt-0">
                <div className="text-right mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100 w-full md:w-auto">
                   <p className="text-sm text-gray-600">Tổng tiền: <span className="font-bold text-gray-800 text-base">{total.toLocaleString('vi-VN')}đ</span></p>
                   <p className="text-sm text-gray-600 mt-1">Đã cọc: <span className="font-bold text-green-600 text-base">{deposit.toLocaleString('vi-VN')}đ</span></p>
                   {remaining > 0 && bk.status === 'DEPOSIT_PAID' && (
                     <p className="text-sm text-gray-600 mt-1 pt-1 border-t border-blue-200">
                       Cần thu nốt: <span className="font-bold text-red-600 text-lg">{remaining.toLocaleString('vi-VN')}đ</span>
                     </p>
                   )}
                </div>

                {bk.status === 'DEPOSIT_PAID' && (
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <Button variant="secondary" className="!bg-blue-600 text-white w-full px-4 py-2 flex items-center justify-center gap-2 text-sm" onClick={() => handleCheckOut(bookingIdToDisplay)}>
                      <FaMoneyBillWave /> Thu nốt tiền (Check-out)
                    </Button>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button variant="primary" className="!bg-green-600 flex-1 md:flex-none px-4 py-2 flex items-center justify-center gap-2 text-sm" onClick={() => handleCheckIn(bookingIdToDisplay)}>
                        <FaCheck /> Nhận Sân
                      </Button>
                      <Button variant="danger" className="flex-1 md:flex-none px-4 py-2 flex items-center justify-center gap-2 text-sm" onClick={() => handleNoShow(bookingIdToDisplay)}>
                        <FaTimes /> Bùng Kèo
                      </Button>
                    </div>
                  </div>
                )}

                {bk.status === 'COMPLETED' && (
                  <div className="text-green-600 flex flex-col items-end">
                    <FaCheck className="text-3xl mb-1" />
                    <span className="font-bold text-sm">Đã Hoàn Thành</span>
                  </div>
                )}

                {bk.status === 'CANCELLED' && (
                  <div className="text-red-600 flex flex-col items-end">
                    <FaTimes className="text-3xl mb-1" />
                    <span className="font-bold text-sm">Đã Hủy Cọc</span>
                  </div>
                )}

              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
};

export default BookingsTab;