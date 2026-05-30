import { useState, useEffect } from 'react';
import { FaPlus, FaTrophy, FaEdit, FaTrash, FaStar, FaShieldAlt, FaUsers, FaEnvelope, FaCheck, FaTimes, FaClock } from 'react-icons/fa';
import Button from '../../components/common/Button';
import PopupMessage from '../../components/common/PopupMessage';
import { teamApi, type TeamCreateRequest } from '../../api/teamApi';

const TeamManagement = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);

  // Trạng thái cho Popup Message
  const [popup, setPopup] = useState<{ isOpen: boolean; type: 'success' | 'error' | 'info'; title: string; message: string; }>({ isOpen: false, type: 'success', title: '', message: '' });

  // Trạng thái cho Quản lý Thành viên
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any | null>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const [formData, setFormData] = useState<TeamCreateRequest>({
    name: '',
    description: '',
    level: 'BEGINNER'
  });

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

  useEffect(() => {
    fetchTeamsAndInvitations();
  }, []);

  const fetchTeamsAndInvitations = async () => {
    setIsLoading(true);
    try {
      const [teamsRes, invRes] = await Promise.all([
        teamApi.getMyTeams(),
        teamApi.getMyInvitations()
      ]);
      setTeams(teamsRes.data);
      setInvitations(invRes.data);
    } catch (error) {
      console.error('Lỗi lấy dữ liệu', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showPopup = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setPopup({ isOpen: true, type, title, message });
  };

  const handleOpenModal = (team?: any) => {
    if (team) {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        description: team.description,
        level: team.level
      });
    } else {
      setEditingTeam(null);
      setFormData({
        name: '',
        description: '',
        level: 'BEGINNER'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await teamApi.updateTeam(editingTeam.id, formData);
        showPopup('success', 'Thành công', 'Cập nhật đội thành công!');
      } else {
        await teamApi.createTeam(formData);
        showPopup('success', 'Thành công', 'Tạo đội mới thành công!');
      }
      setIsModalOpen(false);
      fetchTeamsAndInvitations();
    } catch (error: any) {
      showPopup('error', 'Thất bại', error.response?.data || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn giải tán đội "${name}" không? Hành động này không thể hoàn tác.`)) {
      try {
        await teamApi.deleteTeam(id);
        showPopup('success', 'Đã xóa', 'Giải tán đội thành công!');
        fetchTeamsAndInvitations();
      } catch (error: any) {
        showPopup('error', 'Lỗi', error.response?.data || 'Có lỗi khi xóa đội');
      }
    }
  };

  // --- MEMBER MANAGEMENT ---
  const handleOpenMemberModal = async (team: any) => {
    setSelectedTeam(team);
    setIsMemberModalOpen(true);
    fetchTeamMembers(team.id);
  };

  const fetchTeamMembers = async (teamId: string) => {
    setIsLoadingMembers(true);
    try {
      const res = await teamApi.getTeamMembers(teamId);
      setTeamMembers(res.data);
    } catch (error) {
      showPopup('error', 'Lỗi', 'Không thể tải danh sách thành viên');
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await teamApi.inviteMember(selectedTeam.id, inviteEmail);
      showPopup('success', 'Đã gửi lời mời', `Đã gửi lời mời đến email: ${inviteEmail}`);
      setInviteEmail('');
      fetchTeamMembers(selectedTeam.id);
    } catch (error: any) {
      showPopup('error', 'Lỗi', error.response?.data?.message || error.response?.data || 'Không thể mời thành viên này');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (window.confirm('Bạn có muốn xóa thành viên này khỏi đội không?')) {
      try {
        await teamApi.removeMember(selectedTeam.id, memberId);
        showPopup('success', 'Thành công', 'Đã xóa thành viên khỏi đội');
        fetchTeamMembers(selectedTeam.id);
      } catch (error) {
        showPopup('error', 'Lỗi', 'Có lỗi khi xóa thành viên');
      }
    }
  };

  const handleInvitationResponse = async (invitationId: string, accept: boolean) => {
    try {
      await teamApi.respondToInvitation(invitationId, accept);
      showPopup('success', 'Thành công', accept ? 'Bạn đã gia nhập đội!' : 'Đã từ chối lời mời');
      fetchTeamsAndInvitations();
    } catch (error) {
      showPopup('error', 'Lỗi', 'Có lỗi khi phản hồi lời mời');
    }
  };

  const translateLevel = (level: string) => {
    switch (level) {
      case 'BEGINNER': return { text: 'Phong trào', color: 'bg-green-100 text-green-700' };
      case 'INTERMEDIATE': return { text: 'Bán chuyên', color: 'bg-blue-100 text-blue-700' };
      case 'ADVANCED': return { text: 'Chuyên nghiệp', color: 'bg-purple-100 text-purple-700' };
      default: return { text: level, color: 'bg-gray-100 text-gray-700' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <PopupMessage 
        isOpen={popup.isOpen}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup({ ...popup, isOpen: false })}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Đội Bóng Của Tôi</h1>
          <p className="text-gray-500 mt-2 font-medium">Bảng điều khiển quản lý các đội mà bạn tham gia hoặc làm đội trưởng.</p>
        </div>
        <Button variant="primary" onClick={() => handleOpenModal()} className="bg-linear-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-200 flex items-center gap-2 transform hover:-translate-y-1 transition duration-300">
          <FaPlus /> Tạo Đội Mới
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-400 font-bold text-xl animate-pulse">Đang tải dữ liệu...</div>
      ) : teams.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="bg-gray-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
            <FaShieldAlt className="text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Chưa có đội bóng nào</h2>
          <p className="text-gray-500 mb-6">Bạn chưa tham gia hay làm đội trưởng của đội nào. Hãy tạo một đội để bắt đầu giao lưu!</p>
          <Button variant="secondary" onClick={() => handleOpenModal()}>Tiến hành Tạo Đội</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {teams.map(team => {
            const levelInfo = translateLevel(team.level);
            return (
              <div key={team.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-linear-to-br from-green-400 to-blue-500 text-white p-3 rounded-2xl shadow-inner">
                      <FaTrophy className="text-xl" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-800 group-hover:text-green-600 transition">{team.name}</h3>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full mt-1 inline-block ${levelInfo.color}`}>
                        {levelInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6 line-clamp-3 bg-gray-50 p-3 rounded-xl border border-gray-100/50 min-h-20">
                  {team.description || 'Chưa có mô tả chi tiết.'}
                </p>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    {team.isCaptain ? <><FaStar className="text-yellow-400" /> Vai trò: Đội Trưởng</> : <><FaUsers className="text-blue-400" /> Vai trò: Thành viên</>}
                  </span>
                  
                  {team.isCaptain && (
                    <div className="flex gap-2 relative z-10">
                      <button onClick={() => handleOpenMemberModal(team)} className="p-2 text-green-500 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl transition-all duration-200" title="Quản lý thành viên">
                        <FaUsers />
                      </button>
                      <button onClick={() => handleOpenModal(team)} className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-200" title="Chỉnh sửa đội">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(team.id, team.name)} className="p-2 text-red-500 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200" title="Giải tán đội">
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Box Lời Mời Vào Đội */}
      {invitations.length > 0 && (
        <div className="mt-12 bg-blue-50 p-6 rounded-3xl border border-blue-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaEnvelope className="text-blue-500" /> Lời mời tham gia đội
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitations.map(inv => (
              <div key={inv.id} className="bg-white rounded-2xl p-5 border border-blue-100 shadow-sm flex flex-col justify-between gap-4">
                <div>
                  <h4 className="font-bold text-lg text-gray-800">{inv.teamName}</h4>
                  <p className="text-sm text-gray-500 mt-1">Đội trưởng: <span className="font-medium text-gray-700">{inv.captainName}</span></p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleInvitationResponse(inv.id, true)} variant="primary" className="flex-1 py-2 px-2 bg-green-500! hover:bg-green-600! flex items-center justify-center gap-1 text-sm">
                    <FaCheck /> Tham gia
                  </Button>
                  <Button onClick={() => handleInvitationResponse(inv.id, false)} variant="secondary" className="flex-1 py-2 px-2 flex items-center justify-center gap-1 text-sm text-red-500 border-red-200 hover:bg-red-50">
                    <FaTimes /> Từ chối
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa Đội */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-md transform scale-100 transition-all">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">{editingTeam ? 'Cập Nhật Đội Bóng' : 'Tạo Đội Bóng Mới'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên đội bóng</label>
                <input 
                  type="text" required 
                  className="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="FC Sinh Viên..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Trình độ kỹ năng</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none"
                  value={formData.level} onChange={(e) => setFormData({...formData, level: e.target.value})}
                >
                  <option value="BEGINNER">Phong trào (Nghiệp dư)</option>
                  <option value="INTERMEDIATE">Bán chuyên</option>
                  <option value="ADVANCED">Chuyên nghiệp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Giới thiệu đội</label>
                <textarea 
                  rows={4} 
                  className="w-full px-4 py-3 rounded-xl border-gray-200 bg-gray-50 focus:bg-white focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all outline-none resize-none"
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Ghi rõ thời gian sinh hoạt, nội quy..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" variant="secondary" className="flex-1 py-3" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
                <Button type="submit" variant="primary" className="flex-1 py-3 bg-green-600! hover:bg-green-700!">{editingTeam ? 'Lưu Thay Đổi' : 'Xác Nhận Tạo'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quản Lý Thành Viên */}
      {isMemberModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FaUsers className="text-blue-500" /> Thành viên đội {selectedTeam.name}
              </h3>
              <button onClick={() => setIsMemberModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <FaTimes className="text-xl" />
              </button>
            </div>

            {/* Khung Mời Thành Viên */}
            <form onSubmit={handleInvite} className="flex gap-2 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <input 
                type="email" required 
                placeholder="Nhập email người dùng..."
                className="flex-1 px-4 py-2 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm"
                value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              />
              <Button type="submit" variant="primary" className="bg-blue-600! hover:bg-blue-700! px-4 py-2 text-sm whitespace-nowrap">
                Gửi lời mời
              </Button>
            </form>

            {/* Danh sách thành viên */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {isLoadingMembers ? (
                <div className="text-center text-sm text-gray-400 py-4">Đang tải danh sách...</div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center text-sm text-gray-400 py-4">Chưa có thành viên nào.</div>
              ) : (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition">
                    <div>
                      <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
                        {member.userName} 
                        {member.status === 'PENDING' && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full flex items-center gap-1"><FaClock /> Chờ xác nhận</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{member.userEmail}</p>
                    </div>
                    
                    {member.userId === selectedTeam.captainId ? (
                      <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">Đội Trưởng</span>
                    ) : (
                      <button onClick={() => handleRemoveMember(member.id)} className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg transition" title="Xóa thành viên">
                        <FaTrash className="text-sm" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;