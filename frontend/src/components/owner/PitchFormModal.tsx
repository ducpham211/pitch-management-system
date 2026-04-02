import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import Button from '../common/Button';

export interface TimeSlotData {
  id?: string;
  startTime: string;
  endTime: string;
  price: number | string;
  status?: string;
}

export interface PitchFormData {
  id?: string;
  name: string;
  type: string;
  coverImage: string;
  timeSlots: TimeSlotData[];
}

interface PitchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PitchFormData, deletedSlotIds: string[]) => void;
  initialData?: any;
}

const PitchFormModal: React.FC<PitchFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<PitchFormData>({
    name: '',
    type: 'FIVE_A_SIDE',
    coverImage: '',
    timeSlots: []
  });
  const [deletedSlotIds, setDeletedSlotIds] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        type: initialData.type || 'FIVE_A_SIDE',
        coverImage: initialData.coverImage || '',
        timeSlots: initialData.timeSlots ? initialData.timeSlots.map((ts: any) => ({
          ...ts,
          // Cắt lấy đúng HH:mm từ chuỗi YYYY-MM-DDTHH:mm:ss của Backend
          startTime: ts.startTime ? ts.startTime.substring(11, 16) : '',
          endTime: ts.endTime ? ts.endTime.substring(11, 16) : '',
        })) : []
      });
      setDeletedSlotIds([]);
    } else {
      setFormData({
        name: '',
        type: 'FIVE_A_SIDE',
        coverImage: '',
        timeSlots: []
      });
      setDeletedSlotIds([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddTimeSlot = () => {
    setFormData({
      ...formData,
      timeSlots: [
        ...formData.timeSlots,
        { startTime: '', endTime: '', price: 0, status: 'AVAILABLE' }
      ]
    });
  };

  const handleTimeSlotChange = (index: number, field: keyof TimeSlotData, value: string | number) => {
    const updatedTimeSlots = [...formData.timeSlots];
    updatedTimeSlots[index] = { ...updatedTimeSlots[index], [field]: value };
    setFormData({ ...formData, timeSlots: updatedTimeSlots });
  };

  const handleRemoveTimeSlot = (index: number) => {
    const slotToRemove = formData.timeSlots[index];
    if (slotToRemove.id) {
      setDeletedSlotIds([...deletedSlotIds, slotToRemove.id]);
    }
    const updatedTimeSlots = formData.timeSlots.filter((_, i) => i !== index);
    setFormData({ ...formData, timeSlots: updatedTimeSlots });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, deletedSlotIds);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-gray-200 pointer-events-auto flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50 shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Chỉnh Sửa Sân' : 'Thêm Sân Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition">
            <FaTimes size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên sân</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="VD: Sân Bóng Chảo Lửa 3" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại sân</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="FIVE_A_SIDE">Sân 5 người</option>
                  <option value="SEVEN_A_SIDE">Sân 7 người</option>
                  <option value="ELEVEN_A_SIDE">Sân 11 người</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link ảnh (Không bắt buộc)</label>
                <input type="text" name="coverImage" value={formData.coverImage} onChange={handleChange} placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Cấu hình Ca đá (Khung giờ)</h3>
                <Button type="button" variant="outline" onClick={handleAddTimeSlot} className="text-sm py-1.5 px-3 flex items-center gap-2">
                  <FaPlus /> Thêm ca
                </Button>
              </div>
              
              {formData.timeSlots.length === 0 ? (
                <p className="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">Chưa có ca đá nào. Hãy thêm ca để khách có thể đặt sân.</p>
              ) : (
                <div className="space-y-3">
                  {formData.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Bắt đầu</label>
                        <input type="time" value={slot.startTime} onChange={(e) => handleTimeSlotChange(index, 'startTime', e.target.value)} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Kết thúc</label>
                        <input type="time" value={slot.endTime} onChange={(e) => handleTimeSlotChange(index, 'endTime', e.target.value)} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Giá (VNĐ)</label>
                        <input type="number" value={slot.price} onChange={(e) => handleTimeSlotChange(index, 'price', e.target.value)} required min="0" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:border-blue-500" />
                      </div>
                      <div className="w-24">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Trạng thái</label>
                        <div className={`text-sm font-bold truncate mt-2 ${slot.status === 'BOOKED' ? 'text-red-600' : 'text-green-600'}`}>
                          {slot.status === 'BOOKED' ? 'Đã đặt' : 'Trống'}
                        </div>
                      </div>
                      <div className="pt-5">
                        <button type="button" onClick={() => handleRemoveTimeSlot(index)} disabled={slot.status === 'BOOKED'} className={`transition p-2 ${slot.status === 'BOOKED' ? 'text-gray-300 cursor-not-allowed' : 'text-red-500 hover:text-red-700 bg-white rounded-lg shadow-sm border border-red-100'}`} title={slot.status === 'BOOKED' ? "Không thể xóa ca đã được đặt" : "Xóa ca này"}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50 shrink-0">
            <Button variant="outline" onClick={onClose} type="button">Hủy</Button>
            <Button variant="primary" type="submit" className="!bg-blue-600 hover:!bg-blue-700">Lưu Thông Tin</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PitchFormModal;