import { FaHandshake } from 'react-icons/fa';
import Button from '../common/Button';

type ConfirmApplyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const ConfirmApplyModal = ({ isOpen, onClose, onConfirm }: ConfirmApplyModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center animate-fade-in-up">
        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
          <FaHandshake />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Xác Nhận Nhận Kèo</h3>
        <p className="text-gray-600 mb-6 text-sm">
          Bạn có chắc chắn muốn liên hệ nhận kèo này? Hệ thống sẽ mở một phòng chat riêng giữa đội bạn và chủ bài đăng để tiện thương lượng.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="w-full border border-gray-300" onClick={onClose}>Đóng</Button>
          <Button variant="primary" className="w-full !bg-blue-600" onClick={onConfirm}>Vào Chat</Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmApplyModal;