import React from 'react';

type ModalProps = {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
};

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all duration-300">
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