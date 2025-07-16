// src/features/concert/components/AISummary.jsx (Responsive Version)

// ===== IMPORT 섹션 =====
import React, { useState, useCallback, useEffect } from 'react';

/**
 * ===== Responsive AISummary 컴포넌트 =====
 *
 * 🎯 주요 역할:
 * 1. **AI 요약 표시**: 콘서트 리뷰 기반 AI 생성 요약 표시
 * 2. **마크다운 처리**: 구조화된 마크다운을 HTML로 변환
 * 3. **펼치기/접기**: 긴 텍스트의 접기/펼치기 기능
 * 4. **상태 관리**: 로딩, 에러, 빈 상태 처리
 * 5. **완전 반응형**: 모바일, 태블릿, 데스크톱 최적화
 *
 * 📱 반응형 특징:
 * - 모바일 우선 설계
 * - 터치 친화적 인터페이스
 * - 적응형 텍스트 크기
 * - 스크린 크기별 최적화
 */
const AISummary = ({
    // ===== 필수 props =====
    summary, // AI 요약 텍스트 (useConcertDetail.aiSummary)
    loading = false, // AI 요약 로딩 상태 (useConcertDetail.aiSummaryLoading)

    // ===== 액션 props =====
    onRefresh, // 새로고침 함수 (useConcertDetail.fetchAISummary)

    // ===== UI 제어 props =====
    showRefreshButton = true, // 새로고침 버튼 표시 여부
    maxLength = 200, // 접기 상태에서 최대 표시 길이

    // ===== 스타일 props =====
    className = '', // 추가 CSS 클래스
    compact = false, // 컴팩트 모드
}) => {
    // ===== 상태 관리 =====
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // 화면 크기 감지
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // ===== 텍스트 처리 함수들 (순서 중요!) =====

    /**
     * 마크다운 형식을 HTML로 변환하는 함수 (반응형)
     * ### ## # -> <strong> 태그로 변환
     * 줄바꿈 처리
     */
    const formatMarkdownToHtml = useCallback(
        (text) => {
            if (!text || typeof text !== 'string') return '';

            let formattedText = text;

            // ### 전체 평가 - 파란색 (반응형 폰트 크기)
            const mainHeaderSize = isMobile ? '16px' : '14px';
            formattedText = formattedText.replace(
                /### (.+?)(?=\n|$)/g,
                `<strong style="font-size: ${mainHeaderSize}; color: #60A5FA; display: block; margin: ${isMobile ? '10px 0' : '8px 0'}; font-weight: 700;">$1</strong>`,
            );

            // ## 좋은 점, 아쉬운 점 (반응형 폰트 크기)
            const subHeaderSize = isMobile ? '15px' : '14px';
            formattedText = formattedText.replace(
                /## (.+?)(?=\n|$)/g,
                `<strong style="font-size: ${subHeaderSize}; color: #FFFFFF; display: block; margin: ${isMobile ? '10px 0 6px 0' : '8px 0'}; font-weight: 600;">$1</strong>`,
            );

            // # 기타 헤더 (반응형 폰트 크기)
            formattedText = formattedText.replace(
                /# (.+?)(?=\n|$)/g,
                `<strong style="font-size: ${subHeaderSize}; color: #FFFFFF; display: block; margin: ${isMobile ? '10px 0 6px 0' : '8px 0'}; font-weight: 600;">$1</strong>`,
            );

            // 줄바꿈을 <br> 태그로 변환
            formattedText = formattedText.replace(/\n/g, '<br>');

            // 연속된 <br> 태그 정리 (3개 이상을 2개로)
            formattedText = formattedText.replace(/(<br>\s*){3,}/g, '<br><br>');

            // 불필요한 특수문자 제거
            formattedText = formattedText.replace(
                /[^\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3\sa-zA-Z0-9.,!?()'":-<>=#:]/g,
                '',
            );

            return formattedText;
        },
        [isMobile],
    );

    /**
     * 요약 텍스트가 길어서 줄여야 하는지 판단 (반응형)
     */
    const shouldTruncate = useCallback(() => {
        if (!summary) return false;
        // 모바일에서는 더 짧게 자르기
        const adjustedMaxLength = isMobile
            ? Math.floor(maxLength * 0.8)
            : maxLength;
        return summary.length > adjustedMaxLength;
    }, [summary, maxLength, isMobile]);

    /**
     * 표시할 텍스트 결정 (전체 vs 일부) - 반응형
     */
    const getDisplayText = useCallback(() => {
        if (!summary) return '';

        let displayText;

        if (!shouldTruncate() || isExpanded) {
            displayText = summary; // 전체 텍스트
        } else {
            // 접힌 상태면 maxLength만큼 자르고 "..." 추가
            const adjustedMaxLength = isMobile
                ? Math.floor(maxLength * 0.8)
                : maxLength;
            displayText =
                summary.substring(0, adjustedMaxLength).trim() + '...';
        }

        // 마크다운을 HTML로 변환
        return formatMarkdownToHtml(displayText);
    }, [
        summary,
        shouldTruncate,
        isExpanded,
        maxLength,
        formatMarkdownToHtml,
        isMobile,
    ]);

    /**
     * AI 요약 상태 확인
     */
    const getSummaryStatus = useCallback(() => {
        if (!summary) return 'empty';

        // 백엔드에서 오는 특정 메시지들 확인
        if (
            summary === 'AI 요약 정보가 아직 생성되지 않았습니다.' ||
            summary === 'AI 요약을 불러올 수 없습니다.'
        ) {
            return 'unavailable';
        }

        return 'available';
    }, [summary]);

    // ===== 이벤트 핸들러들 =====

    /**
     * 펼치기/접기 버튼 클릭 핸들러
     */
    const handleToggleExpand = useCallback(() => {
        setIsExpanded((prev) => !prev);
    }, []);

    /**
     * 새로고침 버튼 클릭 핸들러
     */
    const handleRefresh = useCallback(() => {
        if (onRefresh && typeof onRefresh === 'function') {
            onRefresh();
        }
    }, [onRefresh]);

    // ===== 반응형 스타일 정의 =====

    const containerStyles = {
        padding: isMobile ? '16px' : compact ? '12px' : '16px',
        backgroundColor: '#374151',
        border: '1px solid #4B5563',
        borderRadius: '8px',
        marginBottom: isMobile ? '16px' : compact ? '12px' : '16px',
        width: '100%',
        boxSizing: 'border-box',
    };

    const headerStyles = {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid #4B5563',
        gap: isMobile ? '8px' : '0',
    };

    const titleStyles = {
        fontSize: isMobile ? '18px' : compact ? '14px' : '16px',
        fontWeight: '600',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
    };

    const refreshButtonStyles = {
        padding: isMobile ? '8px 12px' : '6px 10px',
        backgroundColor: 'transparent',
        border: '1px solid #4B5563',
        borderRadius: '6px',
        fontSize: isMobile ? '14px' : '12px',
        color: '#9CA3AF',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: loading ? 0.6 : 1,
        minHeight: isMobile ? '44px' : 'auto',
        width: isMobile ? '100%' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
    };

    const summaryTextStyles = {
        fontSize: isMobile ? '16px' : compact ? '13px' : '14px',
        lineHeight: isMobile ? '1.7' : '1.6',
        color: '#D1D5DB',
        marginBottom: shouldTruncate() ? (isMobile ? '12px' : '8px') : '0',
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
    };

    const toggleButtonStyles = {
        padding: isMobile ? '12px 16px' : '8px 12px',
        backgroundColor: 'transparent',
        border: isMobile ? '1px solid #3b82f6' : 'none',
        borderRadius: isMobile ? '6px' : '0',
        color: '#3b82f6',
        fontSize: isMobile ? '16px' : '12px',
        cursor: 'pointer',
        textDecoration: isMobile ? 'none' : 'underline',
        transition: 'all 0.2s ease',
        minHeight: isMobile ? '44px' : 'auto',
        width: isMobile ? '100%' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
    };

    const skeletonStyles = {
        height: isMobile ? '24px' : '20px',
        backgroundColor: '#4B5563',
        borderRadius: '4px',
        marginBottom: isMobile ? '12px' : '8px',
        animation: 'pulse 2s infinite',
    };

    const emptyStateStyles = {
        textAlign: 'center',
        padding: isMobile ? '32px 16px' : '20px',
        color: '#9CA3AF',
    };

    const explanationStyles = {
        marginTop: isMobile ? '16px' : '12px',
        padding: isMobile ? '12px' : '8px',
        backgroundColor: '#1E293B',
        borderRadius: '6px',
        fontSize: isMobile ? '13px' : '11px',
        color: '#9CA3AF',
        border: '1px solid #374151',
        lineHeight: '1.5',
        textAlign: isMobile ? 'center' : 'left',
    };

    // ===== 조건부 렌더링 =====

    if (loading) {
        return (
            <div className={`ai-summary ${className}`} style={containerStyles}>
                <div style={headerStyles}>
                    <div style={titleStyles}>🤖 AI 요약</div>
                </div>

                <div>
                    <div style={{ ...skeletonStyles, width: '100%' }} />
                    <div style={{ ...skeletonStyles, width: '85%' }} />
                    <div style={{ ...skeletonStyles, width: '92%' }} />
                    {isMobile && (
                        <div style={{ ...skeletonStyles, width: '78%' }} />
                    )}
                </div>

                <div
                    style={{
                        fontSize: isMobile ? '14px' : '12px',
                        color: '#9CA3AF',
                        textAlign: 'center',
                        marginTop: isMobile ? '12px' : '8px',
                        padding: isMobile ? '8px 0' : '0',
                    }}
                >
                    AI 요약을 생성하는 중...
                </div>

                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.5; }
                    }
                `}</style>
            </div>
        );
    }

    const summaryStatus = getSummaryStatus();

    if (summaryStatus === 'empty' || summaryStatus === 'unavailable') {
        return (
            <div className={`ai-summary ${className}`} style={containerStyles}>
                <div style={headerStyles}>
                    <div style={titleStyles}>🤖 AI 요약</div>
                    {showRefreshButton && onRefresh && (
                        <button
                            onClick={handleRefresh}
                            style={refreshButtonStyles}
                            aria-label="AI 요약 새로고침"
                            disabled={loading}
                            onMouseEnter={(e) => {
                                if (!loading && !isMobile) {
                                    e.target.style.backgroundColor = '#4B5563';
                                    e.target.style.borderColor = '#6B7280';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading && !isMobile) {
                                    e.target.style.backgroundColor =
                                        'transparent';
                                    e.target.style.borderColor = '#4B5563';
                                }
                            }}
                        >
                            {loading ? (
                                <>
                                    <span
                                        style={{
                                            width: '16px',
                                            height: '16px',
                                            border: '2px solid #9CA3AF',
                                            borderTop: '2px solid transparent',
                                            borderRadius: '50%',
                                            animation:
                                                'spin 1s linear infinite',
                                        }}
                                    ></span>
                                    생성 중...
                                </>
                            ) : (
                                <>🔄 새로고침</>
                            )}
                        </button>
                    )}
                </div>

                <div style={emptyStateStyles}>
                    <div
                        style={{
                            fontSize: isMobile ? '40px' : '32px',
                            marginBottom: isMobile ? '12px' : '8px',
                        }}
                    >
                        🤷‍♂️
                    </div>
                    <div
                        style={{
                            fontSize: isMobile ? '16px' : '14px',
                            marginBottom: '8px',
                            fontWeight: '500',
                        }}
                    >
                        {summaryStatus === 'empty'
                            ? 'AI 요약 정보가 없습니다'
                            : summary}
                    </div>
                    <div
                        style={{
                            fontSize: isMobile ? '14px' : '12px',
                            color: '#9ca3af',
                            lineHeight: '1.5',
                        }}
                    >
                        리뷰가 충분히 쌓이면 AI 요약이 자동으로 생성됩니다
                    </div>
                </div>
            </div>
        );
    }

    // ===== 메인 렌더링 (정상 상태) - 반응형 =====

    return (
        <div className={`ai-summary ${className}`} style={containerStyles}>
            {/* 헤더 - 반응형 */}
            <div style={headerStyles}>
                <div style={titleStyles}>
                    🤖 AI 요약
                    <span
                        style={{
                            fontSize: isMobile ? '12px' : '11px',
                            backgroundColor: '#374151',
                            color: '#3B82F6',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontWeight: 'normal',
                        }}
                    >
                        자동 생성
                    </span>
                </div>

                {showRefreshButton && onRefresh && (
                    <button
                        onClick={handleRefresh}
                        style={refreshButtonStyles}
                        aria-label="AI 요약 새로고침"
                        disabled={loading}
                        onMouseEnter={(e) => {
                            if (!loading && !isMobile) {
                                e.target.style.backgroundColor = '#4B5563';
                                e.target.style.borderColor = '#6B7280';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading && !isMobile) {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.borderColor = '#4B5563';
                            }
                        }}
                    >
                        {loading ? (
                            <>
                                <span
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid #9CA3AF',
                                        borderTop: '2px solid transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                    }}
                                ></span>
                                생성 중...
                            </>
                        ) : (
                            <>🔄 새로고침</>
                        )}
                    </button>
                )}
            </div>

            {/* AI 요약 텍스트 - 반응형 dangerouslySetInnerHTML 사용 */}
            <div
                style={summaryTextStyles}
                dangerouslySetInnerHTML={{ __html: getDisplayText() }}
                role="article"
                aria-label="AI 생성 콘서트 요약"
            />

            {/* 펼치기/접기 버튼 - 반응형 */}
            {shouldTruncate() && (
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleToggleExpand}
                        style={toggleButtonStyles}
                        aria-label={isExpanded ? '요약 접기' : '전체 보기'}
                        onMouseEnter={(e) => {
                            if (!isMobile) {
                                e.target.style.backgroundColor =
                                    'rgba(59, 130, 246, 0.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isMobile) {
                                e.target.style.backgroundColor = 'transparent';
                            }
                        }}
                    >
                        {isExpanded ? (
                            <>
                                <span>▲</span>
                                <span>접기</span>
                            </>
                        ) : (
                            <>
                                <span>▼</span>
                                <span>더보기</span>
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* AI 요약 설명 - 반응형 */}
            {!compact && (
                <div style={explanationStyles}>
                    💡 이 요약은 실제 관람객들의 후기를 바탕으로 AI가 자동
                    생성했습니다
                </div>
            )}

            {/* CSS 애니메이션 */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

AISummary.defaultProps = {
    loading: false,
    showRefreshButton: true,
    maxLength: 200,
    className: '',
    compact: false,
};

export default AISummary;
