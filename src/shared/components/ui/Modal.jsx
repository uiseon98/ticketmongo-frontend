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
    modalClassName = '',
    titleClassName = '',
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
            className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${className}`}
            style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)', // #0F172A 80% 투명도
                backdropFilter: 'blur(4px)', // 블러 효과 추가
            }}
            onClick={handleBackdropClick}
        >
            <div
                className={`rounded-lg shadow-xl max-h-[90vh] overflow-auto relative w-full ${getSizeClasses()}`}
                style={{
                    backgroundColor: '#1E293B', // 초기 디자인 카드 배경색
                    border: '1px solid #374151', // 초기 디자인 테두리색
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)', // 더 진한 그림자
                    ...(modalClassName && {}), // modalClassName이 있으면 추가 스타일 적용 가능
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* 모달 헤더 */}
                {(title || showCloseButton) && (
                    <div
                        className="flex items-center justify-between p-4 rounded-t-lg"
                        style={{
                            borderBottom: '1px solid #374151', // 초기 디자인 테두리색
                            backgroundColor: '#1E293B', // 헤더도 같은 배경색
                        }}
                    >
                        {title && (
                            <h2
                                className={`text-xl font-bold ${titleClassName}`}
                                style={{
                                    color: '#FFFFFF', // 초기 디자인 텍스트색
                                }}
                            >
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="transition-colors text-2xl font-bold p-1 leading-none"
                                style={{
                                    color: '#9CA3AF', // 초기 디자인 보조 텍스트색
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.target.style.color = '#FFFFFF'; // 호버 시 흰색
                                }}
                                onMouseLeave={(e) => {
                                    e.target.style.color = '#9CA3AF'; // 원래 색상으로
                                }}
                                aria-label="모달 닫기"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                )}

                {/* 모달 본문 */}
                <div
                    className="p-4"
                    style={{
                        backgroundColor: '#1E293B', // 본문도 같은 배경색
                        color: '#FFFFFF', // 기본 텍스트 색상
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
