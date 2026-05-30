import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaQuestionCircle } from 'react-icons/fa';
import Modal from './Modal';
import Button from './Button';

type PopupMessageProps = {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  onConfirm?: () => void;
  showCancel?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
};

const PopupMessage = ({ 
  isOpen, 
  onClose, 
  type, 
  title, 
  message, 
  onConfirm,
  showCancel = false,
  cancelLabel = 'Hủy',
  confirmLabel = 'Đồng ý'
}: PopupMessageProps) => {
  const icons = {
    success: <FaCheckCircle className="text-green-500 text-6xl mb-4 mx-auto" />,
    error: <FaExclamationCircle className="text-red-500 text-6xl mb-4 mx-auto" />,
    info: <FaInfoCircle className="text-blue-500 text-6xl mb-4 mx-auto" />,
    warning: <FaQuestionCircle className="text-yellow-500 text-6xl mb-4 mx-auto" />
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center pb-2">
        {icons[type]}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        
        {showCancel ? (
          <div className="flex gap-3">
            <Button 
              onClick={onClose} 
              variant="secondary"
              className="w-full py-2.5 text-lg border border-gray-300"
            >
              {cancelLabel}
            </Button>
            <Button 
              onClick={onConfirm || onClose} 
              variant="primary"
              className={`w-full py-2.5 text-lg ${type === 'warning' ? '!bg-yellow-600 hover:!bg-yellow-700' : type === 'error' ? '!bg-red-600 hover:!bg-red-700' : '!bg-green-600 hover:!bg-green-700'}`}
            >
              {confirmLabel}
            </Button>
          </div>
        ) : (
          <Button 
            onClick={onConfirm || onClose} 
            variant="primary"
            className="w-full py-2.5 text-lg"
          >
            Đóng
          </Button>
        )}
      </div>
    </Modal>
  );
};

export default PopupMessage;