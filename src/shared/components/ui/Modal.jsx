// src/shared/components/ui/Modal.jsx

import React, { useEffect } from 'react';

const Modal = ({
    isOpen = false,
    onClose,
    children,
    title = '',
    showCloseButton = true,
    closeOnBackdrop = true,
    closeOnEsc = true,
    size = 'medium',
    className = '',
    modalClassName = '', // 모달 콘텐츠 박스 (헤더, 본문, 푸터 포함)에 추가될 CSS 클래스 (배경색 등)
    titleClassName = '', // 모달 제목에 추가될 CSS 클래스
}) => {
    useEffect(() => {
        if (!isOpen || !closeOnEsc) return;

        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => document.removeEventListener('keydown', handleEscKey);
    }, [isOpen, closeOnEsc, onClose]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
            onClose?.();
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return 'max-w-md';
            case 'large':
                return 'max-w-4xl';
            case 'medium':
            default:
                return 'max-w-2xl';
        }
    };

    return (
        <div
            className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 ${className}`}
            onClick={handleBackdropClick}
        >
            <div
                className={`rounded-lg shadow-xl max-h-[90vh] overflow-auto relative w-full ${getSizeClasses()} ${modalClassName}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 모달 헤더 */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 border-b border-[#243447] bg-[#1a232f] rounded-t-lg">
                        {title && (
                            <h2
                                className={`text-xl font-bold text-white ${titleClassName}`}
                            >
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                // X 버튼 색상 수정 (배경색과 유사하되 약간 밝게)
                                className="text-gray-300 hover:text-white transition-colors text-2xl font-bold p-1 leading-none"
                                aria-label="모달 닫기"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                )}

                {/* 모달 본문 */}
                <div className={`p-4`}>
                    {' '}
                    {/* 이 부분은 배경색을 modalClassName이 제어하도록 */}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
