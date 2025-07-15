// src/features/concert/components/ConcertList.jsx

import React, { useCallback, useState, useEffect } from 'react';
import ConcertCard from './ConcertCard.jsx';

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

const ConcertList = ({
    // 데이터 props
    concerts = [],
    loading = false,
    error = null,

    // 페이지네이션 props
    currentPage = 0,
    totalPages = 0,
    totalElements = 0,
    pageSize = 12,

    // 정렬 props
    sortBy = 'concertDate',
    sortDir = 'asc',

    // 액션 props
    onConcertClick,
    onPageChange,
    onSortChange,
    onRetry,

    // UI 제어 props
    showSortOptions = true,
    showPagination = true,
    emptyMessage = '등록된 콘서트가 없습니다.',

    // 스타일 props
    responsive = true,
    className = '',
}) => {
    const { isMobile, isTablet } = useResponsive();
    const [showMobileSortMenu, setShowMobileSortMenu] = useState(false);

    // 이벤트 핸들러들
    const handleConcertClick = useCallback(
        (concert) => {
            if (onConcertClick && typeof onConcertClick === 'function') {
                onConcertClick(concert);
            }
        },
        [onConcertClick],
    );

    const handlePageChange = useCallback(
        (newPage) => {
            if (onPageChange && typeof onPageChange === 'function') {
                onPageChange(newPage);
            }
        },
        [onPageChange],
    );

    const handleSortChange = useCallback(
        (newSortBy, newSortDir) => {
            if (onSortChange && typeof onSortChange === 'function') {
                onSortChange(newSortBy, newSortDir);
            }
            setShowMobileSortMenu(false);
        },
        [onSortChange],
    );

    // 페이지 번호 배열 생성
    const getVisiblePageNumbers = useCallback(() => {
        const visiblePages = [];
        const maxVisible = isMobile ? 3 : 5;

        if (totalPages <= maxVisible) {
            for (let i = 0; i < totalPages; i++) {
                visiblePages.push(i);
            }
        } else {
            const start = Math.max(0, currentPage - Math.floor(maxVisible / 2));
            const end = Math.min(totalPages - 1, start + maxVisible - 1);

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

    // 정렬 옵션 정의
    const sortOptions = [
        { value: 'concertDate', label: '공연일순', dir: 'asc' },
        { value: 'title', label: '제목순', dir: 'asc' },
        { value: 'artist', label: '아티스트순', dir: 'asc' },
    ];

    // 로딩 상태
    if (loading) {
        return (
            <div
                className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}
            >
                <div className="p-6">
                    {/* 로딩 스켈레톤 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {Array.from({ length: 8 }, (_, index) => (
                            <div
                                key={`skeleton-${index}`}
                                className="bg-gray-800 rounded-lg p-4 animate-pulse border border-gray-700"
                            >
                                {/* 포스터 스켈레톤 */}
                                <div
                                    className={`${isMobile ? 'h-48' : 'h-64'} bg-gray-700 rounded mb-4`}
                                ></div>

                                {/* 제목 스켈레톤 */}
                                <div className="h-5 bg-gray-700 rounded mb-2"></div>
                                <div className="h-4 bg-gray-700 rounded w-3/4 mb-3"></div>

                                {/* 정보 스켈레톤 */}
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-700 rounded w-full"></div>
                                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-gray-300">
                            콘서트 목록을 불러오는 중...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (error) {
        return (
            <div
                className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}
            >
                <div className="p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="text-5xl mb-4">😵</div>
                        <h3 className="text-xl font-bold text-red-400 mb-2">
                            콘서트 목록을 불러올 수 없습니다
                        </h3>
                        <p className="text-gray-300 mb-6">
                            {typeof error === 'string'
                                ? error
                                : '알 수 없는 오류가 발생했습니다.'}
                        </p>

                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                            >
                                🔄 다시 시도
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // 빈 상태
    if (!concerts || concerts.length === 0) {
        return (
            <div
                className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}
            >
                <div className="p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="text-5xl mb-4">🎭</div>
                        <h3 className="text-xl font-bold text-gray-300 mb-2">
                            {emptyMessage}
                        </h3>
                        <p className="text-gray-400">
                            새로운 콘서트가 등록되면 여기에 표시됩니다.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`bg-gray-800 rounded-lg border border-gray-700 ${className}`}
        >
            {/* 헤더 섹션 - 제목과 정렬 옵션 */}
            {showSortOptions && (
                <div className="p-6 border-b border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        {/* 총 개수 표시 */}
                        <div className="text-white">
                            <h2
                                className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold`}
                            >
                                콘서트 목록
                                <span className="ml-2 text-gray-300">
                                    ({totalElements.toLocaleString()}개)
                                </span>
                            </h2>
                        </div>

                        {/* 정렬 옵션 */}
                        <div className="flex items-center gap-2">
                            {/* 데스크톱용 정렬 버튼들 */}
                            <div className="hidden sm:flex items-center gap-2">
                                <span className="text-sm text-gray-300">
                                    정렬:
                                </span>
                                {sortOptions.map((option) => (
                                    <button
                                        key={`${option.value}-${option.dir}`}
                                        onClick={() =>
                                            handleSortChange(
                                                option.value,
                                                option.dir,
                                            )
                                        }
                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                            sortBy === option.value &&
                                            sortDir === option.dir
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>

                            {/* 모바일용 정렬 드롭다운 */}
                            <div className="sm:hidden relative">
                                <button
                                    onClick={() =>
                                        setShowMobileSortMenu(
                                            !showMobileSortMenu,
                                        )
                                    }
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm"
                                >
                                    정렬
                                    <svg
                                        className={`w-4 h-4 transition-transform ${showMobileSortMenu ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </button>

                                {showMobileSortMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() =>
                                                setShowMobileSortMenu(false)
                                            }
                                        />
                                        <div className="absolute top-full mt-2 z-50 w-48 right-0 bg-gray-800 rounded-lg shadow-xl border border-gray-600 overflow-hidden">
                                            {sortOptions.map((option) => (
                                                <button
                                                    key={`${option.value}-${option.dir}`}
                                                    onClick={() =>
                                                        handleSortChange(
                                                            option.value,
                                                            option.dir,
                                                        )
                                                    }
                                                    className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-gray-700 last:border-b-0 ${
                                                        sortBy ===
                                                            option.value &&
                                                        sortDir === option.dir
                                                            ? 'bg-blue-600 text-white'
                                                            : 'text-gray-300 hover:bg-gray-700'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span>
                                                            {option.label}
                                                        </span>
                                                        {sortBy ===
                                                            option.value &&
                                                            sortDir ===
                                                                option.dir && (
                                                                <span>✓</span>
                                                            )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 콘서트 그리드 */}
            <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {concerts.map((concert) => (
                        <ConcertCard
                            key={concert.concertId}
                            concert={concert}
                            onClick={handleConcertClick}
                            className="w-full"
                        />
                    ))}
                </div>
            </div>

            {/* 페이지네이션 */}
            {showPagination && totalPages > 1 && (
                <div className="p-6 border-t border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        {/* 페이지 정보 */}
                        <div className="text-sm text-gray-300 text-center sm:text-left">
                            {totalElements}개 중 {currentPage * pageSize + 1}-
                            {Math.min(
                                (currentPage + 1) * pageSize,
                                totalElements,
                            )}
                            개 표시
                        </div>

                        {/* 페이지 버튼들 */}
                        <div className="flex items-center gap-2">
                            {/* 이전 버튼 */}
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 0}
                                className="px-3 py-2 text-sm bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                            >
                                이전
                            </button>

                            {/* 페이지 번호들 (데스크톱) */}
                            <div className="hidden sm:flex items-center gap-1">
                                {getVisiblePageNumbers().map(
                                    (pageNum, index) => {
                                        if (pageNum === '...') {
                                            return (
                                                <span
                                                    key={`ellipsis-${index}`}
                                                    className="px-2 text-gray-400"
                                                >
                                                    ...
                                                </span>
                                            );
                                        }

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() =>
                                                    handlePageChange(pageNum)
                                                }
                                                className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                                    pageNum === currentPage
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                            >
                                                {pageNum + 1}
                                            </button>
                                        );
                                    },
                                )}
                            </div>

                            {/* 모바일용 페이지 표시 */}
                            <div className="sm:hidden px-3 py-2 text-sm text-gray-300">
                                {currentPage + 1} / {totalPages}
                            </div>

                            {/* 다음 버튼 */}
                            <button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage >= totalPages - 1}
                                className="px-3 py-2 text-sm bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConcertList;
