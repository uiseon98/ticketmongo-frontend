// src/shared/components/ui/Toast.jsx

import React, { useEffect, useState } from 'react';

const Toast = ({ 
    id,
    message, 
    type = 'info', 
    duration = 3000, 
    onClose,
    position = 'top-right'
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // 마운트 시 애니메이션 시작
        const timer = setTimeout(() => setIsVisible(true), 10);
        
        // 자동 사라짐 타이머
        const autoCloseTimer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => {
            clearTimeout(timer);
            clearTimeout(autoCloseTimer);
        };
    }, [duration]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose?.(id);
        }, 300); // 애니메이션 완료 후 제거
    };

    const getTypeStyles = () => {
        switch (type) {
            case 'error':
                return {
                    bg: 'bg-red-500',
                    border: 'border-red-600',
                    text: 'text-white',
                    icon: '⚠️'
                };
            case 'success':
                return {
                    bg: 'bg-green-500',
                    border: 'border-green-600',
                    text: 'text-white',
                    icon: '✅'
                };
            case 'warning':
                return {
                    bg: 'bg-yellow-500',
                    border: 'border-yellow-600',
                    text: 'text-white',
                    icon: '⚠️'
                };
            case 'info':
            default:
                return {
                    bg: 'bg-blue-500',
                    border: 'border-blue-600',
                    text: 'text-white',
                    icon: 'ℹ️'
                };
        }
    };

    const getPositionStyles = () => {
        switch (position) {
            case 'top-left':
                return 'top-4 left-4';
            case 'top-center':
                return 'top-4 left-1/2 transform -translate-x-1/2';
            case 'top-right':
                return 'top-4 right-4';
            case 'bottom-left':
                return 'bottom-4 left-4';
            case 'bottom-center':
                return 'bottom-4 left-1/2 transform -translate-x-1/2';
            case 'bottom-right':
                return 'bottom-4 right-4';
            default:
                return 'top-4 left-1/2 transform -translate-x-1/2';
        }
    };

    const styles = getTypeStyles();
    const positionClasses = getPositionStyles();

    return (
        <div
            className={`
                fixed z-50 max-w-md w-full mx-auto px-4
                ${positionClasses}
                transition-all duration-300 ease-in-out
                ${isVisible && !isLeaving 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 -translate-y-2 scale-95'
                }
            `}
        >
            <div
                className={`
                    bg-gray-800 border border-gray-700 text-white
                    rounded-lg shadow-xl p-4 flex items-center gap-3
                    backdrop-blur-sm
                `}
            >
                <span className="text-base">{styles.icon}</span>
                <div className="flex-1">
                    <p className="font-medium text-sm leading-relaxed">{message}</p>
                </div>
                <button
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white transition-colors ml-2 text-sm leading-none w-4 h-4 flex items-center justify-center"
                    aria-label="닫기"
                >
                    ×
                </button>
            </div>
        </div>
    );
};

export default Toast;