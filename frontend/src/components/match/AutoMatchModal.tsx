import { useState, useEffect } from 'react';
import { FaTimes, FaRobot } from 'react-icons/fa';
import Button from '../common/Button';
import axiosClient from '../../api/axiosClient';

type AutoMatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (criteria: any) => void;
  fields: any[];
};

const AutoMatchModal = ({ isOpen, onClose, onSubmit, fields }: AutoMatchModalProps) => {
  const [criteria, setCriteria] = useState({
    message: '', 
    date: '', 
    timeStartStr: '18:00', 
    timeEndStr: '19:30',   
    skillLevel: 'BEGINNER',
    fieldId: ''
  });

  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const standardSlots = [
    { start: '06:00', end: '07:30' }, { start: '07:30', end: '09:00' },
    { start: '09:00', end: '10:30' }, { start: '10:30', end: '12:00' },
    { start: '12:00', end: '13:30' }, { start: '13:30', end: '15:00' },
    { start: '15:00', end: '16:30' }, { start: '16:30', end: '18:00' },
    { start: '18:00', end: '19:30' }, { start: '19:30', end: '21:00' },
    { start: '21:00', end: '22:30' }, { start: '22:00', end: '23:30' }
  ];

  const extractTime = (dateTime: any) => {
    if (!dateTime) return '';
    if (Array.isArray(dateTime)) {
        const hour = (dateTime[3] || 0).toString().padStart(2, '0');
        const minute = (dateTime[4] || 0).toString().padStart(2, '0');
        return `${hour}:${minute}`;
    }
    const str = String(dateTime);
    if (str.includes('T')) return str.split('T')[1].substring(0, 5);
    if (str.includes(' ')) return str.split(' ')[1].substring(0, 5);
    if (str.includes(':')) {
        const parts = str.split(':');
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`;
    }
    return str.substring(0, 5);
  };

  useEffect(() => {
    if (criteria.fieldId && criteria.date) {
      setIsLoadingSlots(true);
      axiosClient.get(`/fields/${criteria.fieldId}/availability?date=${criteria.date}`)
        .then(res => {
          const data = res.data;
          const slotsArray = Array.isArray(data) ? data : (data.availableTimeSlots || data.timeSlots || []);
          setAvailableSlots(slotsArray);
          
          if (slotsArray.length > 0) {
            const firstSlot = slotsArray[0];
            setCriteria(prev => ({
              ...prev,
              timeStartStr: extractTime(firstSlot.startTime),
              timeEndStr: extractTime(firstSlot.endTime)
            }));
          }
        })
        .catch(() => {
          setAvailableSlots([]);
        })
        .finally(() => setIsLoadingSlots(false));
    } else {
      setAvailableSlots([]);
      if (!criteria.timeStartStr && standardSlots.length > 0) {
        setCriteria(prev => ({
          ...prev,
          timeStartStr: '18:00',
          timeEndStr: '19:30'
        }));
      }
    }
  }, [criteria.fieldId, criteria.date]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(criteria);
  };

  const renderTimeOptions = () => {
    if (criteria.fieldId && criteria.date) {
      if (isLoadingSlots) return <option value="">Đang tải...</option>;
      
      const uniqueSlots: any[] = [];
      const seen = new Set();
      
      availableSlots.forEach((slot: any) => {
          const startStr = extractTime(slot.startTime);
          const endStr = extractTime(slot.endTime);
          const timeKey = `${startStr}|${endStr}`;
          
          if (!seen.has(timeKey)) {
              seen.add(timeKey);
              uniqueSlots.push({ ...slot, startStr, endStr, timeKey });
          }
      });

      if (uniqueSlots.length === 0) return <option value="">Không có ca nào</option>;
      
      return uniqueSlots.map((slot: any) => (
        <option key={slot.id || slot.timeKey} value={slot.timeKey}>
          {slot.startStr} - {slot.endStr}
        </option>
      ));
    } else {
      return standardSlots.map(s => (
        <option key={`${s.start}|${s.end}`} value={`${s.start}|${s.end}`}>{s.start} - {s.end}</option>
      ));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        <div className="flex justify-between items-center p-5 border-b border-blue-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h3 className="text-xl font-bold flex items-center gap-2"><FaRobot className="text-2xl" /> Auto Ghép Trận</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <FaTimes className="text-xl" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Lối đá của bạn (Để AI phân tích)</label>
            <input required type="text" placeholder="VD: Đá ban bật nhỏ, không bạo lực..." className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 focus:bg-white" value={criteria.message} onChange={e => setCriteria({...criteria, message: e.target.value})} />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Chọn Sân / Khu Vực (Không bắt buộc)</label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={criteria.fieldId} onChange={e => setCriteria({...criteria, fieldId: e.target.value})}>
              <option value="">-- Tìm mọi sân trên hệ thống --</option>
              {fields.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Ngày muốn đá</label>
              <input type="date" className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm" value={criteria.date} onChange={e => setCriteria({...criteria, date: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Khung giờ</label>
              <select 
                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white" 
                onChange={e => {
                  const val = e.target.value;
                  if (val) {
                    const [start, end] = val.split('|');
                    setCriteria({...criteria, timeStartStr: start, timeEndStr: end});
                  }
                }} 
                value={criteria.timeStartStr && criteria.timeEndStr ? `${criteria.timeStartStr}|${criteria.timeEndStr}` : ""}
              >
                {renderTimeOptions()}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Trình độ đối thủ</label>
            <select className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white" value={criteria.skillLevel} onChange={e => setCriteria({...criteria, skillLevel: e.target.value})}>
              <option value="">-- Mọi trình độ --</option>
              <option value="BEGINNER">Yếu / Vui vẻ</option>
              <option value="INTERMEDIATE">Trung bình / Khá</option>
              <option value="ADVANCED">Tốt / Chuyên nghiệp</option>
            </select>
          </div>

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="secondary" className="w-full rounded-xl bg-gray-100" onClick={onClose}>Hủy</Button>
            <Button type="submit" variant="primary" className="w-full rounded-xl !bg-blue-600 hover:!bg-blue-700 shadow-md">Bắt Đầu Ghép</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutoMatchModal;