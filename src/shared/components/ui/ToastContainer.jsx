// src/shared/components/ui/ToastContainer.jsx

import React from 'react';
import Toast from './Toast';
import { useToast } from '../../hooks/useToast.jsx';

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    // 위치별로 토스트 그룹핑
    const groupedToasts = toasts.reduce((acc, toast) => {
        const position = toast.position || 'top-right';
        if (!acc[position]) acc[position] = [];
        acc[position].push(toast);
        return acc;
    }, {});

    return (
        <>
            {Object.entries(groupedToasts).map(([position, positionToasts]) => (
                <div
                    key={position}
                    className={`fixed z-50 flex flex-col gap-2 max-w-sm w-full ${getPositionClasses(position)}`}
                >
                    {positionToasts.map((toast) => (
                        <Toast
                            key={toast.id}
                            id={toast.id}
                            message={toast.message}
                            type={toast.type}
                            duration={toast.duration}
                            position={position}
                            onClose={removeToast}
                        />
                    ))}
                </div>
            ))}
        </>
    );
};

const getPositionClasses = (position) => {
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

export default ToastContainer;
