// src/shared/hooks/useToast.js

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', options = {}) => {
        const id = Date.now() + Math.random();
        const toast = {
            id,
            message,
            type,
            duration: options.duration || 3000,
            position: options.position || 'top-center',
            ...options,
        };

        setToasts((prev) => [...prev, toast]);
        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const clearAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // 편의 메서드들
    const showSuccess = useCallback(
        (message, options) => {
            return addToast(message, 'success', options);
        },
        [addToast],
    );

    const showError = useCallback(
        (message, options) => {
            return addToast(message, 'error', options);
        },
        [addToast],
    );

    const showWarning = useCallback(
        (message, options) => {
            return addToast(message, 'warning', options);
        },
        [addToast],
    );

    const showInfo = useCallback(
        (message, options) => {
            return addToast(message, 'info', options);
        },
        [addToast],
    );

    const value = {
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };

    return (
        <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
    );
};
