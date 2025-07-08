// src/features/seller/components/AISummaryRegenerationSection.jsx

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
    RefreshCw,
    Bot,
    AlertCircle,
    CheckCircle,
    Clock,
    Calendar,
    Info,
} from 'lucide-react';
import { concertService } from '../../concert/services/concertService.js';

/**
 * 판매자용 AI 요약 재생성 섹션 컴포넌트
 *
 * 🎯 주요 기능:
 * 1. AI 요약 재생성 버튼 (연타 방지)
 * 2. 현재 AI 요약 표시
 * 3. 재생성된 새 요약 표시
 * 4. 성공/실패 상태 표시
 * 5. 상세한 에러 메시지 표시
 * 6. 🔥 과거 공연에 대한 AI 재생성 차단
 */
const AISummaryRegenerationSection = ({
    sellerId,
    concertId,
    currentAiSummary,
    concertData, // 🔥 새로 추가: 콘서트 정보 (날짜, 시간 등)
    onSummaryUpdated, // 재생성 성공 시 콜백
    className = '',
}) => {
    // ===== 상태 관리 =====
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [newSummary, setNewSummary] = useState(null);
    const [lastRegeneratedAt, setLastRegeneratedAt] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [showPastConcertAlert, setShowPastConcertAlert] = useState(false);

    const COOLDOWN_SECONDS = 30; // 30초 쿨다운

    // 🔥 과거 공연 여부 체크
    const isPastConcert = useMemo(() => {
        if (
            !concertData ||
            !concertData.concertDate ||
            !concertData.startTime
        ) {
            return false; // 데이터가 없으면 허용 (안전한 기본값)
        }

        try {
            // 콘서트 날짜와 시작 시간을 결합
            const concertDateTime = new Date(
                `${concertData.concertDate}T${concertData.startTime}`,
            );
            const now = new Date();

            // 현재 시간보다 과거면 true
            return concertDateTime < now;
        } catch (error) {
            console.warn('날짜 파싱 오류:', error);
            return false; // 파싱 오류 시 허용
        }
    }, [concertData]);

    // 🔥 콘서트 상태별 메시지
    const getConcertStatusMessage = useMemo(() => {
        if (!concertData) return null;

        if (isPastConcert) {
            return {
                type: 'past',
                message: '이미 종료된 공연입니다',
                description: `${concertData.concertDate} ${concertData.startTime}에 진행된 공연의 AI 요약은 수정할 수 없습니다.`,
                icon: <Calendar size={16} />,
                color: '#6b7280',
            };
        }

        // 공연일까지 계산
        try {
            const concertDateTime = new Date(
                `${concertData.concertDate}T${concertData.startTime}`,
            );
            const now = new Date();
            const daysUntil = Math.ceil(
                (concertDateTime - now) / (1000 * 60 * 60 * 24),
            );

            if (daysUntil <= 0) {
                return null; // 당일이거나 과거 (isPastConcert에서 처리됨)
            } else if (daysUntil === 1) {
                return {
                    type: 'upcoming',
                    message: '내일 공연 예정',
                    description: `${concertData.concertDate} ${concertData.startTime}`,
                    icon: <Clock size={16} />,
                    color: '#f59e0b',
                };
            } else if (daysUntil <= 7) {
                return {
                    type: 'upcoming',
                    message: `${daysUntil}일 후 공연 예정`,
                    description: `${concertData.concertDate} ${concertData.startTime}`,
                    icon: <Clock size={16} />,
                    color: '#10b981',
                };
            } else {
                return {
                    type: 'scheduled',
                    message: `${daysUntil}일 후 공연 예정`,
                    description: `${concertData.concertDate} ${concertData.startTime}`,
                    icon: <Calendar size={16} />,
                    color: '#3b82f6',
                };
            }
        } catch (error) {
            return null;
        }
    }, [concertData, isPastConcert]);

    // 쿨다운 타이머 효과
    useEffect(() => {
        if (cooldownRemaining > 0) {
            const timer = setTimeout(() => {
                setCooldownRemaining((prev) => prev - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldownRemaining]);

    // 🔥 과거 공연 경고 알림 함수
    const handlePastConcertAlert = useCallback(() => {
        setShowPastConcertAlert(true);
        setTimeout(() => {
            setShowPastConcertAlert(false);
        }, 4000); // 4초 후 자동으로 사라짐
    }, []);

    const handleRegenerate = useCallback(async () => {
        // 🔥 과거 공연 체크
        if (isPastConcert) {
            handlePastConcertAlert();
            return;
        }

        if (isRegenerating || cooldownRemaining > 0) return;

        try {
            setIsRegenerating(true);
            setError(null);
            setSuccess(false);

            const response = await concertService.regenerateSellerAiSummary(
                sellerId,
                concertId,
            );

            if (response.success && response.data) {
                setNewSummary(response.data);
                setSuccess(true);
                setLastRegeneratedAt(new Date());
                setCooldownRemaining(COOLDOWN_SECONDS);
                if (onSummaryUpdated) {
                    onSummaryUpdated(response.data);
                }
            }
        } catch (err) {
            console.error('AI 요약 재생성 실패:', err);

            let errorMessage =
                err.message || 'AI 요약 재생성 중 오류가 발생했습니다.';

            if (errorMessage.includes('만족하지 않습니다')) {
                setError({
                    message:
                        '🤷‍♂️ AI 요약을 생성할 수 없습니다\n\n📝 아직 충분한 리뷰가 작성되지 않았습니다.\n리뷰가 더 많이 작성되면 AI 요약을 생성할 수 있어요!',
                    type: 'insufficient-reviews',
                });
            } else if (errorMessage.includes('리뷰가 없습니다')) {
                setError({
                    message:
                        '🤷‍♂️ 아직 작성된 리뷰가 없습니다\n\n먼저 리뷰를 작성해주세요.',
                    type: 'no-reviews',
                });
            } else if (errorMessage.includes('10자 이상')) {
                setError({
                    message:
                        '📝 리뷰 내용이 너무 짧습니다\n\n더 자세한 리뷰가 필요합니다.',
                    type: 'insufficient-content',
                });
            } else if (
                errorMessage.includes('최소') &&
                errorMessage.includes('개')
            ) {
                setError({
                    message:
                        '📊 리뷰가 부족합니다\n\n더 많은 리뷰가 작성되면 AI 요약을 생성할 수 있습니다.',
                    type: 'insufficient-count',
                });
            } else if (errorMessage.includes('권한')) {
                setError({
                    message:
                        '🔒 권한이 없습니다\n\n본인의 콘서트만 AI 요약을 재생성할 수 있습니다.',
                    type: 'permission-denied',
                });
            } else {
                setError({
                    message: '❌ ' + errorMessage,
                    type: 'general',
                });
            }
            setSuccess(false);
        } finally {
            setIsRegenerating(false);
        }
    }, [
        sellerId,
        concertId,
        isRegenerating,
        isPastConcert,
        onSummaryUpdated,
        handlePastConcertAlert,
    ]);

    // ===== 상태 초기화 함수 =====
    const resetStatus = useCallback(() => {
        setError(null);
        setSuccess(false);
        setNewSummary(null);
    }, []);

    // 🔥 버튼 비활성화 조건 (과거 공연 포함)
    const isButtonDisabled =
        isRegenerating || cooldownRemaining > 0 || isPastConcert;

    // 🔥 버튼 텍스트 (과거 공연 고려)
    const getButtonText = () => {
        if (isPastConcert) return '종료된 공연 (재생성 불가)';
        if (isRegenerating) return 'AI 요약 생성 중...';
        if (cooldownRemaining > 0)
            return `${cooldownRemaining}초 후 재시도 가능`;
        return 'AI 요약 재생성';
    };

    // ===== 스타일 정의 =====
    const sectionStyles = {
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '24px',
        marginTop: '24px',
    };

    const headerStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
    };

    const titleStyles = {
        fontSize: '18px',
        fontWeight: '600',
        color: '#1e40af',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    };

    const buttonStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 16px',
        backgroundColor: isButtonDisabled ? '#6b7280' : '#3b82f6',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: isButtonDisabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: isButtonDisabled ? 0.7 : 1,
    };

    const currentSummaryStyles = {
        backgroundColor: '#ffffff',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
    };

    const newSummaryStyles = {
        backgroundColor: '#f0fdf4',
        border: '1px solid #22c55e',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px',
    };

    const successStyles = {
        backgroundColor: '#f0fdf4',
        border: '1px solid #22c55e',
        borderRadius: '8px',
        padding: '12px',
        marginTop: '16px',
        color: '#16a34a',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    };

    // 🔥 과거 공연 알림 스타일
    const pastConcertAlertStyles = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#fef2f2',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        padding: '16px',
        color: '#dc2626',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        maxWidth: '400px',
        transform: showPastConcertAlert ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
    };

    // ===== 렌더링 =====
    return (
        <>
            <div
                className={`ai-summary-regeneration ${className}`}
                style={sectionStyles}
            >
                {/* 헤더 */}
                <div style={headerStyles}>
                    <h3 style={titleStyles}>
                        <Bot size={20} />
                        AI 요약 관리
                    </h3>

                    <button
                        onClick={handleRegenerate}
                        disabled={isButtonDisabled}
                        style={buttonStyles}
                        title={
                            isPastConcert
                                ? '이미 종료된 공연의 AI 요약은 수정할 수 없습니다'
                                : undefined
                        }
                    >
                        <RefreshCw
                            size={16}
                            className={isRegenerating ? 'animate-spin' : ''}
                        />
                        {getButtonText()}
                    </button>
                </div>

                {/* 🔥 콘서트 상태 표시 */}
                {getConcertStatusMessage && (
                    <div
                        style={{
                            backgroundColor: isPastConcert
                                ? '#f9fafb'
                                : '#f0f9ff',
                            border: `1px solid ${getConcertStatusMessage.color}`,
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                        }}
                    >
                        <div style={{ color: getConcertStatusMessage.color }}>
                            {getConcertStatusMessage.icon}
                        </div>
                        <div>
                            <div
                                style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: getConcertStatusMessage.color,
                                }}
                            >
                                {getConcertStatusMessage.message}
                            </div>
                            <div
                                style={{
                                    fontSize: '13px',
                                    color: '#6b7280',
                                    marginTop: '2px',
                                }}
                            >
                                {getConcertStatusMessage.description}
                            </div>
                        </div>
                    </div>
                )}

                {/* 설명 텍스트 */}
                <div
                    style={{
                        marginBottom: '20px',
                        fontSize: '14px',
                        color: '#6b7280',
                    }}
                >
                    <p>
                        {isPastConcert
                            ? '이미 종료된 공연의 AI 요약은 수정할 수 없습니다. 진행 중이거나 예정된 공연만 AI 요약을 재생성할 수 있습니다.'
                            : '현재 콘서트의 리뷰를 바탕으로 AI 요약을 새로 생성합니다. 생성된 AI 요약은 콘서트 상세 정보에 바로 반영이 됩니다. 유효한 리뷰가 충분히 있어야 생성 가능합니다.'}
                    </p>
                    {cooldownRemaining > 0 && !isPastConcert && (
                        <p
                            style={{
                                color: '#f59e0b',
                                fontSize: '13px',
                                marginTop: '4px',
                            }}
                        >
                            ⏰ 연속 요청 방지를 위해 {cooldownRemaining}초 후
                            재시도할 수 있습니다.
                        </p>
                    )}
                </div>

                {/* 현재 AI 요약 */}
                <div>
                    <h4
                        style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#374151',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                        }}
                    >
                        <Clock size={16} />
                        현재 AI 요약
                    </h4>

                    <div style={currentSummaryStyles}>
                        {currentAiSummary ? (
                            <p
                                style={{
                                    margin: '0',
                                    lineHeight: '1.6',
                                    color: '#374151',
                                }}
                            >
                                {currentAiSummary}
                            </p>
                        ) : (
                            <p
                                style={{
                                    margin: '0',
                                    color: '#6b7280',
                                    fontStyle: 'italic',
                                }}
                            >
                                아직 AI 요약이 생성되지 않았습니다.
                            </p>
                        )}
                    </div>
                </div>

                {/* 성공 메시지 */}
                {success && !error && (
                    <div style={successStyles}>
                        <CheckCircle size={16} />
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>
                            AI 요약이 성공적으로 재생성되었습니다!
                            {lastRegeneratedAt && (
                                <span
                                    style={{
                                        marginLeft: '8px',
                                        fontWeight: 'normal',
                                    }}
                                >
                                    ({lastRegeneratedAt.toLocaleTimeString()})
                                </span>
                            )}
                        </span>
                    </div>
                )}

                {/* 새로 생성된 AI 요약 */}
                {newSummary && (
                    <div>
                        <h4
                            style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#16a34a',
                                marginTop: '20px',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                            }}
                        >
                            <CheckCircle size={16} />
                            새로 생성된 AI 요약
                        </h4>

                        <div style={newSummaryStyles}>
                            <p
                                style={{
                                    margin: '0',
                                    lineHeight: '1.6',
                                    color: '#15803d',
                                }}
                            >
                                {newSummary}
                            </p>
                        </div>
                    </div>
                )}

                {/* 에러 메시지 */}
                {error && (
                    <div
                        style={{
                            backgroundColor:
                                error.type === 'no-reviews'
                                    ? '#fef3c7'
                                    : error.type === 'insufficient-content'
                                      ? '#fef3c7'
                                      : error.type === 'insufficient-count'
                                        ? '#dbeafe'
                                        : '#fef2f2',
                            border: `1px solid ${
                                error.type === 'no-reviews'
                                    ? '#f59e0b'
                                    : error.type === 'insufficient-content'
                                      ? '#f59e0b'
                                      : error.type === 'insufficient-count'
                                        ? '#3b82f6'
                                        : '#ef4444'
                            }`,
                            borderRadius: '8px',
                            padding: '16px',
                            marginTop: '16px',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '8px',
                                color:
                                    error.type === 'no-reviews'
                                        ? '#92400e'
                                        : error.type === 'insufficient-content'
                                          ? '#92400e'
                                          : error.type === 'insufficient-count'
                                            ? '#1e40af'
                                            : '#dc2626',
                            }}
                        >
                            <AlertCircle
                                size={16}
                                style={{ marginTop: '2px', flexShrink: 0 }}
                            />
                            <div>
                                <h4
                                    style={{
                                        margin: '0 0 8px 0',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                    }}
                                >
                                    {error.message}
                                </h4>
                            </div>
                        </div>
                    </div>
                )}

                {/* CSS 애니메이션 */}
                <style>{`
                    .animate-spin {
                        animation: spin 1s linear infinite;
                    }

                    @keyframes spin {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(360deg);
                        }
                    }
                `}</style>
            </div>

            {/* 🔥 과거 공연 경고 알림 (화면 우상단) */}
            {showPastConcertAlert && (
                <div style={pastConcertAlertStyles}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                        }}
                    >
                        <AlertCircle
                            size={16}
                            style={{ marginTop: '2px', flexShrink: 0 }}
                        />
                        <div>
                            <h4
                                style={{
                                    margin: '0 0 4px 0',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                }}
                            >
                                이미 종료된 공연입니다
                            </h4>
                            <p
                                style={{
                                    margin: '0',
                                    fontSize: '13px',
                                    lineHeight: '1.4',
                                }}
                            >
                                {concertData?.concertDate}{' '}
                                {concertData?.startTime}에 진행된 공연의 AI
                                요약은 수정할 수 없습니다.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AISummaryRegenerationSection;
