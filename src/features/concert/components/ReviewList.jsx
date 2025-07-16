// src/features/concert/components/ReviewList.jsx (Responsive Version)

// ===== IMPORT 섹션 =====
import React, { useCallback, useState, useEffect } from 'react';
// useCallback: 이벤트 핸들러 최적화

// 리뷰 관련 타입과 상수들을 import
import {
    RatingLabels,
    RatingEmojis,
    RatingColors,
    ReviewSortOptions,
    SortDirectionOptions,
} from '../types/review.js';

/**
 * ===== Responsive ReviewList 컴포넌트 =====
 *
 * 🎯 주요 역할:
 * 1. **리뷰 목록 표시**: 콘서트의 관람 후기 목록을 카드 형태로 렌더링
 * 2. **정렬 기능**: 최신순, 평점순, 제목순 정렬 지원
 * 3. **페이지네이션**: 페이지 이동 및 페이지 크기 변경 기능
 * 4. **상태 관리**: 로딩, 에러, 빈 상태 처리
 * 5. **리뷰 액션**: 개별 리뷰 클릭, 수정, 삭제 기능
 * 6. **완전 반응형**: 모바일, 태블릿, 데스크톱 최적화
 *
 * 🔄 Hook 연동:
 * - useReviews hook과 완전 연동
 * - 자동 정렬 및 페이지네이션 처리
 * - 리뷰 액션 이벤트 전달
 *
 * 📱 반응형 특징:
 * - 모바일 우선 설계
 * - 터치 친화적 인터페이스
 * - 적응형 레이아웃
 * - 스크린 크기별 최적화
 */
const ReviewList = ({
    // ===== 데이터 props (useReviews hook에서) =====
    reviews = [], // 리뷰 목록 (useReviews.reviews)
    loading = false, // 로딩 상태 (useReviews.loading)
    error = null, // 에러 상태 (useReviews.error)

    // ===== 페이지네이션 props =====
    currentPage = 0, // 현재 페이지 (useReviews.currentPage)
    totalPages = 0, // 전체 페이지 수 (useReviews.totalPages)
    totalElements = 0, // 전체 리뷰 수 (useReviews.totalElements)
    pageSize = 10, // 페이지 크기 (useReviews.pageSize)

    // ===== 정렬 props =====
    sortBy = 'createdAt', // 정렬 기준 (useReviews.sortBy)
    sortDir = 'desc', // 정렬 방향 (useReviews.sortDir)

    // ===== 액션 props =====
    onReviewClick, // 리뷰 클릭 핸들러 (상세보기)
    onSortChange, // 정렬 변경 핸들러 (useReviews.changeSorting)
    onPageChange, // 페이지 변경 핸들러 (useReviews.goToPage)
    onPageSizeChange, // 페이지 크기 변경 핸들러 (useReviews.changePageSize)
    onRefresh, // 새로고침 핸들러 (useReviews.refresh)
    currentUserId, // 현재 사용자 ID
    onCreateReview, // 작성 버튼 클릭 핸들러
    onEditReview, // 수정 버튼 클릭 핸들러
    onDeleteReview, // 삭제 버튼 클릭 핸들러
    expandedItems, // 펼친 아이템들

    // ===== UI 제어 props =====
    showSortOptions = true, // 정렬 옵션 표시 여부
    showPagination = true, // 페이지네이션 표시 여부
    showRefreshButton = false, // 새로고침 버튼 표시 여부

    // ===== 스타일 props =====
    className = '', // 추가 CSS 클래스
    compact = false, // 컴팩트 모드 (간소화된 UI)
}) => {
    const [hoveredReviewId, setHoveredReviewId] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

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
     * 정렬 변경 핸들러
     */
    const handleSortChange = (newSortBy) => {
        console.log('handleSortChange 호출됨:', newSortBy);
        if (onSortChange && typeof onSortChange === 'function') {
            const newSortDir =
                newSortBy === sortBy && sortDir === 'desc' ? 'asc' : 'desc';
            onSortChange(newSortBy, newSortDir);
        }
        setSortDropdownOpen(false);
    };

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
     * 리뷰 클릭 핸들러
     */
    const handleReviewClick = useCallback(
        (review) => {
            if (onReviewClick && typeof onReviewClick === 'function') {
                onReviewClick(review);
            }
        },
        [onReviewClick],
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
     * 평점 별 표시 함수 (반응형)
     */
    const renderStars = useCallback(
        (rating) => {
            const stars = [];
            const starSize = isMobile ? '14px' : compact ? '14px' : '16px';

            for (let i = 1; i <= 5; i++) {
                stars.push(
                    <span
                        key={i}
                        style={{
                            color: i <= rating ? '#fbbf24' : '#4b5563',
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
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '8px' : '12px',
        width: isMobile ? '100%' : 'auto',
    };

    /**
     * 정렬 옵션 스타일 (반응형)
     */
    const sortContainerStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '4px' : '8px',
        position: 'relative',
        width: isMobile ? '100%' : 'auto',
    };

    /**
     * 정렬 버튼 스타일 (반응형)
     */
    const getSortButtonStyles = (isActive) => ({
        padding: isMobile ? '8px 12px' : '6px 10px',
        backgroundColor: isActive ? '#3b82f6' : 'transparent',
        color: isActive ? '#ffffff' : '#9ca3af',
        border: '1px solid ' + (isActive ? '#3b82f6' : '#6b7280'),
        borderRadius: '6px',
        fontSize: isMobile ? '14px' : '12px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        whiteSpace: 'nowrap',
        minHeight: isMobile ? '44px' : 'auto', // 터치 친화적 높이
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    /**
     * 드롭다운 스타일 (모바일용)
     */
    const dropdownStyles = {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        backgroundColor: '#1f2937',
        border: '1px solid #4b5563',
        borderRadius: '6px',
        marginTop: '4px',
        zIndex: 10,
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    };

    /**
     * 리뷰 카드 스타일 (반응형)
     */
    const reviewCardStyles = {
        padding: isMobile ? '16px' : compact ? '12px' : '16px',
        border: '1px solid #4B5563',
        borderRadius: '8px',
        marginBottom: isMobile ? '16px' : '12px',
        backgroundColor: '#1E293B',
        cursor: onReviewClick ? 'pointer' : 'default',
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
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        borderColor: '#3b82f6',
    };

    // ===== 조건부 렌더링 =====

    /**
     * 로딩 상태 (반응형)
     */
    if (loading) {
        return (
            <div className={`review-list ${className}`} style={containerStyles}>
                <div style={headerStyles}>
                    <div style={titleStyles}>📝 관람 후기</div>
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
                    리뷰를 불러오는 중...
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
            <div className={`review-list ${className}`} style={containerStyles}>
                <div style={headerStyles}>
                    <div style={titleStyles}>📝 관람 후기</div>
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
                        리뷰를 불러올 수 없습니다
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
     * 리뷰가 없는 상태 (반응형)
     */
    if (!reviews || reviews.length === 0) {
        return (
            <div className={`review-list ${className}`} style={containerStyles}>
                <div style={headerStyles}>
                    <div style={titleStyles}>
                        📝 관람 후기 (0개)
                        <span
                            style={{
                                fontSize: isMobile ? '12px' : '11px',
                                backgroundColor: '#374151',
                                color: '#3B82F6',
                                padding: '2px 6px',
                                borderRadius: '10px',
                                fontWeight: 'normal',
                                marginLeft: '8px',
                            }}
                        >
                            관람 후
                        </span>
                    </div>

                    {currentUserId && (
                        <button
                            onClick={onCreateReview}
                            style={{
                                padding: isMobile ? '12px 16px' : '8px 12px',
                                backgroundColor: '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: isMobile ? '16px' : '12px',
                                cursor: 'pointer',
                                minHeight: isMobile ? '44px' : 'auto',
                                width: isMobile ? '100%' : 'auto',
                            }}
                        >
                            ✍️ 리뷰 작성
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
                        📝
                    </div>
                    <h3
                        style={{
                            color: '#6b7280',
                            marginBottom: '8px',
                            fontSize: isMobile ? '20px' : '18px',
                        }}
                    >
                        아직 작성된 후기가 없습니다
                    </h3>
                    <p
                        style={{
                            color: '#9ca3af',
                            fontSize: isMobile ? '16px' : '14px',
                            lineHeight: '1.5',
                            marginBottom: isMobile ? '24px' : '16px',
                        }}
                    >
                        첫 번째 후기를 작성해보세요!
                    </p>

                    {currentUserId && (
                        <button
                            onClick={onCreateReview}
                            style={{
                                padding: isMobile ? '16px 24px' : '12px 20px',
                                backgroundColor: '#3b82f6',
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
                            ✍️ 첫 번째 리뷰 작성하기
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ===== 메인 렌더링 (정상 상태) - 반응형 =====

    return (
        <div className={`review-list ${className}`} style={containerStyles}>
            {/* 헤더 - 반응형 */}
            <div style={headerStyles}>
                <div style={titleStyles}>
                    📝 관람 후기 ({totalElements.toLocaleString()}개)
                    <span
                        style={{
                            fontSize: isMobile ? '12px' : '11px',
                            backgroundColor: '#374151',
                            color: '#3B82F6',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            fontWeight: 'normal',
                            marginLeft: '8px',
                        }}
                    >
                        관람 후
                    </span>
                </div>

                <div style={actionContainerStyles}>
                    {currentUserId && (
                        <button
                            onClick={onCreateReview}
                            style={{
                                padding: isMobile ? '12px 16px' : '8px 12px',
                                backgroundColor: '#3b82f6',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: isMobile ? '16px' : '12px',
                                cursor: 'pointer',
                                minHeight: isMobile ? '44px' : 'auto',
                                width: isMobile ? '100%' : 'auto',
                                order: isMobile ? 2 : 1,
                            }}
                        >
                            ✍️ 리뷰 작성
                        </button>
                    )}

                    {/* 정렬 옵션 - 반응형 */}
                    {showSortOptions && (
                        <div
                            style={{
                                ...sortContainerStyles,
                                order: isMobile ? 1 : 2,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: isMobile ? '14px' : '12px',
                                    color: '#9ca3af',
                                    minWidth: 'fit-content',
                                }}
                            >
                                정렬:
                            </span>

                            {isMobile ? (
                                // 모바일: 드롭다운 형태
                                <>
                                    <button
                                        onClick={() =>
                                            setSortDropdownOpen(
                                                !sortDropdownOpen,
                                            )
                                        }
                                        style={{
                                            flex: 1,
                                            padding: '8px 12px',
                                            backgroundColor: '#374151',
                                            color: '#ffffff',
                                            border: '1px solid #6b7280',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            minHeight: '44px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <span>
                                            {
                                                ReviewSortOptions.find(
                                                    (opt) =>
                                                        opt.value === sortBy,
                                                )?.label
                                            }
                                            {sortDir === 'desc' ? ' ↓' : ' ↑'}
                                        </span>
                                        <span>
                                            {sortDropdownOpen ? '▲' : '▼'}
                                        </span>
                                    </button>

                                    {sortDropdownOpen && (
                                        <div style={dropdownStyles}>
                                            {ReviewSortOptions.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() =>
                                                        handleSortChange(
                                                            option.value,
                                                        )
                                                    }
                                                    style={{
                                                        width: '100%',
                                                        padding: '12px 16px',
                                                        backgroundColor:
                                                            sortBy ===
                                                            option.value
                                                                ? '#3b82f6'
                                                                : 'transparent',
                                                        color:
                                                            sortBy ===
                                                            option.value
                                                                ? '#ffffff'
                                                                : '#d1d5db',
                                                        border: 'none',
                                                        fontSize: '14px',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        borderBottom:
                                                            '1px solid #4b5563',
                                                    }}
                                                >
                                                    {option.label}
                                                    {sortBy ===
                                                        option.value && (
                                                        <span
                                                            style={{
                                                                float: 'right',
                                                            }}
                                                        >
                                                            {sortDir === 'desc'
                                                                ? '↓'
                                                                : '↑'}
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                // 데스크톱: 버튼 형태
                                ReviewSortOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() =>
                                            handleSortChange(option.value)
                                        }
                                        style={getSortButtonStyles(
                                            sortBy === option.value,
                                        )}
                                    >
                                        {option.label}
                                        {sortBy === option.value && (
                                            <span style={{ marginLeft: '4px' }}>
                                                {sortDir === 'desc' ? '↓' : '↑'}
                                            </span>
                                        )}
                                    </button>
                                ))
                            )}
                        </div>
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
                                order: 3,
                            }}
                        >
                            🔄
                        </button>
                    )}
                </div>
            </div>

            {/* 리뷰 목록 - 반응형 */}
            <div>
                {reviews.map((review) => (
                    <div
                        key={review.id}
                        style={{
                            ...reviewCardStyles,
                            ...(hoveredReviewId === review.id &&
                            onReviewClick &&
                            !isMobile
                                ? {
                                      boxShadow:
                                          '0 2px 8px rgba(59, 130, 246, 0.3)',
                                      transform: 'translateY(-1px)',
                                      borderColor: '#3B82F6',
                                  }
                                : {}),
                        }}
                        onClick={() => handleReviewClick(review)}
                        onMouseEnter={() =>
                            onReviewClick &&
                            !isMobile &&
                            setHoveredReviewId(review.id)
                        }
                        onMouseLeave={() => setHoveredReviewId(null)}
                    >
                        {/* 리뷰 헤더 - 반응형 */}
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
                                    {review.userNickname}
                                </span>
                                <span
                                    style={{
                                        fontSize: isMobile ? '14px' : '11px',
                                        color: '#9CA3AF',
                                    }}
                                >
                                    {formatDate(review.createdAt)}
                                </span>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                }}
                            >
                                {renderStars(review.rating)}
                                <span
                                    style={{
                                        fontSize: isMobile ? '14px' : '12px',
                                        color: '#9CA3AF',
                                        marginLeft: '4px',
                                    }}
                                >
                                    ({review.rating}/5)
                                </span>
                            </div>
                        </div>

                        {/* 리뷰 제목 - 반응형 */}
                        <h4
                            style={{
                                fontSize: isMobile
                                    ? '18px'
                                    : compact
                                      ? '14px'
                                      : '16px',
                                fontWeight: '600',
                                color: '#FFFFFF',
                                marginBottom: '8px',
                                lineHeight: '1.4',
                                wordBreak: 'keep-all',
                            }}
                        >
                            {review.title}
                        </h4>

                        {/* 리뷰 내용 - 반응형 */}
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
                                {review.description.length >
                                    (isMobile ? 80 : 100) &&
                                !compact &&
                                !expandedItems?.has(review.id)
                                    ? review.description.substring(
                                          0,
                                          isMobile ? 80 : 100,
                                      ) + '...'
                                    : review.description}
                            </p>
                            {review.description.length >
                                (isMobile ? 80 : 100) &&
                                !compact && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onReviewClick(review);
                                        }}
                                        style={{
                                            color: '#3B82F6',
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
                                        {expandedItems?.has(review.id)
                                            ? '접기'
                                            : '더보기'}
                                    </button>
                                )}
                        </div>

                        {/* 수정/삭제 버튼 - 반응형 */}
                        {currentUserId && currentUserId === review.userId && (
                            <div
                                style={{
                                    marginTop: isMobile ? '16px' : '12px',
                                    display: 'flex',
                                    gap: isMobile ? '8px' : '8px',
                                    justifyContent: 'flex-end',
                                    flexDirection: isMobile ? 'row' : 'row',
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditReview?.(review);
                                    }}
                                    style={{
                                        padding: isMobile
                                            ? '8px 12px'
                                            : '6px 10px',
                                        backgroundColor: '#3b82f6',
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
                                        onDeleteReview?.(review.id);
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

            {/* 도움말 텍스트 - 반응형 */}
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
                    💡 작성하신 리뷰는 다른 관람객들에게 큰 도움이 됩니다.
                    정직하고 자세한 후기를 작성해주세요!
                </div>
            )}

            {/* 드롭다운 닫기 이벤트 */}
            {sortDropdownOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 5,
                    }}
                    onClick={() => setSortDropdownOpen(false)}
                />
            )}
        </div>
    );
};

// ===== 기본 PROPS =====
ReviewList.defaultProps = {
    reviews: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    pageSize: 10,
    sortBy: 'createdAt',
    sortDir: 'desc',
    showSortOptions: true,
    showPagination: true,
    showRefreshButton: false,
    className: '',
    compact: false,
};

export default ReviewList;
