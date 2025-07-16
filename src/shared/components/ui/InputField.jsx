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
    onKeyDown,
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
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    required={required}
                    className={`w-full ${paddingClassName} bg-[#0A0D11] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2
                        ${error ? 'border-red-500 focus:ring-red-500' : 'border-[#243447] focus:ring-[#6366F1]'}
                        ${clearable ? 'pr-10' : ''} /* X 버튼 공간 확보 */
                    `}
                />
                {clearable && value && (
                    <button
                        type="button"
                        onClick={onClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
           bg-transparent border-none shadow-none outline-none
           p-1 rounded-full cursor-pointer
           hover:bg-transparent focus:bg-transparent active:bg-transparent
           focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:outline-none"
                        aria-label="검색어 초기화"
                    >
                        <X size={18} className="pointer-events-none" />
                    </button>
                )}
            </div>
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default InputField;
