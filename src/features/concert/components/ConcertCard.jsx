// src/features/concert/components/ConcertCard.jsx

import React, { useState, useEffect } from 'react';
import { ConcertStatusLabels, ConcertStatusColors } from '../types/concert.js';

// 반응형 Hook
const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200
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
        screenWidth
    };
};

const ConcertCard = ({
    concert,
    onClick,
    showAiSummary = false,
    className = '',
}) => {
    const { isMobile, isTablet } = useResponsive();

    // 데이터 유효성 검증
    if (!concert) {
        return (
            <div
                style={{
                    border: '1px solid #ef4444',
                    padding: isMobile ? '12px' : '16px',
                    color: '#ef4444',
                    backgroundColor: '#1E293B',
                    borderRadius: isMobile ? '8px' : '12px',
                    textAlign: 'center',
                }}
            >
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

            // 모바일에서는 더 간단한 형식
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

            const formattedDate = dateTime.toLocaleDateString('ko-KR', dateOptions);
            const formattedTime = dateTime.toLocaleTimeString('ko-KR', timeOptions);

            return `${formattedDate} ${formattedTime}`;
        } catch (error) {
            return `${concert.concertDate} ${concert.startTime}`;
        }
    };

    // AI 요약 포맷팅
    const formatAiSummaryForCard = (summary, maxLength = isMobile ? 40 : 60) => {
        if (!summary || typeof summary !== 'string') return '';

        let cleaned = summary.replace(/#{1,3}\s*/g, '');
        cleaned = cleaned.replace(/\n/g, ' ');
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        if (cleaned.length > maxLength) {
            cleaned = cleaned.substring(0, maxLength).trim() + '...';
        }

        cleaned = cleaned.replace(
            /[^\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3\sa-zA-Z0-9.,!?()'":-<>=#:]/g,
            '',
        );

        return cleaned;
    };

    // AI 요약 상태 확인
    const getAiSummaryStatus = () => {
        const aiSummary = concert.aiSummary;

        if (!aiSummary) {
            return {
                status: 'empty',
                message: '💭 AI 요약 준비중...',
            };
        }

        if (
            aiSummary === 'AI 요약 정보가 아직 생성되지 않았습니다.' ||
            aiSummary === 'AI 요약을 불러올 수 없습니다.'
        ) {
            return {
                status: 'unavailable',
                message: '💭 AI 요약 준비중...',
            };
        }

        return {
            status: 'available',
            message: formatAiSummaryForCard(aiSummary),
        };
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
                return { backgroundColor: '#fef3c7', color: '#92400e' };
            case 'ON_SALE':
                return { backgroundColor: '#d1fae5', color: '#065f46' };
            case 'SOLD_OUT':
                return { backgroundColor: '#fee2e2', color: '#991b1b' };
            case 'CANCELLED':
                return { backgroundColor: '#f3f4f6', color: '#374151' };
            case 'COMPLETED':
                return { backgroundColor: '#dbeafe', color: '#1e40af' };
            default:
                return { backgroundColor: '#f3f4f6', color: '#374151' };
        }
    }

    // 🎯 반응형 스타일 정의
    const cardStyles = {
        border: '1px solid #374151',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '12px' : '16px',
        margin: isMobile ? '0' : '8px', // 모바일에서는 margin 제거
        backgroundColor: '#1E293B',
        boxShadow: isMobile
            ? '0 2px 4px rgba(0, 0, 0, 0.3)'
            : '0 4px 6px rgba(0, 0, 0, 0.5)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        width: '100%',
        maxWidth: isMobile ? '100%' : '300px',
        // 터치 디바이스를 위한 최소 높이
        minHeight: isMobile ? '280px' : 'auto',
        display: 'flex',
        flexDirection: 'column',
    };

    const imageContainerStyles = {
        marginBottom: isMobile ? '8px' : '12px',
        position: 'relative',
        width: '100%',
        height: isMobile ? '120px' : '200px', // 모바일에서 이미지 높이 줄임
        borderRadius: isMobile ? '8px' : '12px',
        overflow: 'hidden',
        backgroundColor: '#374151',
    };

    const imageStyles = {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        opacity: '0',
        transition: 'opacity 0.3s',
    };

    const contentStyles = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    };

    const titleStyles = {
        margin: '0 0 6px 0',
        fontSize: isMobile ? '14px' : '18px',
        fontWeight: 'bold',
        color: '#FFFFFF',
        lineHeight: '1.4',
        // 모바일에서 2줄까지만 표시
        display: '-webkit-box',
        WebkitLineClamp: isMobile ? 2 : 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    };

    const artistStyles = {
        margin: '0 0 6px 0',
        fontSize: isMobile ? '12px' : '14px',
        color: '#9CA3AF',
        fontWeight: '500',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    };

    const infoStyles = {
        margin: '0 0 4px 0',
        fontSize: isMobile ? '11px' : '14px',
        color: '#D1D5DB',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    };

    const statusStyles = {
        display: 'inline-block',
        padding: isMobile ? '3px 6px' : '4px 8px',
        borderRadius: '4px',
        fontSize: isMobile ? '10px' : '12px',
        fontWeight: 'bold',
        marginTop: isMobile ? '6px' : '8px',
        ...getStatusColor(concert.status),
    };

    const aiSummaryStyles = {
        marginBottom: isMobile ? '8px' : '12px',
        padding: isMobile ? '6px' : '8px',
        backgroundColor: '#374151',
        borderRadius: '4px',
        borderLeft: '3px solid #60A5FA',
        border: '1px solid #4B5563',
        minHeight: isMobile ? '30px' : '40px',
    };

    return (
        <div
            className={`concert-card ${className}`}
            style={cardStyles}
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
            // 터치 피드백 추가 (모바일)
            onTouchStart={isMobile ? (e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
            } : undefined}
            onTouchEnd={isMobile ? (e) => {
                e.currentTarget.style.transform = 'scale(1)';
            } : undefined}
            onMouseEnter={!isMobile ? (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 12px rgba(0, 0, 0, 0.6)';
            } : undefined}
            onMouseLeave={!isMobile ? (e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.5)';
            } : undefined}
        >
            {/* 포스터 이미지 섹션 */}
            <div style={imageContainerStyles}>
                <img
                    src={concert.posterImageUrl || '/images/basic-poster-image.png'}
                    alt={`${concert.title} 포스터`}
                    style={imageStyles}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                    decoding="async"
                />
            </div>

            {/* 콘서트 정보 섹션 */}
            <div style={contentStyles}>
                <h3 style={titleStyles}>{concert.title}</h3>

                <p style={artistStyles}>{concert.artist}</p>

                <p style={infoStyles}>
                    📅 {formatDateTime()}
                </p>

                <p style={infoStyles}>
                    📍 {concert.venueName}
                </p>

                {concert.totalSeats && (
                    <p style={{
                        ...infoStyles,
                        marginBottom: isMobile ? '6px' : '8px'
                    }}>
                        🎫 총 {concert.totalSeats.toLocaleString()}석
                    </p>
                )}

                {/* AI 요약 섹션 */}
                {showAiSummary && (() => {
                    const aiSummaryInfo = getAiSummaryStatus();

                    return (
                        <div style={aiSummaryStyles}>
                            {aiSummaryInfo.status === 'available' ? (
                                <p style={{
                                    margin: '0',
                                    fontSize: isMobile ? '10px' : '12px',
                                    color: '#D1D5DB',
                                    lineHeight: '1.4',
                                }}>
                                    🤖 {aiSummaryInfo.message}
                                </p>
                            ) : (
                                <p style={{
                                    margin: '0',
                                    fontSize: isMobile ? '9px' : '11px',
                                    color: '#9CA3AF',
                                    fontStyle: 'italic',
                                }}>
                                    {aiSummaryInfo.message}
                                </p>
                            )}
                        </div>
                    );
                })()}

                {/* 상태 배지 - 하단에 고정 */}
                <div style={{ marginTop: 'auto' }}>
                    <span style={statusStyles}>
                        {ConcertStatusLabels[concert.status] || concert.status}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ConcertCard;