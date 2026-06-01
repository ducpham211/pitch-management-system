interface OverviewTabProps {
  bookings: any[];
  isLoading: boolean;
}

const OverviewTab = ({ bookings = [], isLoading }: OverviewTabProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Calculate real-time stats
  const totalRevenue = bookings.reduce((sum, b) => {
    if (b.status === 'COMPLETED') {
      return sum + (b.totalAmount || 0);
    } else if (b.status === 'DEPOSIT_PAID' || b.status === 'CONFIRMED' || b.status === 'CANCELLED') {
      return sum + (b.depositAmount || 0);
    }
    return sum;
  }, 0);

  const completedMatches = bookings.filter(b => b.status === 'COMPLETED').length;
  const pendingDeposits = bookings.filter(b => b.status === 'PENDING').length;
  const totalBookings = bookings.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Báo cáo doanh thu</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
          <p className="text-sm text-gray-500 font-medium">Tổng doanh thu</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{totalRevenue.toLocaleString('vi-VN')}đ</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
          <p className="text-sm text-gray-500 font-medium">Đơn hoàn thành</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{completedMatches}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-orange-500">
          <p className="text-sm text-gray-500 font-medium">Chờ duyệt cọc</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{pendingDeposits}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
          <p className="text-sm text-gray-500 font-medium">Tổng lượt đặt</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{totalBookings}</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;