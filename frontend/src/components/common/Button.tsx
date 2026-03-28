import React from 'react';

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'danger'; 
  className?: string;
  disabled?: boolean; 
};

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  className = '',
  disabled = false 
}: ButtonProps) => {
  const baseStyle = "px-4 py-2 rounded font-medium transition duration-200 ease-in-out focus:outline-none";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  const disabledStyle = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled} 
      className={`${baseStyle} ${variants[variant]} ${disabledStyle} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;