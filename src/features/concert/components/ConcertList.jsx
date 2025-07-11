// src/features/concert/components/ConcertList.jsx

// React 라이브러리에서 필요한 기능들을 import
import React from 'react'; // 🔥 useMemo 제거 - 더 이상 프론트에서 필터링하지 않음

// 우리가 만든 ConcertCard 컴포넌트 import
import ConcertCard from './ConcertCard.jsx';

/**
 * ConcertList 컴포넌트
 *
 * 🎯 역할:
 * - 여러 개의 ConcertCard 컴포넌트를 담는 컨테이너
 * - 콘서트 목록을 격자(그리드) 형태로 배치
 * - 🔥 완료된 콘서트 필터링 제거: 백엔드에서 이미 처리됨
 * - 로딩, 에러, 빈 상태 등 다양한 상황에 대한 UI 제공
 * - 페이지네이션 UI 제공 (페이지 번호, 이전/다음 버튼)
 */
const ConcertList = ({
    concerts = [],
    loading = false,
    error = null,
    onConcertClick,
    onPageChange,
    onRetry,
    currentPage = 0,
    totalPages = 0,
    showAiSummary = false,
    showPagination = true,
    emptyMessage = '콘서트가 없습니다.',
    className = '',
    sortBy = 'concertDate',
    sortDir = 'asc',
    onSortChange,
    showSortOptions = true,
}) => {
    // 🔥 완료된 콘서트 필터링 로직 완전 제거
    // const filteredConcerts = useMemo(() => { ... }); 삭제
    // 이제 백엔드에서 이미 필터링된 데이터가 오므로 concerts를 그대로 사용

    // ===== 스타일 정의 =====

    const containerStyles = {
        width: '100%',
        padding: '16px',
        backgroundColor: '#1E293B', // 기존 #0F172A에서 변경
        minHeight: '100vh',
        color: '#FFFFFF',
        borderRadius: '8px',
        border: '1px solid #374151', // 테두리 추가
    };

    const gridStyles = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '24px',
    };

    const loadingStyles = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        fontSize: '16px',
        color: '#9CA3AF', // 회색 텍스트
        backgroundColor: '#0F172A', // 다크 배경
    };

    const errorStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        padding: '24px',
        backgroundColor: '#1E293B',
        border: '1px solid #fecaca',
        borderRadius: '8px',
        margin: '16px 0',
    };

    const emptyStyles = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '200px',
        padding: '24px',
        backgroundColor: '#1E293B', // 기존 #1E293B 유지
        border: '2px dashed #374151', // 기존 #d1d5db에서 변경
        borderRadius: '8px',
        margin: '16px 0',
    };

    const paginationStyles = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        marginTop: '24px',
        padding: '16px',
    };

    const buttonBaseStyles = {
        padding: '8px 12px',
        border: '1px solid #374151',
        borderRadius: '4px',
        backgroundColor: '#374151',
        color: '374151',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s ease',
    };

    const activeButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        borderColor: '#3b82f6',
    };

    const disabledButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: '#1f2937',
        color: '#6b7280',
        borderColor: '#1f2937',
        cursor: 'not-allowed',
    };

    // ===== 이벤트 핸들러 =====

    const handlePageChange = (newPage) => {
        if (newPage < 0 || newPage >= totalPages) {
            return;
        }

        if (newPage === currentPage) {
            return;
        }

        if (onPageChange && typeof onPageChange === 'function') {
            onPageChange(newPage);
        }
    };

    const handleRetry = () => {
        if (onRetry && typeof onRetry === 'function') {
            onRetry();
        }
    };

    // ===== 헬퍼 함수 =====

    const getVisiblePageNumbers = () => {
        const visiblePages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 0; i < totalPages; i++) {
                visiblePages.push(i);
            }
        } else {
            const start = Math.max(0, currentPage - 2);
            const end = Math.min(totalPages - 1, currentPage + 2);

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
    };

    // ===== 로딩 스켈레톤 컴포넌트 =====

    const LoadingSkeleton = () => {
        const skeletonCards = Array.from({ length: 6 }, (_, index) => (
            <div
                key={`skeleton-${index}`}
                style={{
                    border: '1px solid #374151', // 어두운 테두리
                    borderRadius: '16px', // 더 둥글게
                    padding: '16px',
                    backgroundColor: '#1E293B', // 다크 배경
                    margin: '8px',
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: '200px',
                        backgroundColor: '#374151', // 어두운 회색
                        borderRadius: '12px',
                        marginBottom: '12px',
                        animation: 'pulse 2s infinite',
                    }}
                />
                <div
                    style={{
                        width: '80%',
                        height: '20px',
                        backgroundColor: '#374151',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        animation: 'pulse 2s infinite',
                    }}
                />
                <div
                    style={{
                        width: '60%',
                        height: '16px',
                        backgroundColor: '#374151',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        animation: 'pulse 2s infinite',
                    }}
                />
                <div
                    style={{
                        width: '90%',
                        height: '14px',
                        backgroundColor: '#374151',
                        borderRadius: '4px',
                        marginBottom: '6px',
                        animation: 'pulse 2s infinite',
                    }}
                />
                <div
                    style={{
                        width: '70%',
                        height: '14px',
                        backgroundColor: '#374151',
                        borderRadius: '4px',
                        animation: 'pulse 2s infinite',
                    }}
                />
            </div>
        ));

        return (
            <div style={gridStyles}>
                {skeletonCards}

                {/* CSS 애니메이션 */}
                <style>{`
                    @keyframes pulse {
                        0%,
                        100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.6;
                        }
                    }
                `}</style>
            </div>
        );
    };

    // ===== 조건부 렌더링 =====

    /**
     * 로딩 중일 때
     */
    if (loading) {
        return (
            <div
                className={`concert-list ${className}`}
                style={containerStyles}
            >
                <LoadingSkeleton />
                <div style={loadingStyles}>
                    <span>🎵 콘서트 정보를 불러오는 중...</span>
                </div>
            </div>
        );
    }

    /**
     * 에러가 발생했을 때
     */
    if (error) {
        return (
            <div
                className={`concert-list ${className}`}
                style={containerStyles}
            >
                <div style={errorStyles}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        😵
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>
                        오류가 발생했습니다
                    </h3>
                    <p
                        style={{
                            margin: '0 0 16px 0',
                            color: '#6b7280',
                            textAlign: 'center',
                        }}
                    >
                        {typeof error === 'string'
                            ? error
                            : '콘서트 정보를 불러올 수 없습니다.'}
                    </p>
                    {onRetry && (
                        <button
                            onClick={handleRetry}
                            style={{
                                ...buttonBaseStyles,
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                borderColor: '#dc2626',
                            }}
                        >
                            🔄 다시 시도
                        </button>
                    )}
                </div>
            </div>
        );
    }

    /**
     * 🔥 콘서트 목록이 비어있을 때 (백엔드에서 이미 필터링된 결과)
     */
    if (!concerts || concerts.length === 0) {
        return (
            <div
                className={`concert-list ${className}`}
                style={containerStyles}
            >
                <div style={emptyStyles}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                        🎭
                    </div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#374151' }}>
                        표시할 콘서트가 없습니다
                    </h3>
                    <p
                        style={{
                            margin: '0',
                            color: '#6b7280',
                            textAlign: 'center',
                        }}
                    >
                        {emptyMessage}
                    </p>
                    {/* 🔥 필터링 안내 메시지 제거: 백엔드에서 처리되므로 불필요 */}
                </div>
            </div>
        );
    }

    // ===== 메인 렌더링 (정상 상태) =====

    return (
        <div className={`concert-list ${className}`} style={containerStyles}>
            {/* 정렬 옵션 */}
            {showSortOptions && onSortChange && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '8px',
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: '#374151',
                        borderRadius: '8px',
                        border: '1px solid #4B5563',
                    }}
                >
                    <span
                        style={{
                            color: '#D1D5DB',
                            fontSize: '14px',
                            alignSelf: 'center',
                            marginRight: '8px',
                        }}
                    >
                        정렬:
                    </span>

                    <button
                        onClick={() => {
                            const newDir =
                                sortBy === 'concertDate' && sortDir === 'asc'
                                    ? 'desc'
                                    : 'asc';
                            onSortChange('concertDate', newDir);
                        }}
                        style={{
                            ...buttonBaseStyles,
                            ...(sortBy === 'concertDate'
                                ? activeButtonStyles
                                : {}),
                            fontSize: '12px',
                            padding: '6px 12px',
                        }}
                    >
                        공연일자{' '}
                        {sortBy === 'concertDate'
                            ? sortDir === 'asc'
                                ? '↑'
                                : '↓'
                            : ''}
                    </button>

                    <button
                        onClick={() => {
                            const newDir =
                                sortBy === 'title' && sortDir === 'asc'
                                    ? 'desc'
                                    : 'asc';
                            onSortChange('title', newDir);
                        }}
                        style={{
                            ...buttonBaseStyles,
                            ...(sortBy === 'title' ? activeButtonStyles : {}),
                            fontSize: '12px',
                            padding: '6px 12px',
                        }}
                    >
                        제목{' '}
                        {sortBy === 'title'
                            ? sortDir === 'asc'
                                ? '↑'
                                : '↓'
                            : ''}
                    </button>

                    <button
                        onClick={() => {
                            const newDir =
                                sortBy === 'artist' && sortDir === 'asc'
                                    ? 'desc'
                                    : 'asc';
                            onSortChange('artist', newDir);
                        }}
                        style={{
                            ...buttonBaseStyles,
                            ...(sortBy === 'artist' ? activeButtonStyles : {}),
                            fontSize: '12px',
                            padding: '6px 12px',
                        }}
                    >
                        아티스트{' '}
                        {sortBy === 'artist'
                            ? sortDir === 'asc'
                                ? '↑'
                                : '↓'
                            : ''}
                    </button>
                </div>
            )}

            {/* 🔥 백엔드에서 이미 필터링된 콘서트 카드들의 격자 레이아웃 */}
            <div style={gridStyles}>
                {concerts.map((concert) => (
                    <ConcertCard
                        key={concert.concertId}
                        concert={concert}
                        onClick={onConcertClick}
                        showAiSummary={showAiSummary}
                    />
                ))}
            </div>

            {/* 페이지네이션 */}
            {showPagination && totalPages > 1 && (
                <div style={paginationStyles}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        style={
                            currentPage === 0
                                ? disabledButtonStyles
                                : buttonBaseStyles
                        }
                        aria-label="이전 페이지"
                    >
                        ← 이전
                    </button>

                    {getVisiblePageNumbers().map((pageNum, index) => {
                        if (pageNum === '...') {
                            return (
                                <span
                                    key={`ellipsis-${index}`}
                                    style={{ padding: '8px 4px' }}
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
                                        ? activeButtonStyles
                                        : buttonBaseStyles
                                }
                                aria-label={`${pageNum + 1}페이지`}
                                aria-current={
                                    pageNum === currentPage ? 'page' : undefined
                                }
                            >
                                {pageNum + 1}
                            </button>
                        );
                    })}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        style={
                            currentPage >= totalPages - 1
                                ? disabledButtonStyles
                                : buttonBaseStyles
                        }
                        aria-label="다음 페이지"
                    >
                        다음 →
                    </button>
                </div>
            )}

            {/* 🔥 페이지 정보 표시 (필터링 관련 정보 제거) */}
            {showPagination && totalPages > 0 && (
                <div
                    style={{
                        textAlign: 'center',
                        marginTop: '8px',
                        fontSize: '14px',
                        color: '#6b7280',
                    }}
                >
                    {currentPage + 1} / {totalPages} 페이지
                </div>
            )}
        </div>
    );
};

// ===== 기본 props 값 =====
ConcertList.defaultProps = {
    concerts: [],
    loading: false,
    error: null,
    currentPage: 0,
    totalPages: 0,
    showAiSummary: false,
    showPagination: true,
    emptyMessage: '콘서트가 없습니다.',
    className: '',
};

export default ConcertList;
