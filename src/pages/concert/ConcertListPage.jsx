// src/pages/concert/ConcertListPage.jsx
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// 새로운 컴포넌트들 import
import ConcertList from '../../features/concert/components/ConcertList.jsx';
import SearchBar from '../../features/concert/components/SearchBar.jsx';
import FilterPanel from '../../features/concert/components/FilterPanel.jsx';

// 새로운 hooks import
import { useConcerts } from '../../features/concert/hooks/useConcerts.js';

function ConcertListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

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

    // 콘서트 카드 클릭 핸들러 (상세 페이지로 이동)
    const handleConcertClick = (concert) => {
        navigate(`/concerts/${concert.concertId}`);
    };

    /**
     * 정렬 변경 핸들러
     */
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
            // URL 파라미터 업데이트
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
        // URL 파라미터에서 query 제거
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('query');
        setSearchParams(newSearchParams);

        // 전체 콘서트 목록 다시 로드
        fetchConcerts();

        console.log('검색 완전히 초기화됨');
    };

    // 필터 적용 핸들러
    const handleFilter = async (filterParams) => {
        try {
            // 빈 값들 제거
            const cleanFilterParams = {};
            if (filterParams.startDate)
                cleanFilterParams.startDate = filterParams.startDate;
            if (filterParams.endDate)
                cleanFilterParams.endDate = filterParams.endDate;

            // URL 파라미터 업데이트
            const newSearchParams = new URLSearchParams();

            // 기존 검색어는 유지 (검색과 필터 동시 사용 가능)
            if (query) {
                newSearchParams.set('query', query);
            }

            Object.entries(cleanFilterParams).forEach(([key, value]) => {
                if (value) newSearchParams.set(key, value.toString());
            });

            if (Object.keys(cleanFilterParams).length > 0) {
                await filterConcerts(cleanFilterParams);
            } else {
                // 필터가 없으면서 검색어도 없으면 전체 목록 조회
                if (!query) {
                    await fetchConcerts();
                } else {
                    // 검색어는 있는 경우 검색 유지
                    await searchConcerts(query);
                }
            }

            setSearchParams(newSearchParams);
        } catch (err) {
            console.error('필터링 실패:', err);
        }
    };

    // 전체 보기 핸들러 (FilterPanel의 onReset용)
    const handleShowAll = async () => {
        try {
            // URL 파라미터 완전 초기화
            setSearchParams(new URLSearchParams());

            // 전체 콘서트 목록 로드
            await fetchConcerts();

            console.log('전체 콘서트 보기로 전환됨');
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
        // 현재 URL 파라미터에 따라 적절한 API 호출
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

    // 초기 필터 값들 (URL 파라미터 기반)
    const initialFilters = {
        startDate: startDate,
        endDate: endDate,
    };

    return (
        <div
            style={{
                backgroundColor: '#0F172A',
                minHeight: '100vh',
                width: '100vw',
                margin: 0,
                padding: 0,
            }}
        >
            {/* 🎯 반응형 컨테이너 - 패딩과 간격 최적화 */}
            <div
                className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6"
                style={{
                    backgroundColor: '#0F172A',
                    minHeight: '100vh',
                    color: '#FFFFFF',
                }}
            >
                {/* 🎯 로딩 상태 - 반응형 개선 */}
                {loading && (
                    <div
                        className="flex justify-center items-center min-h-[200px] sm:min-h-[300px]"
                        style={{
                            backgroundColor: '#0F172A',
                            color: '#FFFFFF',
                        }}
                    >
                        <div className="text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mb-4"></div>
                            <p className="text-sm sm:text-base">콘서트 목록을 불러오는 중...</p>
                        </div>
                    </div>
                )}

                {/* 🎯 메인 제목 - 반응형 크기 조정 */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-white mb-4 sm:mb-6 px-4">
                    모든 콘서트
                </h1>

                {/* 🎯 검색 바 섹션 - 모바일 최적화 */}
                <div
                    className="p-3 sm:p-4 lg:p-6 rounded-lg shadow-md"
                    style={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #374151',
                    }}
                >
                    <SearchBar
                        onSearch={handleSearch}
                        onClear={handleClearSearch}
                        loading={loading}
                        placeholder="콘서트 제목, 아티스트, 장소 검색..."
                        autoFocus={false}
                        className="w-full" // SearchBar 내부에서 반응형 처리
                    />
                </div>

                {/* 🎯 필터 패널 - 모바일에서 접기/펼치기 고려 */}
                <div
                    className="rounded-lg shadow-md"
                    style={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #374151',
                    }}
                >
                    <FilterPanel
                        onFilter={handleFilter}
                        onReset={handleShowAll}
                        initialFilters={initialFilters}
                        loading={loading}
                        compact={false} // 모바일에서는 컴팩트 모드 고려
                        hasActiveFilters={hasActiveFilters}
                        className="w-full" // FilterPanel 내부에서 반응형 처리
                    />
                </div>

                {/* 🎯 검색/필터 결과 표시 - 모바일 최적화 */}
                {concerts.length > 0 && (hasActiveSearch || hasActiveFilters) && (
                    <div
                        className="p-3 sm:p-4 lg:p-6 rounded-lg border-l-4"
                        style={{
                            backgroundColor: '#1E293B',
                            borderLeftColor: '#3B82F6',
                            border: '1px solid #374151',
                        }}
                    >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-300 mb-1 text-sm sm:text-base">
                                    {hasActiveSearch && hasActiveFilters
                                        ? `"${query}" 검색 결과 (필터 적용됨)`
                                        : hasActiveSearch
                                          ? `"${query}" 검색 결과`
                                          : '필터링 결과'}
                                </h3>
                                <div className="text-xs sm:text-sm text-blue-200 space-y-1">
                                    <p>총 {totalElements}개의 콘서트를 찾았습니다.</p>
                                    {/* 🎯 모바일에서는 조건들을 세로로 나열 */}
                                    <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-1 sm:space-y-0">
                                        {hasActiveSearch && (
                                            <span className="flex items-center gap-1">
                                                <span className="text-blue-300">🔍</span>
                                                검색어: "{query}"
                                            </span>
                                        )}
                                        {startDate && (
                                            <span className="flex items-center gap-1">
                                                <span className="text-blue-300">📅</span>
                                                시작일: {startDate}
                                            </span>
                                        )}
                                        {endDate && (
                                            <span className="flex items-center gap-1">
                                                <span className="text-blue-300">📅</span>
                                                종료일: {endDate}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 🎯 전체 보기 버튼 - 모바일에서 풀 너비 */}
                            <button
                                onClick={handleShowAll}
                                className="w-full sm:w-auto text-blue-300 hover:text-blue-100 text-sm font-medium px-4 py-2 rounded-lg border border-blue-400 hover:bg-blue-900 hover:bg-opacity-30 transition-colors disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? '로딩중...' : '🏠 전체 보기'}
                            </button>
                        </div>
                    </div>
                )}

                {/* 🎯 콘서트 목록 - 반응형 그리드 적용 */}
                <div className="bg-gray-800 rounded-lg shadow-md border border-gray-600">
                    <ConcertList
                        concerts={concerts}
                        loading={loading}
                        error={error}
                        onConcertClick={handleConcertClick}
                        onPageChange={handlePageChange}
                        onRetry={handleRefresh}
                        currentPage={currentPage}
                        totalPages={totalPages}
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
                        // 🎯 ConcertList에 반응형 관련 props 추가
                        responsive={true}
                        className="w-full"
                    />
                </div>

                {/* 🎯 페이지 하단 정보 - 모바일 최적화 */}
                <div className="text-center text-gray-400 text-xs sm:text-sm px-4">
                    <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-2">
                        {hasActiveSearch || hasActiveFilters ? (
                            <>
                                <div className="flex flex-wrap justify-center gap-1">
                                    {hasActiveSearch && (
                                        <span className="bg-blue-900 bg-opacity-50 px-2 py-1 rounded text-blue-200">
                                            "{query}" 검색
                                        </span>
                                    )}
                                    {hasActiveFilters && (
                                        <span className="bg-green-900 bg-opacity-50 px-2 py-1 rounded text-green-200">
                                            필터 적용
                                        </span>
                                    )}
                                </div>
                                <span className="hidden sm:inline">|</span>
                                <span>
                                    총 {totalElements}개 중 {currentPage + 1} / {totalPages} 페이지
                                </span>
                            </>
                        ) : (
                            <span>
                                총 {totalElements}개의 콘서트 중 {currentPage + 1} / {totalPages} 페이지
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ConcertListPage;