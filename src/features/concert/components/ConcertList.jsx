// src/features/concert/components/ConcertList.jsx

import React, { useCallback, useState } from 'react';
import { Calendar, MapPin, Users, Clock, Star, Sparkles } from 'lucide-react';

/**
 * ===== ConcertList 컴포넌트 (반응형 버전) =====
 *
 * 🎯 주요 개선사항:
 * 1. 반응형 그리드 레이아웃 (mobile: 1열, tablet: 2열, desktop: 3-4열)
 * 2. 터치 친화적 카드 디자인
 * 3. 모바일 최적화된 정렬 옵션
 * 4. 향상된 페이지네이션 UI
 * 5. 반응형 AI 요약 표시
 */
const ConcertList = ({
    // ===== 데이터 props =====
    concerts = [],
    loading = false,
    error = null,

    // ===== 페이지네이션 props =====
    currentPage = 0,
    totalPages = 0,
    totalElements = 0,
    pageSize = 12,

    // ===== 정렬 props =====
    sortBy = 'concertDate',
    sortDir = 'asc',

    // ===== 액션 props =====
    onConcertClick,
    onPageChange,
    onSortChange,
    onRetry,

    // ===== UI 제어 props =====
    showAiSummary = true,
    showSortOptions = true,
    showPagination = true,
    emptyMessage = '등록된 콘서트가 없습니다.',

    // ===== 반응형 관련 props =====
    responsive = true,
    className = '',
}) => {
    // ===== 상태 관리 =====
    const [hoveredConcertId, setHoveredConcertId] = useState(null);
    const [showMobileSortMenu, setShowMobileSortMenu] = useState(false);

    // ===== 이벤트 핸들러들 =====

    /**
     * 콘서트 카드 클릭 핸들러
     */
    const handleConcertClick = useCallback((concert) => {
        if (onConcertClick && typeof onConcertClick === 'function') {
            onConcertClick(concert);
        }
    }, [onConcertClick]);

    /**
     * 페이지 변경 핸들러
     */
    const handlePageChange = useCallback((newPage) => {
        if (onPageChange && typeof onPageChange === 'function') {
            onPageChange(newPage);
        }
    }, [onPageChange]);

    /**
     * 정렬 변경 핸들러
     */
    const handleSortChange = useCallback((newSortBy, newSortDir) => {
        if (onSortChange && typeof onSortChange === 'function') {
            onSortChange(newSortBy, newSortDir);
        }
        setShowMobileSortMenu(false); // 모바일 메뉴 닫기
    }, [onSortChange]);

    // ===== 유틸리티 함수들 =====

    /**
     * 날짜 포맷팅
     */
    const formatDate = useCallback((dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch (error) {
            return dateString;
        }
    }, []);

    /**
     * 시간 포맷팅
     */
    const formatTime = useCallback((timeString) => {
        try {
            return timeString.substring(0, 5); // HH:MM 형태로
        } catch (error) {
            return timeString;
        }
    }, []);

    /**
     * 상태별 배지 스타일
     */
    const getStatusBadge = useCallback((status) => {
        const statusConfig = {
            SCHEDULED: { color: 'bg-yellow-600 text-yellow-100', text: '예정' },
            ON_SALE: { color: 'bg-green-600 text-green-100', text: '예매중' },
            SOLD_OUT: { color: 'bg-red-600 text-red-100', text: '매진' },
            CANCELLED: { color: 'bg-gray-600 text-gray-100', text: '취소' },
            COMPLETED: { color: 'bg-purple-600 text-purple-100', text: '완료' },
        };

        const config = statusConfig[status] || statusConfig.SCHEDULED;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        );
    }, []);

    /**
     * 페이지 번호 배열 생성 (모바일 최적화)
     */
    const getVisiblePageNumbers = useCallback(() => {
        const visiblePages = [];
        const maxVisible = 5; // 모바일에서는 3개로 줄일 수도 있음

        if (totalPages <= maxVisible) {
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
    }, [currentPage, totalPages]);

    // ===== 정렬 옵션 정의 (사용자 친화적 옵션들) =====
    const sortOptions = [
        { value: 'concertDate', label: '공연일순', dir: 'asc' },
        { value: 'title', label: '제목순', dir: 'asc' },
        { value: 'artist', label: '아티스트순', dir: 'asc' },
    ];

    // ===== 조건부 렌더링 =====

    /**
     * 로딩 상태 (반응형 개선)
     */
    if (loading) {
        return (
            <div className={`concert-list ${className}`}>
                {/* 🎯 반응형 로딩 스켈레톤 */}
                <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                        {Array.from({ length: 8 }, (_, index) => (
                            <div
                                key={`skeleton-${index}`}
                                className="bg-gray-700 rounded-lg p-4 sm:p-6 animate-pulse"
                            >
                                {/* 포스터 스켈레톤 */}
                                <div className="aspect-[3/4] bg-gray-600 rounded-lg mb-4"></div>

                                {/* 제목 스켈레톤 */}
                                <div className="h-4 sm:h-5 bg-gray-600 rounded mb-2"></div>
                                <div className="h-3 sm:h-4 bg-gray-600 rounded w-3/4 mb-3"></div>

                                {/* 정보 스켈레톤 */}
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-600 rounded w-full"></div>
                                    <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="mt-2 text-gray-300 text-sm sm:text-base">콘서트 목록을 불러오는 중...</p>
                    </div>
                </div>
            </div>
        );
    }

    /**
     * 에러 상태 (반응형 개선)
     */
    if (error) {
        return (
            <div className={`concert-list ${className}`}>
                <div className="p-6 sm:p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="text-4xl sm:text-5xl mb-4">😵</div>
                        <h3 className="text-lg sm:text-xl font-bold text-red-400 mb-2">
                            콘서트 목록을 불러올 수 없습니다
                        </h3>
                        <p className="text-sm sm:text-base text-gray-300 mb-6">
                            {typeof error === 'string' ? error : '알 수 없는 오류가 발생했습니다.'}
                        </p>

                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                            >
                                🔄 다시 시도
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /**
     * 빈 상태 (반응형 개선)
     */
    if (!concerts || concerts.length === 0) {
        return (
            <div className={`concert-list ${className}`}>
                <div className="p-6 sm:p-8 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="text-4xl sm:text-5xl mb-4">🎭</div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-300 mb-2">
                            {emptyMessage}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-400">
                            새로운 콘서트가 등록되면 여기에 표시됩니다.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ===== 메인 렌더링 =====

    return (
        <div className={`concert-list bg-gray-800 rounded-lg ${className}`}>
            {/* 🎯 헤더 섹션 - 반응형 정렬 옵션 */}
            {showSortOptions && (
                <div className="p-4 sm:p-6 border-b border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                        {/* 총 개수 표시 */}
                        <div className="text-white">
                            <h2 className="text-lg sm:text-xl font-bold">
                                콘서트 목록
                                <span className="ml-2 text-sm sm:text-base text-gray-300">
                                    ({totalElements.toLocaleString()}개)
                                </span>
                            </h2>
                        </div>

                        {/* 🎯 반응형 정렬 옵션 */}
                        <div className="flex items-center gap-2">
                            {/* 데스크톱용 정렬 버튼들 */}
                            <div className="hidden sm:flex items-center gap-2">
                                <span className="text-sm text-gray-300">정렬:</span>
                                {sortOptions.map((option) => (
                                    <button
                                        key={`${option.value}-${option.dir}`}
                                        onClick={() => handleSortChange(option.value, option.dir)}
                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                                            sortBy === option.value && sortDir === option.dir
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
                                    onClick={() => setShowMobileSortMenu(!showMobileSortMenu)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg text-sm min-w-[80px] justify-center"
                                >
                                    정렬
                                    <svg
                                        className={`w-4 h-4 transition-transform ${showMobileSortMenu ? 'rotate-180' : ''}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {showMobileSortMenu && (
                                    <>
                                        {/* 오버레이 */}
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowMobileSortMenu(false)}
                                        />

                                        {/* 🎯 반응형 드롭다운 메뉴 - 화면 크기에 따라 위치 조정 */}
                                        <div className="absolute top-full mt-2 z-50 w-48 max-w-[calc(100vw-2rem)]
                                                      right-0 sm:right-0
                                                      bg-white rounded-lg shadow-xl border border-gray-300 overflow-hidden
                                                      transform -translate-x-0
                                                      max-h-[60vh] overflow-y-auto">
                                            {sortOptions.map((option, index) => (
                                                <button
                                                    key={`${option.value}-${option.dir}`}
                                                    onClick={() => handleSortChange(option.value, option.dir)}
                                                    className={`w-full text-left px-4 py-3 text-sm transition-colors border-b border-gray-200 last:border-b-0 ${
                                                        sortBy === option.value && sortDir === option.dir
                                                            ? 'bg-blue-600 text-white font-medium'
                                                            : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <span className="truncate pr-2">{option.label}</span>
                                                        {sortBy === option.value && sortDir === option.dir && (
                                                            <span className="text-white flex-shrink-0">✓</span>
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

            {/* 🎯 콘서트 그리드 - 핵심 반응형 레이아웃 */}
            <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {concerts.map((concert) => (
                        <div
                            key={concert.concertId}
                            className={`
                                bg-gray-700 rounded-lg overflow-hidden shadow-lg cursor-pointer
                                transform transition-all duration-300 hover:scale-105 hover:shadow-xl
                                border border-gray-600 hover:border-blue-500
                                ${hoveredConcertId === concert.concertId ? 'ring-2 ring-blue-500' : ''}
                            `}
                            onClick={() => handleConcertClick(concert)}
                            onMouseEnter={() => setHoveredConcertId(concert.concertId)}
                            onMouseLeave={() => setHoveredConcertId(null)}
                        >
                            {/* 🎯 포스터 이미지 - 반응형 aspect ratio */}
                            <div className="relative aspect-[3/4] overflow-hidden bg-gray-600">
                                {concert.posterImageUrl ? (
                                    <img
                                        src={concert.posterImageUrl}
                                        alt={`${concert.title} 포스터`}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                        loading="lazy"
                                        onError={(e) => {
                                            // 이미지 로드 실패 시 기본 UI로 대체
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}

                                {/* 기본 포스터 UI (이미지가 없거나 로드 실패 시) */}
                                <div
                                    className="absolute inset-0 flex flex-col items-center justify-center text-gray-400"
                                    style={{ display: concert.posterImageUrl ? 'none' : 'flex' }}
                                >
                                    <div className="text-3xl sm:text-4xl mb-2">🎭</div>
                                    <div className="text-xs sm:text-sm text-center px-2">
                                        포스터
                                        <br />
                                        준비중
                                    </div>
                                </div>

                                {/* 상태 배지 */}
                                <div className="absolute top-2 left-2">
                                    {getStatusBadge(concert.status)}
                                </div>

                                {/* AI 요약 배지 */}
                                {showAiSummary && concert.aiSummary && (
                                    <div className="absolute top-2 right-2">
                                        <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                            <Sparkles size={12} />
                                            AI
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* 🎯 콘서트 정보 - 반응형 패딩 및 텍스트 크기 */}
                            <div className="p-4 sm:p-5">
                                {/* 제목과 아티스트 */}
                                <div className="mb-3">
                                    <h3 className="text-base sm:text-lg font-bold text-white mb-1 line-clamp-2">
                                        {concert.title}
                                    </h3>
                                    <p className="text-sm sm:text-base text-gray-300 line-clamp-1">
                                        🎤 {concert.artist}
                                    </p>
                                </div>

                                {/* 공연 정보 */}
                                <div className="space-y-2 text-xs sm:text-sm text-gray-300">
                                    {/* 날짜와 시간 */}
                                    <div className="flex items-center gap-2">
                                        <Calendar size={14} className="text-blue-400 flex-shrink-0" />
                                        <span className="truncate">
                                            {formatDate(concert.concertDate)} {formatTime(concert.startTime)}
                                        </span>
                                    </div>

                                    {/* 장소 */}
                                    <div className="flex items-center gap-2">
                                        <MapPin size={14} className="text-green-400 flex-shrink-0" />
                                        <span className="truncate">{concert.venueName}</span>
                                    </div>

                                    {/* 좌석 수 */}
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-purple-400 flex-shrink-0" />
                                        <span>{concert.totalSeats?.toLocaleString()}석</span>
                                    </div>
                                </div>

                                {/* 🎯 AI 요약 미리보기 (데스크톱에서만 표시) */}
                                {showAiSummary && concert.aiSummary && (
                                    <div className="hidden lg:block mt-3 pt-3 border-t border-gray-600">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles size={14} className="text-green-400" />
                                            <span className="text-xs font-medium text-green-400">AI 요약</span>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2">
                                            {concert.aiSummary.length > 80
                                                ? concert.aiSummary.substring(0, 80) + '...'
                                                : concert.aiSummary
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 🎯 페이지네이션 - 반응형 개선 */}
            {showPagination && totalPages > 1 && (
                <div className="p-4 sm:p-6 border-t border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        {/* 페이지 정보 */}
                        <div className="text-sm text-gray-300 text-center sm:text-left">
                            {totalElements}개 중 {currentPage * pageSize + 1}-
                            {Math.min((currentPage + 1) * pageSize, totalElements)}개 표시
                        </div>

                        {/* 페이지 버튼들 */}
                        <div className="flex items-center gap-1 sm:gap-2">
                            {/* 이전 버튼 */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 0}
                                className="px-3 py-2 text-sm bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                            >
                                이전
                            </button>

                            {/* 페이지 번호들 */}
                            <div className="hidden sm:flex items-center gap-1">
                                {getVisiblePageNumbers().map((pageNum, index) => {
                                    if (pageNum === '...') {
                                        return (
                                            <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                                                ...
                                            </span>
                                        );
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                                                pageNum === currentPage
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {pageNum + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* 모바일용 페이지 표시 */}
                            <div className="sm:hidden px-3 py-2 text-sm text-gray-300">
                                {currentPage + 1} / {totalPages}
                            </div>

                            {/* 다음 버튼 */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage >= totalPages - 1}
                                className="px-3 py-2 text-sm bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
                            >
                                다음
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 🎯 모바일 정렬 메뉴는 위에서 오버레이로 처리됨 */}
        </div>
    );
};

export default ConcertList;