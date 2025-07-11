// src/features/concert/components/ConcertCard.jsx

// React 라이브러리에서 필요한 기능들을 import
import React from 'react';

// 콘서트 관련 타입과 상수들을 import
import { ConcertStatusLabels, ConcertStatusColors } from '../types/concert.js';

// 🔥 AI 요약을 위한 hook import 제거 - 더 이상 필요없음!
// import { useConcertDetail } from '../hooks/useConcertDetail.js';

const ConcertCard = ({
    concert,
    onClick,
    showAiSummary = false,
    className = '',
}) => {
    // ===== 🔥 개별 API 호출 제거 =====
    // 이제 concert props에서 이미 받은 aiSummary를 직접 사용
    // const { aiSummary, aiSummaryLoading } = useConcertDetail(
    //     showAiSummary ? concert.concertId : null,
    // );

    // ===== 데이터 유효성 검증 =====
    if (!concert) {
        return (
            <div
                style={{
                    border: '1px solid #ff0000',
                    padding: '16px',
                    color: '#ff0000',
                    backgroundColor: '#fff5f5',
                }}
            >
                ⚠️ 콘서트 정보를 불러올 수 없습니다.
            </div>
        );
    }

    // ===== 데이터 가공 =====
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
            console.warn('날짜 형식 변환 실패:', error);
            return `${concert.concertDate} ${concert.startTime}`;
        }
    };

    /**
     * AI 요약을 카드용으로 포맷팅 (마크다운 제거 + 단순화)
     */
    const formatAiSummaryForCard = (summary, maxLength = 60) => {
        if (!summary || typeof summary !== 'string') return '';

        // 마크다운 헤더 제거
        let cleaned = summary.replace(/#{1,3}\s*/g, '');

        // 줄바꿈을 공백으로 변환
        cleaned = cleaned.replace(/\n/g, ' ');

        // 연속 공백 정리
        cleaned = cleaned.replace(/\s+/g, ' ').trim();

        // 길이 제한
        if (cleaned.length > maxLength) {
            cleaned = cleaned.substring(0, maxLength).trim() + '...';
        }

        cleaned = cleaned.replace(
            /[^\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3\sa-zA-Z0-9.,!?()'":-<>=#:]/g,
            '',
        );

        return cleaned;
    };

    // 🔥 AI 요약 상태 확인 함수 추가
    const getAiSummaryStatus = () => {
        const aiSummary = concert.aiSummary; // props에서 직접 가져오기

        if (!aiSummary) {
            return {
                status: 'empty',
                message: '💭 AI 요약 준비중...'
            };
        }

        if (aiSummary === 'AI 요약 정보가 아직 생성되지 않았습니다.' ||
            aiSummary === 'AI 요약을 불러올 수 없습니다.') {
            return {
                status: 'unavailable',
                message: '💭 AI 요약 준비중...'
            };
        }

        return {
            status: 'available',
            message: formatAiSummaryForCard(aiSummary)
        };
    };

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

    // ===== 스타일 정의 =====
    const cardStyles = {
        border: '1px solid #374151',
        borderRadius: '16px',
        padding: '16px',
        margin: '8px',
        backgroundColor: '#1E293B',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.5)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        maxWidth: '300px',
        width: '100%',
    };

    const imageStyles = {
        width: '100%',
        height: '200px',
        objectFit: 'cover',
        borderRadius: '12px',
        marginBottom: '12px',
        backgroundColor: '#374151',
        loading: 'lazy',
        decoding: 'async',
    };

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

    const statusStyles = {
        display: 'inline-block',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 'bold',
        marginTop: '8px',
        ...getStatusColor(concert.status),
    };

    // ===== JSX 렌더링 =====
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
        >
            {/* 포스터 이미지 섹션 */}
            <div style={{ marginBottom: '12px' }}>
                <img
                    src={
                        concert.posterImageUrl ||
                        '/images/basic-poster-image.png'
                    }
                    alt={`${concert.title} 포스터`}
                    style={{
                        ...imageStyles,
                        opacity: '0',
                        transition: 'opacity 0.3s',
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    loading="lazy"
                    decoding="async"
                />
            </div>

            {/* 콘서트 기본 정보 섹션 */}
            <div style={{ marginBottom: '12px' }}>
                <h3
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        lineHeight: '1.4',
                    }}
                >
                    {concert.title}
                </h3>

                <p
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#9CA3AF',
                        fontWeight: '500',
                    }}
                >
                    {concert.artist}
                </p>

                <p
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#D1D5DB',
                    }}
                >
                    📅 {formatDateTime()}
                </p>

                <p
                    style={{
                        margin: '0 0 8px 0',
                        fontSize: '14px',
                        color: '#D1D5DB',
                    }}
                >
                    📍 {concert.venueName}
                </p>

                {concert.totalSeats && (
                    <p
                        style={{
                            margin: '0 0 8px 0',
                            fontSize: '12px',
                            color: '#D1D5DB',
                        }}
                    >
                        🎫 총 {concert.totalSeats.toLocaleString()}석
                    </p>
                )}
            </div>

            {/* 🔥 AI 요약 섹션 (완전히 새로 작성) */}
            {showAiSummary && (() => {
                const aiSummaryInfo = getAiSummaryStatus();

                return (
                    <div
                        style={{
                            marginBottom: '12px',
                            padding: '8px',
                            backgroundColor: '#374151',
                            borderRadius: '4px',
                            borderLeft: '3px solid #60A5FA',
                            border: '1px solid #4B5563',
                            minHeight: '40px',
                        }}
                    >
                        {aiSummaryInfo.status === 'available' ? (
                            // AI 요약 있음 - props에서 바로 사용
                            <p
                                style={{
                                    margin: '0',
                                    fontSize: '12px',
                                    color: '#D1D5DB',
                                    lineHeight: '1.4',
                                }}
                            >
                                🤖 {aiSummaryInfo.message}
                            </p>
                        ) : (
                            // AI 요약 없음 또는 준비중
                            <p
                                style={{
                                    margin: '0',
                                    fontSize: '11px',
                                    color: '#9CA3AF',
                                    fontStyle: 'italic',
                                }}
                            >
                                {aiSummaryInfo.message}
                            </p>
                        )}
                    </div>
                );
            })()}

            {/* 콘서트 상태 배지 */}
            <div>
                <span style={statusStyles}>
                    {ConcertStatusLabels[concert.status] || concert.status}
                </span>
            </div>
        </div>
    );
};

ConcertCard.defaultProps = {
    showAiSummary: false,
    className: '',
    onClick: null,
};

export default ConcertCard;