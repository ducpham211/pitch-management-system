import { FaPlus, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import Button from '../common/Button';

interface PitchesTabProps {
  pitches: any[];
  isLoadingPitches: boolean;
  handleOpenAddModal: () => void;
  handleViewPitchDetails: (id: string) => void;
  handleOpenEditModal: (pitch: any) => void;
  handleDeletePitch: (id: string) => void;
  translateFieldType: (type: string) => string;
}

const PitchesTab = ({ pitches, isLoadingPitches, handleOpenAddModal, handleViewPitchDetails, handleOpenEditModal, handleDeletePitch, translateFieldType }: PitchesTabProps) => {
  return (
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
                      <button onClick={() => handleViewPitchDetails(pitch.id)} className="text-green-500 hover:text-green-700 transition" title="Xem chi tiết">
                        <FaEye className="text-lg" />
                      </button>
                      <button onClick={() => handleOpenEditModal(pitch)} className="text-blue-500 hover:text-blue-700 transition" title="Chỉnh sửa">
                        <FaEdit className="text-lg" />
                      </button>
                      <button onClick={() => handleDeletePitch(pitch.id)} className="text-red-400 hover:text-red-600 transition" title="Xóa">
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
  );
};

export default PitchesTab;