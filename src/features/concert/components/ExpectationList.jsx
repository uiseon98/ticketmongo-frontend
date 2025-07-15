// src/features/concert/components/ExpectationList.jsx (Responsive Version)

// ===== IMPORT 섹션 =====
import React, { useCallback, useState, useEffect } from 'react';
// useCallback: 이벤트 핸들러 최적화

// 기대평 관련 타입과 상수들을 import
import {
    ExpectationRatingLabels,
    ExpectationRatingEmojis,
    ExpectationRatingColors,
} from '../types/expectation.js';

/**
 * ===== Responsive ExpectationList 컴포넌트 =====
 *
 * 🎯 주요 역할:
 * 1. **기대평 목록 표시**: 콘서트의 관람 전 기대평 목록을 카드 형태로 렌더링
 * 2. **기대점수 시각화**: 1-5점 기대점수를 별과 이모지로 표시
 * 3. **페이지네이션**: 페이지 이동 및 페이지 크기 변경 기능
 * 4. **상태 관리**: 로딩, 에러, 빈 상태 처리
 * 5. **기대평 액션**: 개별 기대평 클릭, 수정, 삭제 기능
 * 6. **완전 반응형**: 모바일, 태블릿, 데스크톱 최적화
 *
 * 🔄 Hook 연동:
 * - useExpectations hook과 완전 연동
 * - 자동 페이지네이션 처리
 * - 기대평 액션 이벤트 전달
 *
 * 💡 리뷰와의 차이점:
 * - 기대평: 관람 **전** 작성, 기대점수(1-5), 정렬 옵션 없음, 노란색 테마
 * - 리뷰: 관람 **후** 작성, 평점(1-5), 다양한 정렬 옵션, 파란색 테마
 *
 * 📱 반응형 특징:
 * - 모바일 우선 설계
 * - 터치 친화적 인터페이스
 * - 적응형 레이아웃
 * - 스크린 크기별 최적화
 */
const ExpectationList = ({
    // ===== 데이터 props (useExpectations hook에서) =====
    expectations = [], // 기대평 목록 (useExpectations.expectations)
    loading = false, // 로딩 상태 (useExpectations.loading)
    error = null, // 에러 상태 (useExpectations.error)

    // ===== 페이지네이션 props =====
    currentPage = 0, // 현재 페이지 (useExpectations.currentPage)
    totalPages = 0, // 전체 페이지 수 (useExpectations.totalPages)
    totalElements = 0, // 전체 기대평 수 (useExpectations.totalElements)
    pageSize = 10, // 페이지 크기 (useExpectations.pageSize)

    // ===== 액션 props =====
    onExpectationClick, // 기대평 클릭 핸들러 (상세보기 또는 수정)
    onPageChange, // 페이지 변경 핸들러 (useExpectations.goToPage)
    onPageSizeChange, // 페이지 크기 변경 핸들러 (useExpectations.changePageSize)
    onRefresh, // 새로고침 핸들러 (useExpectations.refresh)
    currentUserId, // 현재 사용자 ID
    onEditClick, // 수정 버튼 클릭 핸들러
    onDeleteClick, // 삭제 버튼 클릭 핸들러
    onCreateExpectation,
    onEditExpectation,
    onDeleteExpectation,
    expandedItems, // 펼친 아이템들

    // ===== UI 제어 props =====
    showPagination = true, // 페이지네이션 표시 여부
    showRefreshButton = false, // 새로고침 버튼 표시 여부
    allowFiltering = false, // 기대점수별 필터링 허용 여부

    // ===== 스타일 props =====
    className = '', // 추가 CSS 클래스
    compact = false, // 컴팩트 모드 (간소화된 UI)
}) => {
    const [hoveredExpectationId, setHoveredExpectationId] = useState(null);
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

    // ===== 이벤트 핸들러들 =====

    /**
     * 페이지 변경 핸들러
     */
    const handlePageChange = useCallback(
        (newPage) => {
            if (onPageChange && typeof onPageChange === 'function') {
                onPageChange(newPage);
            }
        },
        [onPageChange],
    );

    /**
     * 페이지 크기 변경 핸들러
     */
    const handlePageSizeChange = useCallback(
        (event) => {
            const newSize = parseInt(event.target.value, 10);
            if (onPageSizeChange && typeof onPageSizeChange === 'function') {
                onPageSizeChange(newSize);
            }
        },
        [onPageSizeChange],
    );

    /**
     * 기대평 클릭 핸들러
     */
    const handleExpectationClick = useCallback(
        (expectation) => {
            if (
                onExpectationClick &&
                typeof onExpectationClick === 'function'
            ) {
                onExpectationClick(expectation);
            }
        },
        [onExpectationClick],
    );

    /**
     * 새로고침 핸들러
     */
    const handleRefresh = useCallback(() => {
        if (onRefresh && typeof onRefresh === 'function') {
            onRefresh();
        }
    }, [onRefresh]);

    // ===== 유틸리티 함수들 =====

    /**
     * 날짜 포맷팅 함수 (반응형)
     */
    const formatDate = useCallback(
        (dateString) => {
            try {
                const date = new Date(dateString);
                if (isMobile) {
                    // 모바일에서는 짧은 형식
                    return date.toLocaleDateString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                    });
                }
                return date.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });
            } catch (error) {
                return dateString;
            }
        },
        [isMobile],
    );

    /**
     * 기대점수 별 표시 함수 (반응형)
     */
    const renderExpectationStars = useCallback(
        (rating) => {
            const stars = [];
            const starSize = isMobile ? '14px' : compact ? '14px' : '16px';

            for (let i = 1; i <= 5; i++) {
                stars.push(
                    <span
                        key={i}
                        style={{
                            color: i <= rating ? '#f59e0b' : '#4b5563', // 노란색 테마
                            fontSize: starSize,
                        }}
                    >
                        ★
                    </span>,
                );
            }
            return stars;
        },
        [compact, isMobile],
    );

    /**
     * 표시할 페이지 번호 배열 생성 (반응형)
     */
    const getVisiblePageNumbers = useCallback(() => {
        const visiblePages = [];
        const maxVisible = isMobile ? 3 : 5; // 모바일에서는 더 적은 페이지 표시

        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) {
                visiblePages.push(i);
            }
        } else {
            const start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
            const end = Math.min(
                totalPages - 1,
                currentPage + Math.floor(maxVisible / 2),
            );

            for (let i = start; i <= end; i++) {
                visiblePages.push(i);
            }

            if (start > 0) {
                visiblePages.unshift(0);
                if (start > 1) {
                    visiblePages.splice(1, 0, '...');
                }
            }

            if (end < totalPages - 1) {
                if (end < totalPages - 2) {
                    visiblePages.push('...');
                }
                visiblePages.push(totalPages - 1);
            }
        }

        return visiblePages;
    }, [currentPage, totalPages, isMobile]);

    // ===== 반응형 스타일 정의 =====

    /**
     * 컨테이너 스타일 (반응형)
     */
    const containerStyles = {
        backgroundColor: '#374151',
        borderRadius: '8px',
        border: '1px solid #4B5563',
        padding: isMobile ? '12px' : compact ? '12px' : '16px',
        color: '#FFFFFF',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
    };

    /**
     * 헤더 스타일 (반응형)
     */
    const headerStyles = {
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'stretch' : 'center',
        marginBottom: compact ? '12px' : '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid #4b5563',
        gap: isMobile ? '12px' : '16px',
    };

    /**
     * 제목 스타일 (반응형)
     */
    const titleStyles = {
        fontSize: isMobile ? '16px' : compact ? '16px' : '18px',
        fontWeight: 'bold',
        color: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
    };

    /**
     * 액션 컨테이너 스타일 (반응형)
     */
    const actionContainerStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '8px' : '12px',
        width: isMobile ? '100%' : 'auto',
    };

    /**
     * 기대평 카드 스타일 (반응형)
     */
    const expectationCardStyles = {
        padding: isMobile ? '16px' : compact ? '12px' : '16px',
        border: '1px solid #4B5563',
        borderRadius: '8px',
        marginBottom: isMobile ? '16px' : '12px',
        backgroundColor: '#1E293B',
        cursor: onExpectationClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        color: '#FFFFFF',
        width: '100%',
        boxSizing: 'border-box',
    };

    /**
     * 페이지네이션 스타일 (반응형)
     */
    const paginationStyles = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: isMobile ? '4px' : '8px',
        marginTop: '20px',
        padding: isMobile ? '8px' : '12px',
        flexWrap: 'wrap',
    };

    /**
     * 페이지 버튼 기본 스타일 (반응형)
     */
    const pageButtonBaseStyles = {
        padding: isMobile ? '8px 12px' : '6px 12px',
        border: '1px solid #4B5563',
        borderRadius: '6px',
        backgroundColor: '#374151',
        color: '#FFFFFF',
        cursor: 'pointer',
        fontSize: isMobile ? '16px' : '14px',
        transition: 'all 0.2s ease',
        minHeight: isMobile ? '44px' : 'auto', // 터치 친화적
        minWidth: isMobile ? '44px' : 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    };

    /**
     * 활성 페이지 버튼 스타일
     */
    const activePageButtonStyles = {
        ...pageButtonBaseStyles,
        backgroundColor: '#f59e0b', // 노란색 테마
        color: '#ffffff',
        borderColor: '#f59e0b',
    };

    // ===== 조건부 렌더링 =====

    /**
     * 로딩 상태 (반응형)
     */
    if (loading) {
        return (
            <div
                className={`expectation-list ${className}`}
                style={containerStyles}
            >
                <div style={headerStyles}>
                    <div style={titleStyles}>✨ 기대평</div>
                </div>

                {/* 로딩 스켈레톤 - 반응형 */}
                <div>
                    {Array.from({ length: isMobile ? 2 : 3 }, (_, index) => (
                        <div
                            key={`skeleton-${index}`}
                            style={{
                                padding: isMobile
                                    ? '16px'
                                    : compact
                                      ? '12px'
                                      : '16px',
                                border: '1px solid #4B5563',
                                borderRadius: '8px',
                                marginBottom: isMobile ? '16px' : '12px',
                                backgroundColor: '#1E293B',
                                cursor: 'default',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    alignItems: isMobile
                                        ? 'flex-start'
                                        : 'center',
                                    marginBottom: '8px',
                                    gap: isMobile ? '8px' : '12px',
                                }}
                            >
                                <div
                                    style={{
                                        width: isMobile ? '80px' : '100px',
                                        height: '16px',
                                        backgroundColor: '#374151',
                                        borderRadius: '4px',
                                        animation: 'pulse 2s infinite',
                                    }}
                                />
                                <div
                                    style={{
                                        width: '60px',
                                        height: '16px',
                                        backgroundColor: '#374151',
                                        borderRadius: '4px',
                                        animation: 'pulse 2s infinite',
                                    }}
                                />
                            </div>
                            <div
                                style={{
                                    width: '100%',
                                    height: isMobile ? '60px' : '40px',
                                    backgroundColor: '#374151',
                                    borderRadius: '4px',
                                    animation: 'pulse 2s infinite',
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        color: '#9CA3AF',
                        fontSize: isMobile ? '16px' : '14px',
                        marginTop: '16px',
                        padding: isMobile ? '20px' : '16px',
                    }}
                >
                    기대평을 불러오는 중...
                </div>

                {/* CSS 애니메이션 */}
                <style>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: 0.6; }
                    }
                `}</style>
            </div>
        );
    }

    /**
     * 에러 상태 (반응형)
     */
    if (error) {
        return (
            <div
                className={`expectation-list ${className}`}
                style={containerStyles}
            >
                <div style={headerStyles}>
                    <div style={titleStyles}>✨ 기대평</div>
                    {showRefreshButton && (
                        <button
                            onClick={handleRefresh}
                            style={{
                                padding: isMobile ? '12px 16px' : '8px 12px',
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: isMobile ? '16px' : '12px',
                                cursor: 'pointer',
                                minHeight: isMobile ? '44px' : 'auto',
                            }}
                        >
                            🔄 다시 시도
                        </button>
                    )}
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        padding: isMobile ? '40px 20px' : '40px 20px',
                    }}
                >
                    <div
                        style={{
                            fontSize: isMobile ? '40px' : '48px',
                            marginBottom: '16px',
                        }}
                    >
                        😵
                    </div>
                    <h3
                        style={{
                            color: '#dc2626',
                            marginBottom: '8px',
                            fontSize: isMobile ? '20px' : '18px',
                        }}
                    >
                        기대평을 불러올 수 없습니다
                    </h3>
                    <p
                        style={{
                            color: '#6b7280',
                            fontSize: isMobile ? '16px' : '14px',
                            lineHeight: '1.5',
                        }}
                    >
                        {typeof error === 'string'
                            ? error
                            : '알 수 없는 오류가 발생했습니다.'}
                    </p>
                </div>
            </div>
        );
    }

    /**
     * 기대평이 없는 상태 (반응형)
     */
    if (!expectations || expectations.length === 0) {
        return (
            <div
                className={`expectation-list ${className}`}
                style={containerStyles}
            >
                <div style={headerStyles}>
                    <div style={titleStyles}>
                        ✨ 기대평 (0개)
                        <span
                            style={{
                                fontSize: isMobile ? '12px' : '11px',
                                backgroundColor: '#fef3c7',
                                color: '#92400e',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontWeight: 'normal',
                                marginLeft: '8px',
                            }}
                        >
                            관람 전
                        </span>
                    </div>

                    {currentUserId && (
                        <button
                            onClick={onCreateExpectation}
                            style={{
                                padding: isMobile ? '12px 16px' : '8px 12px',
                                backgroundColor: '#f59e0b',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: isMobile ? '16px' : '12px',
                                cursor: 'pointer',
                                minHeight: isMobile ? '44px' : 'auto',
                                width: isMobile ? '100%' : 'auto',
                            }}
                        >
                            ✨ 기대평 작성
                        </button>
                    )}
                </div>

                <div
                    style={{
                        textAlign: 'center',
                        padding: isMobile ? '40px 20px' : '40px 20px',
                    }}
                >
                    <div
                        style={{
                            fontSize: isMobile ? '40px' : '48px',
                            marginBottom: '16px',
                        }}
                    >
                        ✨
                    </div>
                    <h3
                        style={{
                            color: '#6b7280',
                            marginBottom: '8px',
                            fontSize: isMobile ? '20px' : '18px',
                        }}
                    >
                        아직 작성된 기대평이 없습니다
                    </h3>
                    <p
                        style={{
                            color: '#9ca3af',
                            fontSize: isMobile ? '16px' : '14px',
                            lineHeight: '1.5',
                            marginBottom: isMobile ? '24px' : '16px',
                        }}
                    >
                        공연 전에 기대평을 작성해보세요!
                    </p>

                    {currentUserId && (
                        <button
                            onClick={onCreateExpectation}
                            style={{
                                padding: isMobile ? '16px 24px' : '12px 20px',
                                backgroundColor: '#f59e0b',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: isMobile ? '18px' : '14px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                minHeight: isMobile ? '48px' : 'auto',
                                width: isMobile ? '100%' : 'auto',
                                maxWidth: isMobile ? '280px' : 'none',
                            }}
                        >
                            ✨ 첫 번째 기대평 작성하기
                        </button>
                    )}

                    {!compact && (
                        <div
                            style={{
                                marginTop: isMobile ? '24px' : '16px',
                                padding: isMobile ? '16px' : '12px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '6px',
                                fontSize: isMobile ? '14px' : '12px',
                                color: '#92400e',
                                lineHeight: '1.5',
                            }}
                        >
                            💡 기대평은 관람 전에 작성하는 기대감 표현입니다
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ===== 메인 렌더링 (정상 상태) - 반응형 =====

    return (
        <div
            className={`expectation-list ${className}`}
            style={containerStyles}
        >
            {/* 헤더 - 반응형 */}
            <div style={headerStyles}>
                <div style={titleStyles}>
                    ✨ 기대평 ({totalElements.toLocaleString()}개)
                    <span
                        style={{
                            fontSize: isMobile ? '12px' : '11px',
                            backgroundColor: '#374151',
                            color: '#F59E0B', // 노란색 테마
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontWeight: 'normal',
                            marginLeft: '8px',
                        }}
                    >
                        관람 전
                    </span>
                </div>

                <div style={actionContainerStyles}>
                    {currentUserId && (
                        <button
                            onClick={onCreateExpectation}
                            style={{
                                padding: isMobile ? '12px 16px' : '8px 12px',
                                backgroundColor: '#f59e0b', // 노란색 테마
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: isMobile ? '16px' : '12px',
                                cursor: 'pointer',
                                minHeight: isMobile ? '44px' : 'auto',
                                flex: isMobile ? 1 : 'none',
                            }}
                        >
                            ✨ 기대평 작성
                        </button>
                    )}

                    {/* 새로고침 버튼 */}
                    {showRefreshButton && (
                        <button
                            onClick={handleRefresh}
                            style={{
                                padding: isMobile ? '12px' : '8px',
                                backgroundColor: 'transparent',
                                border: '1px solid #6b7280',
                                borderRadius: '6px',
                                fontSize: isMobile ? '16px' : '12px',
                                color: '#9ca3af',
                                cursor: 'pointer',
                                minHeight: isMobile ? '44px' : 'auto',
                                minWidth: isMobile ? '44px' : 'auto',
                            }}
                        >
                            🔄
                        </button>
                    )}
                </div>
            </div>

            {/* 기대평 목록 - 반응형 */}
            <div>
                {expectations.map((expectation) => (
                    <div
                        key={expectation.id}
                        style={{
                            ...expectationCardStyles,
                            ...(hoveredExpectationId === expectation.id &&
                            onExpectationClick &&
                            !isMobile
                                ? {
                                      boxShadow:
                                          '0 2px 8px rgba(245, 158, 11, 0.3)', // 노란색 그림자
                                      transform: 'translateY(-1px)',
                                      borderColor: '#F59E0B', // 호버 시 노란색 테두리
                                  }
                                : {}),
                        }}
                        onClick={() => handleExpectationClick(expectation)}
                        onMouseEnter={() =>
                            onExpectationClick &&
                            !isMobile &&
                            setHoveredExpectationId(expectation.id)
                        }
                        onMouseLeave={() => setHoveredExpectationId(null)}
                    >
                        {/* 기대평 헤더 - 반응형 */}
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: isMobile ? 'column' : 'row',
                                justifyContent: 'space-between',
                                alignItems: isMobile ? 'flex-start' : 'center',
                                marginBottom: '8px',
                                gap: isMobile ? '8px' : '8px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: isMobile
                                            ? '16px'
                                            : compact
                                              ? '12px'
                                              : '14px',
                                        fontWeight: '600',
                                        color: '#FFFFFF',
                                    }}
                                >
                                    {expectation.userNickname}
                                </span>
                                <span
                                    style={{
                                        fontSize: isMobile ? '14px' : '11px',
                                        color: '#9CA3AF',
                                    }}
                                >
                                    {formatDate(expectation.createdAt)}
                                </span>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                {renderExpectationStars(
                                    expectation.expectationRating,
                                )}
                                <span
                                    style={{
                                        fontSize: isMobile ? '14px' : '12px',
                                        color: '#9CA3AF',
                                        marginLeft: '4px',
                                    }}
                                >
                                    ({expectation.expectationRating}/5)
                                </span>
                            </div>
                        </div>

                        {/* 기대평 내용 - 반응형 */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                            }}
                        >
                            <span
                                style={{
                                    fontSize: isMobile
                                        ? '20px'
                                        : compact
                                          ? '18px'
                                          : '20px',
                                }}
                            >
                                {
                                    ExpectationRatingEmojis[
                                        expectation.expectationRating
                                    ]
                                }
                            </span>
                            <span
                                style={{
                                    fontSize: isMobile
                                        ? '16px'
                                        : compact
                                          ? '13px'
                                          : '14px',
                                    fontWeight: '600',
                                    color: '#F59E0B',
                                }}
                            >
                                {
                                    ExpectationRatingLabels[
                                        expectation.expectationRating
                                    ]
                                }
                            </span>
                        </div>

                        {/* 기대평 텍스트 - 반응형 */}
                        <div>
                            <p
                                style={{
                                    fontSize: isMobile
                                        ? '16px'
                                        : compact
                                          ? '13px'
                                          : '14px',
                                    color: '#D1D5DB',
                                    lineHeight: '1.6',
                                    margin: '0',
                                    wordBreak: 'keep-all',
                                }}
                            >
                                {expectation.comment.length >
                                    (isMobile ? 80 : 100) &&
                                !compact &&
                                !expandedItems?.has(expectation.id)
                                    ? expectation.comment.substring(
                                          0,
                                          isMobile ? 80 : 100,
                                      ) + '...'
                                    : expectation.comment}
                            </p>
                            {expectation.comment.length >
                                (isMobile ? 80 : 100) &&
                                !compact && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onExpectationClick(expectation);
                                        }}
                                        style={{
                                            color: '#F59E0B',
                                            fontSize: isMobile
                                                ? '14px'
                                                : '12px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            marginTop: '8px',
                                            padding: isMobile
                                                ? '8px 0'
                                                : '4px 0',
                                        }}
                                    >
                                        {expandedItems?.has(expectation.id)
                                            ? '접기'
                                            : '더보기'}
                                    </button>
                                )}
                        </div>

                        {/* 수정/삭제 버튼 - 반응형 */}
                        {currentUserId === expectation.userId && (
                            <div
                                style={{
                                    marginTop: isMobile ? '16px' : '12px',
                                    display: 'flex',
                                    gap: isMobile ? '8px' : '8px',
                                    justifyContent: 'flex-end',
                                    flexDirection: 'row',
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditExpectation?.(expectation);
                                    }}
                                    style={{
                                        padding: isMobile
                                            ? '8px 12px'
                                            : '6px 10px',
                                        backgroundColor: '#F59E0B',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: isMobile ? '14px' : '12px',
                                        cursor: 'pointer',
                                        minHeight: isMobile ? '40px' : 'auto',
                                        flex: isMobile ? 1 : 'none',
                                    }}
                                >
                                    ✏️ 수정
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteExpectation?.(expectation.id);
                                    }}
                                    style={{
                                        padding: isMobile
                                            ? '8px 12px'
                                            : '6px 10px',
                                        backgroundColor: '#ef4444',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontSize: isMobile ? '14px' : '12px',
                                        cursor: 'pointer',
                                        minHeight: isMobile ? '40px' : 'auto',
                                        flex: isMobile ? 1 : 'none',
                                    }}
                                >
                                    🗑️ 삭제
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 페이지네이션 - 반응형 */}
            {showPagination && totalPages > 1 && (
                <div style={paginationStyles}>
                    {/* 이전 페이지 버튼 */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        style={{
                            ...pageButtonBaseStyles,
                            opacity: currentPage === 0 ? 0.5 : 1,
                            cursor:
                                currentPage === 0 ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {isMobile ? '‹' : '← 이전'}
                    </button>

                    {/* 페이지 번호들 */}
                    {getVisiblePageNumbers().map((pageNum, index) => {
                        if (pageNum === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    style={{
                                        padding: isMobile
                                            ? '8px 4px'
                                            : '6px 4px',
                                        color: '#9ca3af',
                                    }}
                                >
                                    ...
                                </span>
                            );
                        }

                        return (
                            <button
                                key={pageNum}
                                onClick={() => handlePageChange(pageNum)}
                                style={
                                    pageNum === currentPage
                                        ? activePageButtonStyles
                                        : pageButtonBaseStyles
                                }
                            >
                                {pageNum + 1}
                            </button>
                        );
                    })}

                    {/* 다음 페이지 버튼 */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        style={{
                            ...pageButtonBaseStyles,
                            opacity: currentPage >= totalPages - 1 ? 0.5 : 1,
                            cursor:
                                currentPage >= totalPages - 1
                                    ? 'not-allowed'
                                    : 'pointer',
                        }}
                    >
                        {isMobile ? '›' : '다음 →'}
                    </button>
                </div>
            )}

            {/* 페이지 크기 선택 - 반응형 */}
            {showPagination && totalElements > 10 && (
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '12px',
                    }}
                >
                    <select
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        style={{
                            padding: isMobile ? '8px 12px' : '6px 10px',
                            border: '1px solid #6b7280',
                            borderRadius: '6px',
                            fontSize: isMobile ? '16px' : '12px',
                            backgroundColor: '#374151',
                            color: '#ffffff',
                            minHeight: isMobile ? '44px' : 'auto',
                        }}
                    >
                        <option value={10}>10개씩 보기</option>
                        <option value={20}>20개씩 보기</option>
                        <option value={50}>50개씩 보기</option>
                    </select>
                </div>
            )}

            {/* 기대평 vs 리뷰 안내 - 반응형 */}
            {!compact && totalElements > 0 && (
                <div
                    style={{
                        marginTop: '16px',
                        padding: isMobile ? '16px' : '12px',
                        backgroundColor: '#374151',
                        borderRadius: '6px',
                        fontSize: isMobile ? '14px' : '12px',
                        color: '#D1D5DB',
                        border: '1px solid #4B5563',
                        lineHeight: '1.5',
                        textAlign: isMobile ? 'center' : 'left',
                    }}
                >
                    💡 기대평은 공연 관람 <strong>전</strong>에 작성하는
                    기대감이며, 관람 <strong>후</strong>에는 리뷰를 작성하실 수
                    있습니다.
                </div>
            )}
        </div>
    );
};

// ===== 기본 PROPS =====
ExpectationList.defaultProps = {
    expectations: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
    showPagination: true,
    showRefreshButton: false,
    allowFiltering: false,
    className: '',
    compact: false,
};

export default ExpectationList;
