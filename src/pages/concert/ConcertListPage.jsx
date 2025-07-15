// src/pages/concert/ConcertListPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// 컴포넌트들 import
import ConcertList from '../../features/concert/components/ConcertList.jsx';
import SearchBar from '../../features/concert/components/SearchBar.jsx';
import FilterPanel from '../../features/concert/components/FilterPanel.jsx';

// hooks import
import { useConcerts } from '../../features/concert/hooks/useConcerts.js';

// 반응형 Hook (다른 페이지와 동일)
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

// 로딩 스켈레톤 컴포넌트
const LoadingSkeleton = ({ isMobile, isTablet }) => {
    return (
        <div
            className="rounded-xl shadow-md"
            style={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                padding: isMobile
                    ? '40px 20px'
                    : isTablet
                      ? '50px 30px'
                      : '60px 40px',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    width: isMobile ? '32px' : '40px',
                    height: isMobile ? '32px' : '40px',
                    border: '4px solid #374151',
                    borderTop: '4px solid #3B82F6',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 16px',
                }}
            />
            <div
                style={{
                    color: '#FFFFFF',
                    fontSize: isMobile ? '14px' : '18px',
                }}
            >
                콘서트 목록을 불러오는 중...
            </div>
        </div>
    );
};

function ConcertListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { isMobile, isTablet } = useResponsive();

    // URL 쿼리 파라미터에서 값들 추출
    const query = searchParams.get('query') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // 콘서트 목록 hook
    const {
        concerts,
        loading,
        error,
        currentPage,
        totalPages,
        totalElements,
        sortBy,
        sortDir,
        fetchConcerts,
        searchConcerts,
        filterConcerts,
        goToPage,
        changePageSize,
        changeSorting,
    } = useConcerts();

    // 현재 필터가 적용되어 있는지 확인
    const hasActiveFilters = Boolean(startDate || endDate);
    const hasActiveSearch = Boolean(query);

    // 콘서트 카드 클릭 핸들러
    const handleConcertClick = (concert) => {
        navigate(`/concerts/${concert.concertId}`);
    };

    // 정렬 변경 핸들러
    const handleSortChange = (newSortBy, newSortDir) => {
        try {
            changeSorting(newSortBy, newSortDir);
        } catch (err) {
            console.error('정렬 변경 실패:', err);
        }
    };

    // 검색 실행 핸들러
    const handleSearch = async (searchKeyword) => {
        try {
            const newSearchParams = new URLSearchParams();
            if (searchKeyword && searchKeyword.trim()) {
                newSearchParams.set('query', searchKeyword.trim());
                await searchConcerts(searchKeyword.trim());
            } else {
                await fetchConcerts();
            }
            setSearchParams(newSearchParams);
        } catch (err) {
            console.error('검색 실패:', err);
        }
    };

    // 검색어 지우기 핸들러
    const handleClearSearch = () => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('query');
        setSearchParams(newSearchParams);
        fetchConcerts();
    };

    // 필터 적용 핸들러
    const handleFilter = async (filterParams) => {
        try {
            const cleanFilterParams = {};
            if (filterParams.startDate)
                cleanFilterParams.startDate = filterParams.startDate;
            if (filterParams.endDate)
                cleanFilterParams.endDate = filterParams.endDate;

            const newSearchParams = new URLSearchParams();

            if (query) {
                newSearchParams.set('query', query);
            }

            Object.entries(cleanFilterParams).forEach(([key, value]) => {
                if (value) newSearchParams.set(key, value.toString());
            });

            if (Object.keys(cleanFilterParams).length > 0) {
                await filterConcerts(cleanFilterParams);
            } else {
                if (!query) {
                    await fetchConcerts();
                } else {
                    await searchConcerts(query);
                }
            }

            setSearchParams(newSearchParams);
        } catch (err) {
            console.error('필터링 실패:', err);
        }
    };

    // 전체 보기 핸들러
    const handleShowAll = async () => {
        try {
            setSearchParams(new URLSearchParams());
            await fetchConcerts();
        } catch (err) {
            console.error('전체 보기 로드 실패:', err);
        }
    };

    // 페이지 변경 핸들러
    const handlePageChange = (newPage) => {
        goToPage(newPage);
    };

    // 새로고침 핸들러
    const handleRefresh = () => {
        if (query) {
            searchConcerts(query);
        } else if (startDate || endDate) {
            const filterParams = {};
            if (startDate) filterParams.startDate = startDate;
            if (endDate) filterParams.endDate = endDate;
            filterConcerts(filterParams);
        } else {
            fetchConcerts();
        }
    };

    // 초기 필터 값들
    const initialFilters = {
        startDate: startDate,
        endDate: endDate,
    };

    return (
        <div
            style={{
                backgroundColor: '#111827', // gray-900 - ConcertDetailPage와 동일
                minHeight: '100vh',
                width: '100%', // 100vw 대신 100% 사용
                margin: 0,
                padding: 0,
                overflowX: 'hidden', // ConcertDetailPage와 동일
            }}
        >
            {/* 메인 컨테이너 - ConcertDetailPage와 동일한 구조 */}
            <div
                className={
                    isMobile
                        ? 'p-4 overflow-x-hidden'
                        : isTablet
                          ? 'max-w-4xl mx-auto p-4 overflow-x-hidden'
                          : 'max-w-6xl mx-auto p-6 overflow-x-hidden'
                }
                style={{
                    backgroundColor: '#111827',
                    minHeight: '100vh',
                    color: '#FFFFFF',
                    boxSizing: 'border-box',
                }}
            >
                {/* 페이지 제목 - 항상 표시 */}
                <h1
                    className={
                        isMobile
                            ? 'text-xl font-bold mb-4 text-center break-words'
                            : isTablet
                              ? 'text-2xl font-bold mb-5 text-center break-words'
                              : 'text-4xl font-bold mb-6 text-center break-words'
                    }
                    style={{
                        color: '#FFFFFF',
                        padding: isMobile ? '0 8px' : '0',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    모든 콘서트
                </h1>

                {/* 부제목 - 항상 표시 */}
                <p
                    className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                    style={{
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '0 16px' : '0',
                    }}
                >
                    다양한 콘서트를 탐색하고 예매하세요
                </p>

                {/* 콘텐츠 영역 - ConcertDetailPage와 동일한 간격 시스템 */}
                <div
                    className={`space-y-${isMobile ? '4' : isTablet ? '5' : '8'}`}
                >
                    {/* 검색 바 섹션 - 항상 표시 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile
                                ? '16px'
                                : isTablet
                                  ? '20px'
                                  : '24px',
                        }}
                    >
                        <SearchBar
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            loading={loading}
                            placeholder="콘서트 제목, 아티스트, 장소 검색..."
                            autoFocus={false}
                            className="w-full"
                        />
                    </div>

                    {/* 필터 패널 - 항상 표시 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                        }}
                    >
                        <FilterPanel
                            onFilter={handleFilter}
                            onReset={handleShowAll}
                            initialFilters={initialFilters}
                            loading={loading}
                            hasActiveFilters={hasActiveFilters}
                            className="w-full"
                        />
                    </div>

                    {/* 검색/필터 결과 표시 - 조건부 표시 */}
                    {!loading &&
                        concerts.length > 0 &&
                        (hasActiveSearch || hasActiveFilters) && (
                            <div
                                className="rounded-xl shadow-md border-l-4"
                                style={{
                                    backgroundColor: '#1f2937', // gray-800
                                    borderLeftColor: '#3B82F6', // blue-500
                                    border: '1px solid #374151', // gray-700
                                    padding: isMobile
                                        ? '16px'
                                        : isTablet
                                          ? '20px'
                                          : '24px',
                                }}
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                                    <div className="flex-1">
                                        <h3
                                            className={`font-semibold text-blue-300 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}
                                        >
                                            {hasActiveSearch && hasActiveFilters
                                                ? `"${query}" 검색 결과 (필터 적용됨)`
                                                : hasActiveSearch
                                                  ? `"${query}" 검색 결과`
                                                  : '필터링 결과'}
                                        </h3>
                                        <div
                                            className={`text-blue-200 space-y-1 ${isMobile ? 'text-sm' : 'text-base'}`}
                                        >
                                            <p>
                                                총 {totalElements}개의 콘서트를
                                                찾았습니다.
                                            </p>
                                            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0">
                                                {hasActiveSearch && (
                                                    <span className="flex items-center gap-2">
                                                        <span className="text-blue-300">
                                                            🔍
                                                        </span>
                                                        검색어: "{query}"
                                                    </span>
                                                )}
                                                {startDate && (
                                                    <span className="flex items-center gap-2">
                                                        <span className="text-blue-300">
                                                            📅
                                                        </span>
                                                        시작일: {startDate}
                                                    </span>
                                                )}
                                                {endDate && (
                                                    <span className="flex items-center gap-2">
                                                        <span className="text-blue-300">
                                                            📅
                                                        </span>
                                                        종료일: {endDate}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 전체 보기 버튼 */}
                                    <button
                                        onClick={handleShowAll}
                                        className={`${isMobile ? 'w-full' : 'w-auto'} text-blue-300 hover:text-blue-100 font-medium px-4 py-2 rounded-lg border border-blue-400 hover:bg-blue-900 hover:bg-opacity-30 transition-colors disabled:opacity-50`}
                                        style={{
                                            minHeight: isMobile
                                                ? '48px'
                                                : 'auto',
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? '로딩중...' : '🏠 전체 보기'}
                                    </button>
                                </div>
                            </div>
                        )}

                    {/* 콘서트 목록 또는 로딩 UI - 조건부 렌더링 */}
                    {loading ? (
                        <LoadingSkeleton
                            isMobile={isMobile}
                            isTablet={isTablet}
                        />
                    ) : (
                        <div
                            className="rounded-xl shadow-md"
                            style={{
                                backgroundColor: '#1f2937', // gray-800
                                border: '1px solid #374151', // gray-700
                            }}
                        >
                            <ConcertList
                                concerts={concerts}
                                loading={loading}
                                error={error}
                                onConcertClick={handleConcertClick}
                                onPageChange={handlePageChange}
                                onRetry={handleRefresh}
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalElements={totalElements}
                                showAiSummary={true}
                                showPagination={true}
                                sortBy={sortBy}
                                sortDir={sortDir}
                                onSortChange={handleSortChange}
                                showSortOptions={true}
                                emptyMessage={
                                    hasActiveSearch && hasActiveFilters
                                        ? `"${query}" 검색 및 필터 조건에 맞는 콘서트가 없습니다.`
                                        : hasActiveSearch
                                          ? `"${query}"에 대한 검색 결과가 없습니다.`
                                          : hasActiveFilters
                                            ? '필터 조건에 맞는 콘서트가 없습니다.'
                                            : '등록된 콘서트가 없습니다.'
                                }
                                responsive={true}
                                className="w-full"
                            />
                        </div>
                    )}

                    {/* 페이지 하단 정보 - 로딩 중이 아닐 때만 표시 */}
                    {!loading && (
                        <div
                            className="text-center text-gray-400 px-4"
                            style={{
                                fontSize: isMobile ? '12px' : '14px',
                                marginTop: isMobile ? '16px' : '24px',
                            }}
                        >
                            <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-2">
                                {hasActiveSearch || hasActiveFilters ? (
                                    <>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {hasActiveSearch && (
                                                <span className="bg-blue-900 bg-opacity-50 px-3 py-1 rounded-full text-blue-200">
                                                    "{query}" 검색
                                                </span>
                                            )}
                                            {hasActiveFilters && (
                                                <span className="bg-green-900 bg-opacity-50 px-3 py-1 rounded-full text-green-200">
                                                    필터 적용
                                                </span>
                                            )}
                                        </div>
                                        <span className="hidden sm:inline text-gray-500">
                                            |
                                        </span>
                                        <span>
                                            총 {totalElements}개 중{' '}
                                            {currentPage + 1} / {totalPages}{' '}
                                            페이지
                                        </span>
                                    </>
                                ) : (
                                    <span>
                                        총 {totalElements}개의 콘서트 중{' '}
                                        {currentPage + 1} / {totalPages} 페이지
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 모바일에서 하단 여백 */}
                {isMobile && <div className="h-16" aria-hidden="true"></div>}
            </div>
        </div>
    );
}

export default ConcertListPage;
