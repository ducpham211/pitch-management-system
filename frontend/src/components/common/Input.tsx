import React, { type InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

const Input = ({
    label,
    type = 'text',
    className = '',
    ...props 
}: InputProps) => {
    return (
        <div className={`flex flex-col mb-4 ${className}`}>
            {label && <label className="mb-1 text-sm font-medium text-gray-700">{label}</label>}
            <input
                type={type}
                className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...props}
            />
        </div>
    );
};

export default Input;