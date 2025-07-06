import React from 'react';
import { X } from 'lucide-react';

const InputField = ({
    label,
    name,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    error,
    required = false,
    className = '',
    clearable = false,
    onClear,
    paddingClassName = 'p-3',
}) => {
    return (
        <div className={`flex flex-col ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className="block text-sm font-medium text-gray-300 mb-2"
                >
                    {label}{' '}
                    {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <div className="relative">
                <input
                    type={type}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full ${paddingClassName} bg-[#0A0D11] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2
                        ${error ? 'border-red-500 focus:ring-red-500' : 'border-[#243447] focus:ring-[#6366F1]'}
                        ${clearable ? 'pr-10' : ''}
                    `}
                />
                {clearable && value && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition bg-transparent border-none shadow-none outline-none"
                        aria-label="검색어 초기화"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default InputField;
