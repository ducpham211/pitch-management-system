import React from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  zIndex?: string; // Bổ sung prop zIndex để dễ custom sau này
};

const Modal = ({ isOpen, onClose, title, children, zIndex = 'z-[100]' }: ModalProps) => {
  if (!isOpen) return null;

  return (
    // Dùng zIndex truyền vào, mặc định là z-[100] để luôn nổi lên trên cùng
    <div className={`fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300 ${zIndex}`}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 focus:outline-none text-2xl leading-none transition-colors"
        >
          &times;
        </button>
        {title && <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;