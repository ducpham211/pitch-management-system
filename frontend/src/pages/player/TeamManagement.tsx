import { useState, useEffect } from 'react';
import { FaPlus, FaTrophy, FaEdit, FaTrash, FaStar, FaShieldAlt } from 'react-icons/fa';
import Button from '../../components/common/Button';
import { teamApi, type TeamCreateRequest } from '../../api/teamApi';

const TeamManagement = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any | null>(null);

  const [formData, setFormData] = useState<TeamCreateRequest>({
    name: '',
    description: '',
    level: 'BEGINNER'
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setIsLoading(true);
    try {
      const res = await teamApi.getMyTeams();
      setTeams(res.data);
    } catch (error) {
      console.error('Lỗi lấy danh sách đội', error);
    } finally {
      setIsLoading(false);
    }
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
        alert('Cập nhật đội thành công!');
      } else {
        await teamApi.createTeam(formData);
        alert('Tạo đội mới thành công!');
      }
      setIsModalOpen(false);
      fetchTeams();
    } catch (error: any) {
      alert(error.response?.data || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn giải tán đội "${name}" không? Hành động này không thể hoàn tác.`)) {
      try {
        await teamApi.deleteTeam(id);
        alert('Giải tán đội thành công!');
        fetchTeams();
      } catch (error: any) {
        alert('Có lỗi khi xóa đội');
      }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Đội Bóng Của Tôi</h1>
          <p className="text-gray-500 mt-2 font-medium">Bảng điều khiển quản lý các đội mà bạn làm đội trưởng.</p>
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
          <p className="text-gray-500 mb-6">Bạn chưa làm đội trưởng của đội nào. Hãy tạo một đội để bắt đầu giao lưu!</p>
          <Button variant="secondary" onClick={() => handleOpenModal()}>Tiến hành Tạo Đội</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <FaStar className="text-yellow-400" /> Vai trò: Đội Trưởng
                  </span>
                  <div className="flex gap-2 relative z-10">
                    <button onClick={() => handleOpenModal(team)} className="p-2 text-blue-500 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-all duration-200">
                      <FaEdit />
                    </button>
                    <button onClick={() => handleDelete(team.id, team.name)} className="p-2 text-red-500 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Thêm/Sửa */}
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
    </div>
  );
};

export default TeamManagement;
