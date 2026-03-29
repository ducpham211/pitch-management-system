import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import Button from '../common/Button';

type PitchData = {
  id?: number;
  name: string;
  type: string;
  status: string;
  price: string;
};

type PitchFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PitchData) => void;
  initialData?: PitchData | null;
};

const PitchFormModal = ({ isOpen, onClose, onSubmit, initialData }: PitchFormModalProps) => {
  const [formData, setFormData] = useState<PitchData>({
    name: '',
    type: 'Sân 5 người',
    status: 'Hoạt động',
    price: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', type: 'Sân 5 người', status: 'Hoạt động', price: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-800">
            {initialData ? 'Cập Nhật Sân' : 'Thêm Sân Mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên sân</label>
            <input required type="text" placeholder="VD: Sân Bóng Chảo Lửa 3" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Loại sân</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                <option value="Sân 5 người">Sân 5 người</option>
                <option value="Sân 7 người">Sân 7 người</option>
                <option value="Sân 11 người">Sân 11 người</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Hoạt động">Hoạt động</option>
                <option value="Bảo trì">Bảo trì</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khung giá (VNĐ/Giờ)</label>
            <input required type="text" placeholder="VD: 150k - 300k" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="w-full" onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="primary" className="w-full !bg-blue-600 hover:!bg-blue-700">Lưu Thông Tin</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PitchFormModal;