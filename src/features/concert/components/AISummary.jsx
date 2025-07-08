// src/features/concert/components/AISummary.jsx

// ===== IMPORT 섹션 =====
import React, { useState, useCallback } from 'react';

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

    // ===== 텍스트 처리 함수들 (순서 중요!) =====

    /**
     * 마크다운 형식을 HTML로 변환하는 함수
     * ### ## # -> <strong> 태그로 변환
     * 줄바꿈 처리
     */
    const formatMarkdownToHtml = useCallback((text) => {
        if (!text || typeof text !== 'string') return '';

        let formattedText = text;

        // ### 전체 평가 - 파란색 (다크 배경에 맞는 세련된 파란색)
        formattedText = formattedText.replace(
            /### (.+?)(?=\n|$)/g,
            '<strong style="font-size: 14px; color: #60A5FA; display: block; margin: 8px 0;">$1</strong>'
        );

        // ## 좋은 점, 아쉬운 점
        formattedText = formattedText.replace(
            /## (.+?)(?=\n|$)/g,
            '<strong style="font-size: 14px; color: #FFFFFF; display: block; margin: 8px 0;">$1</strong>'
        );

        // # 기타 헤더
        formattedText = formattedText.replace(
            /# (.+?)(?=\n|$)/g,
            '<strong style="font-size: 14px; color: #FFFFFF; display: block; margin: 8px 0;">$1</strong>'
        );

        // 줄바꿈을 <br> 태그로 변환
        formattedText = formattedText.replace(/\n/g, '<br>');

        // 연속된 <br> 태그 정리 (3개 이상을 2개로)
        formattedText = formattedText.replace(/(<br>\s*){3,}/g, '<br><br>');

        formattedText = formattedText.replace(/[^\u1100-\u11FF\u3130-\u318F\uAC00-\uD7A3\sa-zA-Z0-9.,!?()'":-<>=#:]/g, '');

        return formattedText;
    }, []);

    /**
     * 요약 텍스트가 길어서 줄여야 하는지 판단
     */
    const shouldTruncate = useCallback(() => {
        return summary && summary.length > maxLength;
    }, [summary, maxLength]);

    /**
     * 표시할 텍스트 결정 (전체 vs 일부)
     */
    const getDisplayText = useCallback(() => {
        if (!summary) return '';

        let displayText;

        if (!shouldTruncate() || isExpanded) {
            displayText = summary; // 전체 텍스트
        } else {
            // 접힌 상태면 maxLength만큼 자르고 "..." 추가
            displayText = summary.substring(0, maxLength).trim() + '...';
        }

        // 마크다운을 HTML로 변환
        return formatMarkdownToHtml(displayText);
    }, [summary, shouldTruncate, isExpanded, maxLength, formatMarkdownToHtml]);

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

    // ===== 스타일 정의 =====

    const containerStyles = {
        padding: compact ? '12px' : '16px',
        backgroundColor: '#374151',
        border: '1px solid #4B5563',
        borderRadius: '8px',
        marginBottom: compact ? '12px' : '16px',
    };

    const headerStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
        paddingBottom: '12px',
        borderBottom: '1px solid #4B5563',
    };

    const titleStyles = {
        fontSize: compact ? '14px' : '16px',
        fontWeight: '600',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };

    const refreshButtonStyles = {
        padding: '4px 8px',
        backgroundColor: 'transparent',
        border: '1px solid #4B5563',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#9CA3AF',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: loading ? 0.6 : 1,
    };

    const summaryTextStyles = {
        fontSize: compact ? '13px' : '14px',
        lineHeight: '1.6',
        color: '#D1D5DB',
        marginBottom: shouldTruncate() ? '8px' : '0',
    };

    const toggleButtonStyles = {
        padding: '4px 8px',
        backgroundColor: 'transparent',
        border: 'none',
        color: '#3b82f6',
        fontSize: '12px',
        cursor: 'pointer',
        textDecoration: 'underline',
    };

    const skeletonStyles = {
        height: '20px',
        backgroundColor: '#e2e8f0',
        borderRadius: '4px',
        marginBottom: '8px',
        animation: 'pulse 2s infinite',
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
                </div>

                <div
                    style={{
                        fontSize: '12px',
                        color: '#64748b',
                        textAlign: 'center',
                        marginTop: '8px',
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
                        >
                            🔄 새로고침
                        </button>
                    )}
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: '#9CA3AF',
                    }}
                >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                        🤷‍♂️
                    </div>
                    <div style={{ fontSize: '14px', marginBottom: '4px' }}>
                        {summaryStatus === 'empty'
                            ? 'AI 요약 정보가 없습니다'
                            : summary}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                        리뷰가 충분히 쌓이면 AI 요약이 자동으로 생성됩니다
                    </div>
                </div>
            </div>
        );
    }

    // ===== 메인 렌더링 (정상 상태) =====

    return (
        <div className={`ai-summary ${className}`} style={containerStyles}>
            {/* 헤더 */}
            <div style={headerStyles}>
                <div style={titleStyles}>
                    🤖 AI 요약
                    <span
                        style={{
                            fontSize: '11px',
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
                            if (!loading) {
                                e.target.style.backgroundColor = '#4B5563';
                                e.target.style.borderColor = '#6B7280';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.borderColor = '#4B5563';
                            }
                        }}
                    >
                        🔄 새로고침
                    </button>
                )}
            </div>

            {/* AI 요약 텍스트 - dangerouslySetInnerHTML 사용 */}
            <div
                style={summaryTextStyles}
                dangerouslySetInnerHTML={{ __html: getDisplayText() }}
                role="article"
                aria-label="AI 생성 콘서트 요약"
            />

            {/* 펼치기/접기 버튼 */}
            {shouldTruncate() && (
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={handleToggleExpand}
                        style={toggleButtonStyles}
                        aria-label={isExpanded ? '요약 접기' : '전체 보기'}
                    >
                        {isExpanded ? '▲ 접기' : '▼ 더보기'}
                    </button>
                </div>
            )}

            {/* AI 요약 설명 */}
            {!compact && (
                <div
                    style={{
                        marginTop: '12px',
                        padding: '8px',
                        backgroundColor: '#1E293B',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#9CA3AF',
                        border: '1px solid #374151',
                    }}
                >
                    💡 이 요약은 실제 관람객들의 후기를 바탕으로 AI가 자동 생성했습니다
                </div>
            )}
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