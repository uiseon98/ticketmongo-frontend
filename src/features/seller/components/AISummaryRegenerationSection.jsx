// 콘서트 페이지와 통일된 디자인 적용
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

// 반응형 Hook (콘서트 페이지와 동일)
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

const AISummaryRegenerationSection = ({
    sellerId,
    concertId,
    currentAiSummary,
    concertData,
    onSummaryUpdated,
    className = '',
}) => {
    const { isMobile, isTablet } = useResponsive();

    // 기존 상태들...
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [newSummary, setNewSummary] = useState(null);
    const [lastRegeneratedAt, setLastRegeneratedAt] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [showPastConcertAlert, setShowPastConcertAlert] = useState(false);

    const COOLDOWN_SECONDS = 30;

    useEffect(() => {
        let timer;
        if (cooldownRemaining > 0) {
            timer = setInterval(() => {
                setCooldownRemaining((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [cooldownRemaining]);

    // 기존 로직들... (isPastConcert, getConcertStatusMessage 등)
    const isPastConcert = useMemo(() => {
        if (
            !concertData ||
            !concertData.concertDate ||
            !concertData.startTime
        ) {
            return false;
        }
        try {
            const concertDateTime = new Date(
                `${concertData.concertDate}T${concertData.startTime}`,
            );
            const now = new Date();
            return concertDateTime < now;
        } catch (error) {
            console.warn('날짜 파싱 오류:', error);
            return false;
        }
    }, [concertData]);

    // 기존 이벤트 핸들러들...
    const handleRegenerate = useCallback(async () => {
        if (isPastConcert) {
            setShowPastConcertAlert(true);
            setTimeout(() => setShowPastConcertAlert(false), 4000);
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
            // 에러 처리 로직...
        } finally {
            setIsRegenerating(false);
        }
    }, [
        sellerId,
        concertId,
        isRegenerating,
        cooldownRemaining,
        isPastConcert,
        onSummaryUpdated,
    ]);

    const isButtonDisabled =
        isRegenerating || cooldownRemaining > 0 || isPastConcert;

    const getButtonText = () => {
        if (isPastConcert) return '종료된 공연 (재생성 불가)';
        if (isRegenerating) return 'AI 요약 생성 중...';
        if (cooldownRemaining > 0)
            return `${cooldownRemaining}초 후 재시도 가능`;
        return 'AI 요약 재생성';
    };

    return (
        <>
            {/* 콘서트 페이지와 동일한 카드 스타일 적용 */}
            <div
                className={`rounded-xl shadow-md ${className}`}
                style={{
                    backgroundColor: '#1f2937', // gray-800 - 콘서트 페이지와 동일
                    border: '1px solid #374151', // gray-700
                    padding: isMobile ? '16px' : isTablet ? '20px' : '24px',
                }}
            >
                {/* 헤더 - 콘서트 페이지 스타일 */}
                <div className="flex items-center justify-between mb-6">
                    <h3
                        className={`font-bold text-white flex items-center gap-3 ${isMobile ? 'text-lg' : 'text-xl'}`}
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Bot size={isMobile ? 16 : 20} color="white" />
                        </div>
                        AI 요약 관리
                    </h3>

                    <button
                        onClick={handleRegenerate}
                        disabled={isButtonDisabled}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium ${isMobile ? 'text-sm' : 'text-base'} ${
                            isButtonDisabled
                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        style={{
                            minHeight: isMobile ? '44px' : 'auto',
                        }}
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

                {/* 콘서트 상태 표시 - 콘서트 페이지 스타일 */}
                {concertData && (
                    <div
                        className="flex items-center gap-3 mb-4 p-3 rounded-lg"
                        style={{
                            backgroundColor: isPastConcert
                                ? '#374151'
                                : '#1e40af',
                            border: '1px solid #4b5563',
                        }}
                    >
                        <Calendar size={16} className="text-blue-400" />
                        <div>
                            <div
                                className={`font-medium text-white ${isMobile ? 'text-sm' : 'text-base'}`}
                            >
                                {isPastConcert
                                    ? '이미 종료된 공연입니다'
                                    : '진행 예정 공연'}
                            </div>
                            <div
                                className={`text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}
                            >
                                {concertData.concertDate}{' '}
                                {concertData.startTime}
                            </div>
                        </div>
                    </div>
                )}

                {/* 설명 텍스트 - 콘서트 페이지 스타일 */}
                <div
                    className={`mb-6 text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}
                >
                    <p>
                        {isPastConcert
                            ? '이미 종료된 공연의 AI 요약은 수정할 수 없습니다. 진행 중이거나 예정된 공연만 AI 요약을 재생성할 수 있습니다.'
                            : '현재 콘서트의 리뷰를 바탕으로 AI 요약을 새로 생성합니다. 생성된 AI 요약은 콘서트 상세 정보에 바로 반영됩니다.'}
                    </p>
                    {cooldownRemaining > 0 && !isPastConcert && (
                        <p className="text-amber-400 text-sm mt-2">
                            ⏰ 연속 요청 방지를 위해 {cooldownRemaining}초 후
                            재시도할 수 있습니다.
                        </p>
                    )}
                </div>

                {/* 현재 AI 요약 - 콘서트 페이지 스타일 */}
                <div className="mb-4">
                    <h4
                        className={`font-semibold text-white mb-3 flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}
                    >
                        <Clock size={16} className="text-gray-400" />
                        현재 AI 요약
                    </h4>

                    <div
                        className="p-4 rounded-lg"
                        style={{
                            backgroundColor: '#374151', // gray-700
                            border: '1px solid #4b5563', // gray-600
                        }}
                    >
                        {currentAiSummary ? (
                            <p
                                className={`text-gray-200 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}
                            >
                                {currentAiSummary}
                            </p>
                        ) : (
                            <p
                                className={`text-gray-400 italic ${isMobile ? 'text-sm' : 'text-base'}`}
                            >
                                아직 AI 요약이 생성되지 않았습니다.
                            </p>
                        )}
                    </div>
                </div>

                {/* 성공 메시지 - 콘서트 페이지 스타일 */}
                {success && !error && (
                    <div
                        className="flex items-center gap-3 p-4 rounded-lg mb-4"
                        style={{
                            backgroundColor: '#064e3b', // green-900
                            border: '1px solid #059669', // green-600
                        }}
                    >
                        <CheckCircle size={16} className="text-green-400" />
                        <span
                            className={`text-green-100 font-medium ${isMobile ? 'text-sm' : 'text-base'}`}
                        >
                            AI 요약이 성공적으로 재생성되었습니다!
                            {lastRegeneratedAt && (
                                <span className="text-green-200 font-normal ml-2">
                                    ({lastRegeneratedAt.toLocaleTimeString()})
                                </span>
                            )}
                        </span>
                    </div>
                )}

                {/* 새로 생성된 AI 요약 - 콘서트 페이지 스타일 */}
                {newSummary && (
                    <div className="mb-4">
                        <h4
                            className={`font-semibold text-green-400 mb-3 flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg'}`}
                        >
                            <CheckCircle size={16} />
                            새로 생성된 AI 요약
                        </h4>

                        <div
                            className="p-4 rounded-lg"
                            style={{
                                backgroundColor: '#064e3b', // green-900
                                border: '1px solid #059669', // green-600
                            }}
                        >
                            <p
                                className={`text-green-100 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}
                            >
                                {newSummary}
                            </p>
                        </div>
                    </div>
                )}

                {/* 에러 메시지 - 콘서트 페이지 스타일 */}
                {error && (
                    <div
                        className="flex items-start gap-3 p-4 rounded-lg"
                        style={{
                            backgroundColor: '#7f1d1d', // red-900
                            border: '1px solid #dc2626', // red-600
                        }}
                    >
                        <AlertCircle
                            size={16}
                            className="text-red-400 mt-0.5 flex-shrink-0"
                        />
                        <div>
                            <h4
                                className={`font-semibold text-red-100 mb-1 ${isMobile ? 'text-sm' : 'text-base'}`}
                            >
                                {error.message ||
                                    'AI 요약 재생성에 실패했습니다'}
                            </h4>
                        </div>
                    </div>
                )}
            </div>

            {/* 과거 공연 경고 알림 - 콘서트 페이지 스타일 */}
            {showPastConcertAlert && (
                <div
                    className="fixed top-6 right-6 z-50 max-w-sm"
                    style={{
                        backgroundColor: '#7f1d1d', // red-900
                        border: '1px solid #dc2626', // red-600
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.25)',
                        transform: showPastConcertAlert
                            ? 'translateX(0)'
                            : 'translateX(100%)',
                        transition: 'transform 0.3s ease-in-out',
                    }}
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle
                            size={16}
                            className="text-red-400 mt-0.5 flex-shrink-0"
                        />
                        <div>
                            <h4 className="font-semibold text-red-100 text-sm mb-1">
                                이미 종료된 공연입니다
                            </h4>
                            <p className="text-red-200 text-xs leading-relaxed">
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
