import { useState, useEffect } from 'react';
import { FaUsers, FaGavel, FaBan, FaFilter, FaStar, FaImage } from 'react-icons/fa';
import Button from '../../components/common/Button';
import { adminApi } from '../../api/adminApi';
import axios from 'axios';
import PopupMessage from '../../components/common/PopupMessage';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'reviews'>('users');
  const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
  
  // States cho Users
  const [users, setUsers] = useState<any[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [minTrustScore, setMinTrustScore] = useState('');
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userPage, setUserPage] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);

  // States cho Fairplay Reviews
  const [fairplayReviews, setFairplayReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);

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
      const usersData = res.data?.content || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setUsers(usersData);
      setUserTotalPages(res.data.totalPages || 1);
    } catch (error) {
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchFairplayReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await axios.get(`${API_URL}/admin/fairplay/pending`, { headers: { Authorization: `Bearer ${token}` } });
      
      let reviewData = [];
      if (Array.isArray(res.data)) {
        reviewData = res.data;
      } else if (res.data && Array.isArray(res.data.content)) {
        reviewData = res.data.content;
      } else if (res.data && Array.isArray(res.data.data)) {
        reviewData = res.data.data;
      }
      
      setFairplayReviews(reviewData);
    } catch (error) {
      setFairplayReviews([]); 
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else {
      fetchFairplayReviews();
    }
  }, [activeTab, roleFilter, minTrustScore, userPage]);

  const getSuggestedPenalty = (ratingType: string) => {
    if (ratingType === 'GOOD') return 5;
    if (ratingType === 'NO_SHOW') return -10;
    if (ratingType === 'BAD_BEHAVIOR') return -15;
    return 0;
  };

  const getRatingLabel = (ratingType: string) => {
    if (ratingType === 'GOOD') return 'Cộng điểm (Chơi đẹp)';
    if (ratingType === 'NO_SHOW') return 'Trừ điểm (Bùng kèo)';
    if (ratingType === 'BAD_BEHAVIOR') return 'Trừ điểm (Chơi bạo lực/Gây rối)';
    return ratingType;
  };

  const handleAdjudicate = async (approve: boolean) => {
    if (!adjudicateModal.review) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const defaultPoints = getSuggestedPenalty(adjudicateModal.review.ratingType);
      const pointsToApply = customPenalty !== '' ? Number(customPenalty) : defaultPoints;

      await axios.put(`${API_URL}/admin/fairplay/resolve/${adjudicateModal.review.id}`, {
        isAccepted: approve,
        pointsApplied: pointsToApply
      }, { headers: { Authorization: `Bearer ${token}` } });

      let successMessage = '';
      if (approve) {
        successMessage = pointsToApply > 0 
          ? `Đã xác nhận! Người chơi được cộng ${pointsToApply} Uy Tín.` 
          : `Đã thi hành án! Bị cáo bị trừ ${Math.abs(pointsToApply)} Uy Tín.`;
      } else {
        successMessage = defaultPoints > 0 
          ? 'Đã bác bỏ yêu cầu cộng điểm!' 
          : 'Đã tha bổng cho người này!';
      }

      setPopupInfo({ isOpen: true, type: 'success', title: 'Thành công', message: successMessage, onConfirm: closePopup });
      setAdjudicateModal({isOpen: false, review: null});
      setCustomPenalty('');
      fetchFairplayReviews(); 
    } catch (error: any) {
      setPopupInfo({ isOpen: true, type: 'error', title: 'Thất bại', message: 'Lỗi xử lý: ' + (error.response?.data?.message || error.message || 'Không rõ nguyên nhân'), onConfirm: closePopup });
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeReviewsArray = Array.isArray(fairplayReviews) ? fairplayReviews : [];
  const safeUsersArray = Array.isArray(users) ? users : [];

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
                ) : safeUsersArray.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-gray-400">Không tìm thấy người dùng nào.</td></tr>
                ) : (
                  safeUsersArray.map((user) => (
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
                        <div className={`flex items-center gap-1 font-bold px-3 py-1 rounded-lg w-fit border ${(user.trustScore ?? 100) < 60 ? 'text-red-600 bg-red-50 border-red-200' : 'text-yellow-600 bg-yellow-50 border-yellow-200'}`}>
                          <FaStar className={(user.trustScore ?? 100) < 60 ? 'text-red-500' : 'text-yellow-500'} /> {user.trustScore ?? 100}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-sm text-gray-500">Trang {userPage + 1} / {userTotalPages}</span>
            <div className="flex gap-2">
              <Button variant="secondary" className="py-1.5 px-3 text-sm hover:bg-gray-100 disabled:opacity-50" onClick={() => setUserPage(curr => Math.max(0, curr - 1))} disabled={userPage === 0}>Trước</Button>
              <Button variant="secondary" className="py-1.5 px-3 text-sm hover:bg-gray-100 disabled:opacity-50" onClick={() => setUserPage(curr => Math.min(userTotalPages - 1, curr + 1))} disabled={userPage >= userTotalPages - 1}>Sau</Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 animate-fade-in-up">
          <div className="mb-6 border-b border-gray-100 pb-4">
             <h2 className="text-lg font-bold text-gray-800">Đơn Yêu Cầu Xử Lý</h2>
             <p className="text-sm text-gray-500">Hệ thống ghi nhận các đơn tố cáo vi phạm hoặc đề xuất tuyên dương người chơi.</p>
          </div>

          <div className="space-y-4">
            {isLoadingReviews ? (
               <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl">Đang tải hồ sơ...</div>
            ) : safeReviewsArray.length === 0 ? (
               <div className="p-8 text-center text-gray-400 border border-dashed rounded-xl bg-gray-50">Tất cả người chơi đều trong sạch. Không có báo cáo nào chờ duyệt.</div>
            ) : (
              safeReviewsArray.map((review) => {
                const isPositive = getSuggestedPenalty(review.ratingType) > 0;

                return (
                  <div key={review.id} className={`p-5 rounded-xl border transition hover:shadow-md flex flex-col md:flex-row justify-between gap-4 ${isPositive ? 'border-green-200 bg-green-50/30' : 'border-red-200 bg-red-50/30'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">MÃ ĐƠN: {truncateId(review.id)}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>ĐANG CHỜ XỬ LÝ</span>
                      </div>
                      <p className="text-sm text-gray-500 mb-1">Trận đấu: <span className="font-mono">{truncateId(review.matchId)}</span></p>
                      <p className="text-sm text-gray-500 mb-1">Người gửi: <span className="font-mono">{truncateId(review.reviewerId)}</span></p>
                      <p className="text-sm text-gray-500 mb-1">Bị cáo/Người được tuyên dương: <span className="font-mono font-bold text-gray-800">{truncateId(review.revieweeId)}</span></p>
                      
                      <div className="bg-white p-3 border border-gray-200 rounded-lg my-3 shadow-sm">
                        <p className="text-sm text-gray-800"><strong className="text-gray-500">Lời khai / Bình luận:</strong> "{review.comment || 'Không có bình luận cụ thể'}"</p>
                        
                        {review.imageUrl && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <span className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-2"><FaImage /> ẢNH MINH CHỨNG:</span>
                            <a href={review.imageUrl} target="_blank" rel="noreferrer" className="block max-w-[200px] overflow-hidden rounded-lg border border-gray-200 hover:opacity-80 transition cursor-zoom-in">
                              <img src={review.imageUrl} alt="Minh chứng" className="w-full h-auto object-cover" />
                            </a>
                          </div>
                        )}
                      </div>

                      <p className={`text-xs p-2 rounded border inline-block ${isPositive ? 'text-green-600 bg-green-50 border-green-100' : 'text-red-600 bg-red-50 border-red-100'}`}>
                        <strong>Phân loại:</strong> {getRatingLabel(review.ratingType)}
                      </p>
                    </div>
                    
                    <div className="flex flex-col justify-center items-end min-w-[200px] border-l border-gray-200 pl-4">
                      <p className="text-sm text-gray-500 text-right w-full mb-1">Mức điểm đề xuất</p>
                      <p className={`text-3xl font-bold mb-4 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{getSuggestedPenalty(review.ratingType)}
                      </p>
                      
                      <Button variant="primary" className={`w-full shadow-sm ${isPositive ? '!bg-green-600 hover:!bg-green-700' : '!bg-red-600 hover:!bg-red-700'}`} onClick={() => setAdjudicateModal({isOpen: true, review})}>
                        Mở Hồ Sơ Xử Lý
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {adjudicateModal.isOpen && adjudicateModal.review && (() => {
        const isPositive = getSuggestedPenalty(adjudicateModal.review.ratingType) > 0;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-fade-in-up my-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-2 border-b pb-2">Hồ Sơ Xử Lý</h3>
              <p className="text-sm text-gray-600 mb-4">Mã hồ sơ: <span className="font-mono font-bold">{truncateId(adjudicateModal.review.id)}</span>.</p>
              
              {adjudicateModal.review.imageUrl && (
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-500 block mb-1">ẢNH MINH CHỨNG:</span>
                  <a href={adjudicateModal.review.imageUrl} target="_blank" rel="noreferrer">
                    <img src={adjudicateModal.review.imageUrl} className="w-full max-h-48 object-cover rounded-lg border border-gray-200 cursor-zoom-in" alt="Minh chứng" />
                  </a>
                </div>
              )}

              <div className={`border p-4 rounded-xl mb-4 ${isPositive ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <p className={`text-sm font-bold mb-2 ${isPositive ? 'text-green-800' : 'text-red-800'}`}>Thông tin mức điểm quy định:</p>
                <p className={`text-sm mb-2 ${isPositive ? 'text-green-700' : 'text-red-700'}`}>Phân loại: {getRatingLabel(adjudicateModal.review.ratingType)}</p>
                <p className={`text-sm ${isPositive ? 'text-green-700' : 'text-red-700'}`}>Mức chuẩn: <strong>{isPositive ? 'Cộng' : 'Trừ'} {Math.abs(getSuggestedPenalty(adjudicateModal.review.ratingType))} điểm uy tín</strong></p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Thay đổi mức điểm? (Để trống nếu đồng ý mức chuẩn)</label>
                <input type="number" placeholder={`Nhập điểm (VD: ${getSuggestedPenalty(adjudicateModal.review.ratingType)})`} value={customPenalty} onChange={(e) => setCustomPenalty(e.target.value)} className={`w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 outline-none ${isPositive ? 'focus:ring-green-500' : 'focus:ring-red-500'}`} />
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" className="w-full border-gray-300 hover:bg-gray-100 text-gray-600" onClick={() => setAdjudicateModal({isOpen: false, review: null})} disabled={isSubmitting}>Hủy bỏ</Button>
                
                <Button variant="outline" className={`w-full ${isPositive ? 'border-red-500 text-red-600 hover:bg-red-50' : 'border-green-500 text-green-600 hover:bg-green-50'}`} onClick={() => handleAdjudicate(false)} disabled={isSubmitting}>
                  <FaBan className="inline mr-1"/> {isPositive ? 'Bác bỏ yêu cầu' : 'Tha bổng'}
                </Button>
                
                <Button variant="primary" className={`w-full flex justify-center items-center ${isPositive ? '!bg-green-600 hover:!bg-green-700' : '!bg-red-600 hover:!bg-red-700'}`} onClick={() => handleAdjudicate(true)} disabled={isSubmitting}>
                  {isSubmitting ? <span className="animate-spin mr-1">⌛</span> : <FaGavel className="inline mr-1"/>}
                  {isSubmitting ? 'Đang xử lý...' : (isPositive ? 'Cộng điểm' : 'Thi hành án')}
                </Button>
              </div>
            </div>
          </div>
        );
      })()}

      <PopupMessage isOpen={popupInfo.isOpen} onClose={closePopup} type={popupInfo.type} title={popupInfo.title} message={popupInfo.message} onConfirm={popupInfo.onConfirm} />
    </div>
  );
};

export default AdminDashboard;