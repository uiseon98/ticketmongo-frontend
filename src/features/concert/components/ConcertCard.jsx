// src/features/concert/components/ConcertCard.jsx

import React, { useState, useEffect } from 'react';
import { ConcertStatusLabels, ConcertStatusColors } from '../types/concert.js';

// 반응형 Hook
const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
    );

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenWidth(width);
            setIsMobile(width <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        isMobile,
        isTablet: screenWidth <= 1024 && screenWidth > 768,
        isDesktop: screenWidth > 1024,
        screenWidth,
    };
};

const ConcertCard = ({ concert, onClick, className = '' }) => {
    const { isMobile, isTablet } = useResponsive();

    // 데이터 유효성 검증
    if (!concert) {
        return (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center text-red-400">
                ⚠️ 콘서트 정보를 불러올 수 없습니다.
            </div>
        );
    }

    // 날짜 포맷팅
    const formatDateTime = () => {
        try {
            if (!concert.concertDate || !concert.startTime) {
                return '날짜 미정';
            }

            const dateTimeString = `${concert.concertDate}T${concert.startTime}`;
            const dateTime = new Date(dateTimeString);

            if (isNaN(dateTime.getTime())) {
                return '날짜 미정';
            }

            if (isMobile) {
                return dateTime.toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                });
            }

            const dateOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short',
            };

            const timeOptions = {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
            };

            const formattedDate = dateTime.toLocaleDateString(
                'ko-KR',
                dateOptions,
            );
            const formattedTime = dateTime.toLocaleTimeString(
                'ko-KR',
                timeOptions,
            );

            return `${formattedDate} ${formattedTime}`;
        } catch (error) {
            return `${concert.concertDate} ${concert.startTime}`;
        }
    };

    // 이미지 에러 처리
    const handleImageError = (event) => {
        event.target.src = '/images/basic-poster-image.png';
        event.target.onerror = () => {
            event.target.style.display = 'none';
        };
    };

    const handleImageLoad = (event) => {
        event.target.style.opacity = '1';
    };

    const handleCardClick = () => {
        if (onClick && typeof onClick === 'function') {
            onClick(concert);
        }
    };

    // 상태별 색상
    function getStatusColor(status) {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-yellow-600 text-yellow-100';
            case 'ON_SALE':
                return 'bg-green-600 text-green-100';
            case 'SOLD_OUT':
                return 'bg-red-600 text-red-100';
            case 'CANCELLED':
                return 'bg-gray-600 text-gray-100';
            case 'COMPLETED':
                return 'bg-blue-600 text-blue-100';
            default:
                return 'bg-gray-600 text-gray-100';
        }
    }

    return (
        <div
            className={`
                bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-lg
                cursor-pointer transform transition-all duration-300
                hover:scale-105 hover:shadow-xl hover:border-gray-500
                ${className}
            `}
            onClick={handleCardClick}
            onKeyDown={(e) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
            tabIndex={onClick ? 0 : -1}
            role={onClick ? 'button' : 'article'}
            aria-label={`${concert.title} - ${concert.artist} 콘서트 정보`}
        >
            {/* 포스터 이미지 섹션 */}
            <div
                className={`relative ${isMobile ? 'h-48' : 'h-64'} overflow-hidden bg-gray-700`}
            >
                <img
                    src={
                        concert.posterImageUrl ||
                        '/images/basic-poster-image.png'
                    }
                    alt={`${concert.title} 포스터`}
                    className="w-full h-full object-cover transition-opacity duration-300 opacity-0"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                    decoding="async"
                />

                {/* 기본 포스터 UI (이미지가 없을 때) */}
                {!concert.posterImageUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                        <div
                            className={`${isMobile ? 'text-3xl' : 'text-4xl'} mb-2`}
                        >
                            🎭
                        </div>
                        <div
                            className={`${isMobile ? 'text-xs' : 'text-sm'} text-center px-2`}
                        >
                            포스터
                            <br />
                            준비중
                        </div>
                    </div>
                )}

                {/* 상태 배지 */}
                <div className="absolute top-3 left-3">
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(concert.status)}`}
                    >
                        {ConcertStatusLabels[concert.status] || concert.status}
                    </span>
                </div>
            </div>

            {/* 콘서트 정보 섹션 */}
            <div className={`p-${isMobile ? '4' : '5'} space-y-3`}>
                {/* 제목과 아티스트 */}
                <div>
                    <h3
                        className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white mb-2 line-clamp-2`}
                    >
                        {concert.title}
                    </h3>
                    <p
                        className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-300 truncate`}
                    >
                        🎤 {concert.artist}
                    </p>
                </div>

                {/* 공연 정보 */}
                <div
                    className={`space-y-2 ${isMobile ? 'text-sm' : 'text-base'} text-gray-300`}
                >
                    <div className="flex items-center gap-2">
                        <span className="text-blue-400">📅</span>
                        <span className="truncate">{formatDateTime()}</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-green-400">📍</span>
                        <span className="truncate">{concert.venueName}</span>
                    </div>

                    {concert.totalSeats && (
                        <div className="flex items-center gap-2">
                            <span className="text-purple-400">🎫</span>
                            <span>
                                총 {concert.totalSeats.toLocaleString()}석
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConcertCard;
