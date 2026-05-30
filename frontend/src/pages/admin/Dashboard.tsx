import { useState, useEffect } from 'react';
import { FaUsers, FaGavel, FaCheck, FaBan, FaFilter, FaStar } from 'react-icons/fa';
import Button from '../../components/common/Button';
import { adminApi } from '../../api/adminApi';
import PopupMessage from '../../components/common/PopupMessage';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'reviews'>('users');
  
  // States cho Users
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [minTrustScore, setMinTrustScore] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // States cho Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStatus, setReviewStatus] = useState('PENDING_ADMIN_REVIEW');
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);

  // States cho Modal Xử lý Review
  const [adjudicateModal, setAdjudicateModal] = useState<{isOpen: boolean, review: any}>({isOpen: false, review: null});
  const [customPenalty, setCustomPenalty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const truncateId = (id: string) => id ? id.substring(0, 6).toUpperCase() : 'N/A';

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const params: any = { page: userPage, size: 10 };
      if (roleFilter) params.role = roleFilter;
      if (minTrustScore) params.minTrustScore = Number(minTrustScore);
      
      const res = await adminApi.getUsers(params);
      setUsers(res.data.content || []);
      setUserTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Lỗi tải người dùng', error);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const params: any = { page: reviewPage, size: 10 };
      if (reviewStatus) params.status = reviewStatus;

      const res = await adminApi.getReviews(params);
      setReviews(res.data.content || []);
      setReviewTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error('Lỗi tải đánh giá', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  // Chạy khi đổi Tab hoặc thay đổi Filter/Page
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchReviews();
    }
  }, [activeTab, roleFilter, minTrustScore, reviewStatus, userPage, reviewPage]);

  // Xử lý Phán quyết
  const handleAdjudicate = async (approve: boolean) => {
    if (!adjudicateModal.review) return;
    setIsSubmitting(true);
    try {
      const payload: any = { approve };
      // Nếu duyệt phạt và có nhập số thủ công thì gửi lên, không thì để BE tự lấy điểm của AI
      if (approve && customPenalty) {
        payload.finalPenalty = Number(customPenalty);
      }

      const res = await adminApi.adjudicateReview(adjudicateModal.review.id, payload);
      setPopupInfo({
        isOpen: true,
        type: 'success',
        title: 'Thành công',
        message: typeof res.data === 'string' ? res.data : 'Đã xử lý thành công!',
        onConfirm: closePopup
      });
      
      setAdjudicateModal({isOpen: false, review: null});
      setCustomPenalty('');
      fetchReviews(); // Tải lại danh sách
    } catch (error: any) {
      setPopupInfo({
        isOpen: true,
        type: 'error',
        title: 'Thất bại',
        message: 'Lỗi xử lý: ' + (error.response?.data?.message || 'Không rõ nguyên nhân'),
        onConfirm: closePopup
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quản Trị Hệ Thống</h1>
          <p className="text-gray-500 mt-1">Quản lý người dùng và xử lý vi phạm Fair-Play</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <FaUsers /> Người Dùng
          </button>
          <button onClick={() => setActiveTab('reviews')} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'reviews' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <FaGavel /> Tòa Án Fair-Play
          </button>
        </div>
      </div>

      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
          <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FaFilter className="text-gray-400" /> Bộ lọc:
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none bg-white">
              <option value="">Tất cả Vai trò</option>
              <option value="PLAYER">Người Chơi</option>
              <option value="OWNER">Chủ Sân</option>
              <option value="ADMIN">Quản Trị Viên</option>
            </select>
            <input type="number" placeholder="Điểm Uy Tín tối thiểu..." value={minTrustScore} onChange={(e) => setMinTrustScore(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none w-48" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 rounded-tl-xl">ID</th>
                  <th className="p-4">Họ và Tên</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Vai Trò</th>
                  <th className="p-4 rounded-tr-xl">Điểm Uy Tín (Trust)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingUsers ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Đang tải dữ liệu...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Không tìm thấy người dùng nào.</td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-mono text-xs text-gray-500">{truncateId(user.id)}</td>
                      <td className="p-4 font-bold text-gray-800">{user.fullName || 'Chưa cập nhật'}</td>
                      <td className="p-4 text-gray-600 text-sm">{user.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : user.role === 'OWNER' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-lg w-fit border border-yellow-200">
                          <FaStar className="text-yellow-500" /> {user.trustScore ?? 100}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* USER PAGINATION CONTROLS */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Trang {userPage + 1} / {userTotalPages}</span>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="py-1.5 px-3 text-sm hover:bg-gray-100 disabled:opacity-50" 
                onClick={() => setUserPage(curr => Math.max(0, curr - 1))}
                disabled={userPage === 0}
              >
                Trước
              </Button>
              <Button 
                variant="secondary" 
                className="py-1.5 px-3 text-sm hover:bg-gray-100 disabled:opacity-50" 
                onClick={() => setUserPage(curr => Math.min(userTotalPages - 1, curr + 1))}
                disabled={userPage >= userTotalPages - 1}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
           <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <FaFilter className="text-gray-400" /> Trạng thái:
            </div>
            <select value={reviewStatus} onChange={(e) => setReviewStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none bg-white">
              <option value="">Tất cả</option>
              <option value="PENDING_ADMIN_REVIEW">Đang Chờ Duyệt (Báo Động)</option>
              <option value="AUTO_PASSED">An Toàn (AI tự động duyệt)</option>
              <option value="PENALIZED">Đã Phạt</option>
            </select>
          </div>

          <div className="space-y-4">
            {isLoadingReviews ? (
               <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl">Đang tải hồ sơ vụ án...</div>
            ) : reviews.length === 0 ? (
               <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl bg-gray-50">Không có báo cáo nào ở trạng thái này.</div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className={`p-5 rounded-xl border ${review.status === 'PENDING_ADMIN_REVIEW' ? 'border-red-200 bg-red-50/30' : 'border-gray-200'} transition hover:shadow-md flex flex-col md:flex-row justify-between gap-4`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">MÃ VỤ: {truncateId(review.id)}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${review.status === 'PENDING_ADMIN_REVIEW' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{review.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">Mã đơn: <span className="font-mono">{truncateId(review.matchRequestId)}</span> • Kẻ bị tố cáo (Bị cáo): <span className="font-mono font-bold text-gray-800">{truncateId(review.revieweeId)}</span></p>
                    <div className="bg-white p-3 border border-gray-200 rounded-lg my-3">
                      <p className="text-sm text-gray-800"><strong className="text-gray-500">Lý do báo cáo:</strong> "{review.reason}"</p>
                    </div>
                    {review.aiAnalysis && (
                      <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-100"><strong className="text-red-800">AI Phân Tích:</strong> {review.aiAnalysis}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col justify-center items-end min-w-[200px] border-l border-gray-200 pl-4">
                    <p className="text-sm text-gray-500 text-right w-full mb-1">Điểm uy tín trừ dự kiến</p>
                    <p className="text-3xl font-bold text-red-600 mb-4">-{review.aiSuggestedPenalty || 0}</p>
                    
                    {review.status === 'PENDING_ADMIN_REVIEW' && (
                      <Button variant="primary" className="w-full shadow-sm !bg-red-600 hover:!bg-red-700" onClick={() => setAdjudicateModal({isOpen: true, review})}>
                        Mở Tòa Xử Lý
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* REVIEW PAGINATION CONTROLS */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Trang {reviewPage + 1} / {reviewTotalPages}</span>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="py-1.5 px-3 text-sm hover:bg-gray-100 disabled:opacity-50" 
                onClick={() => setReviewPage(curr => Math.max(0, curr - 1))}
                disabled={reviewPage === 0}
              >
                Trước
              </Button>
              <Button 
                variant="secondary" 
                className="py-1.5 px-3 text-sm hover:bg-gray-100 disabled:opacity-50" 
                onClick={() => setReviewPage(curr => Math.min(reviewTotalPages - 1, curr + 1))}
                disabled={reviewPage >= reviewTotalPages - 1}
              >
                Sau
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Mở Tòa Phán Quyết */}
      {adjudicateModal.isOpen && adjudicateModal.review && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in-up">
            <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Tòa Án Tối Cao</h3>
            <p className="text-sm text-gray-600 mb-4">Bạn đang xét xử vụ án <span className="font-mono font-bold">{truncateId(adjudicateModal.review.id)}</span>.</p>
            
            <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-4">
              <p className="text-sm text-red-800 font-bold mb-2">Trí tuệ nhân tạo (AI) đề xuất:</p>
              <p className="text-sm text-red-700 mb-2">Tội danh: {adjudicateModal.review.aiAnalysis}</p>
              <p className="text-sm text-red-700">Mức án: <strong>Trừ {adjudicateModal.review.aiSuggestedPenalty} điểm uy tín</strong></p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bạn muốn đổi mức phạt không? (Để trống nếu đồng ý với AI)</label>
              <input type="number" placeholder={`Nhập mức phạt (VD: ${adjudicateModal.review.aiSuggestedPenalty})`} value={customPenalty} onChange={(e) => setCustomPenalty(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none" />
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="w-full border-gray-300 hover:bg-gray-100 text-gray-600" onClick={() => setAdjudicateModal({isOpen: false, review: null})} disabled={isSubmitting}>Hủy bỏ</Button>
              <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50" onClick={() => handleAdjudicate(false)} disabled={isSubmitting}><FaBan className="inline mr-1"/> Tha bổng</Button>
              <Button variant="primary" className="w-full !bg-red-600 hover:!bg-red-700" onClick={() => handleAdjudicate(true)} disabled={isSubmitting}><FaGavel className="inline mr-1"/> Y Án Phạt</Button>
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
      />
    </div>
  );
};

export default AdminDashboard;