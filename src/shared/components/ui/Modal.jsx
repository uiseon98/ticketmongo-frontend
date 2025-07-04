// src/shared/components/ui/Modal.jsx

import React, { useEffect } from 'react';

/**
 * ===== Modal 컴포넌트 =====
 *
 * 재사용 가능한 모달 컴포넌트
 */
const Modal = ({
    // ===== 필수 props =====
    isOpen = false, // 모달 열림/닫힘 상태
    onClose, // 모달 닫기 핸들러
    children, // 모달 내용

    // ===== 선택적 props =====
    title = '', // 모달 제목
    showCloseButton = true, // X 버튼 표시 여부
    closeOnBackdrop = true, // 배경 클릭 시 닫기
    closeOnEsc = true, // ESC 키로 닫기

    // ===== 스타일 props =====
    size = 'medium', // 'small' | 'medium' | 'large'
    className = '', // 모달 백드롭에 추가될 CSS 클래스
    modalClassName = '', // 모달 콘텐츠 박스에 추가될 CSS 클래스 (배경색 등)
    titleClassName = '', // 모달 제목에 추가될 CSS 클래스
}) => {
    // ESC 키 이벤트 처리
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

    // 스크롤 방지
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

    // 모달이 열려있지 않으면 렌더링하지 않음
    if (!isOpen) return null;

    // 배경 클릭 핸들러
    const handleBackdropClick = (event) => {
        if (closeOnBackdrop && event.target === event.currentTarget) {
            onClose?.();
        }
    };

    // 모달 크기별 Tailwind CSS 클래스 반환
    const getSizeClasses = () => {
        switch (size) {
            case 'small':
                return 'max-w-md'; // 400px
            case 'large':
                return 'max-w-4xl'; // 800px
            case 'medium':
            default:
                return 'max-w-2xl'; // 600px
        }
    };

    return (
        <div
            // 백드롭 스타일
            className={`fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 ${className}`}
            onClick={handleBackdropClick}
        >
            <div
                // 모달 콘텐츠 스타일 (배경색, 그림자, 최대 높이 등)
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
                                className="text-gray-400 hover:text-white transition-colors text-2xl font-bold p-1 leading-none"
                                aria-label="모달 닫기"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                )}

                {/* 모달 본문 */}
                <div className={`p-4 ${modalClassName}`}>{children}</div>
            </div>
        </div>
    );
};

export default Modal;
