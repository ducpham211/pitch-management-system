import { OWNER_STATS } from '../../mocks/ownerData';

const OverviewTab = () => {
  return (
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
  );
};

export default OverviewTab;