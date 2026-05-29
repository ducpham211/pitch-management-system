import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import Modal from './Modal';
import Button from './Button';

type PopupMessageProps = {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
  onConfirm?: () => void;
};

const PopupMessage = ({ isOpen, onClose, type, title, message, onConfirm }: PopupMessageProps) => {
  const icons = {
    success: <FaCheckCircle className="text-green-500 text-6xl mb-4 mx-auto" />,
    error: <FaExclamationCircle className="text-red-500 text-6xl mb-4 mx-auto" />,
    info: <FaInfoCircle className="text-blue-500 text-6xl mb-4 mx-auto" />
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center pb-2">
        {icons[type]}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <Button 
          onClick={onConfirm || onClose} 
          variant="primary"
          className="w-full py-2.5 text-lg"
        >
          Đóng
        </Button>
      </div>
    </Modal>
  );
};

export default PopupMessage;