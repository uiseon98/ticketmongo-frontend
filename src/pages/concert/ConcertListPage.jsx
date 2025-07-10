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
            <div
                className="container mx-auto p-4 space-y-6"
                style={{
                    backgroundColor: '#0F172A',
                    minHeight: '100vh',
                    color: '#FFFFFF',
                }}
            >
                {/* 로딩 중일 때도 다크 테마 유지 */}
                {loading && (
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            minHeight: '200px',
                            backgroundColor: '#0F172A',
                            color: '#FFFFFF',
                        }}
                    >
                        콘서트 목록을 불러오는 중...
                    </div>
                )}
                <h1 className="text-3xl font-bold mb-6 text-center text-white">
                    모든 콘서트
                </h1>

                {/* 검색 바 컴포넌트 */}
                <div
                    className="p-4 rounded-lg shadow-md"
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
                    />
                </div>

                {/* 필터 패널 컴포넌트 */}
                <div
                    className="rounded-lg shadow-md"
                    style={{
                        backgroundColor: '#1E293B',
                        border: '1px solid #374151',
                    }}
                >
                    <FilterPanel
                        onFilter={handleFilter}
                        onReset={handleShowAll} // 🔥 새로 추가된 prop
                        initialFilters={initialFilters}
                        loading={loading}
                        compact={false}
                        hasActiveFilters={hasActiveFilters} // 🔥 새로 추가된 prop
                    />
                </div>

                {/* 검색/필터 결과 표시 */}
                {concerts.length > 0 &&
                    (hasActiveSearch || hasActiveFilters) && (
                        <div
                            className="p-4 rounded-lg border-l-4"
                            style={{
                                backgroundColor: '#1E293B',
                                borderLeftColor: '#3B82F6',
                                border: '1px solid #374151',
                            }}
                        >
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-semibold text-blue-800 mb-1">
                                        {hasActiveSearch && hasActiveFilters
                                            ? `"${query}" 검색 결과 (필터 적용됨)`
                                            : hasActiveSearch
                                              ? `"${query}" 검색 결과`
                                              : '필터링 결과'}
                                    </h3>
                                    <p className="text-sm text-blue-600">
                                        총 {totalElements}개의 콘서트를
                                        찾았습니다.
                                        {hasActiveSearch &&
                                            ` | 검색어: "${query}"`}
                                        {startDate && ` | 시작일: ${startDate}`}
                                        {endDate && ` | 종료일: ${endDate}`}
                                    </p>
                                </div>
                                <button
                                    onClick={handleShowAll}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 rounded border border-blue-300 hover:bg-blue-50 transition-colors"
                                    disabled={loading}
                                >
                                    {loading ? '로딩중...' : '🏠 전체 보기'}
                                </button>
                            </div>
                        </div>
                    )}

                {/* 콘서트 목록 컴포넌트 */}
                <div className="bg-white rounded-lg shadow-md">
                    <ConcertList
                        concerts={concerts}
                        loading={loading}
                        error={error}
                        onConcertClick={handleConcertClick}
                        onPageChange={handlePageChange}
                        onRetry={handleRefresh}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        showAiSummary={true} // AI 요약 표시
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
                    />
                </div>

                {/* 페이지 하단 정보 */}
                <div className="text-center text-gray-500 text-sm">
                    <p>
                        {hasActiveSearch || hasActiveFilters ? (
                            <>
                                {hasActiveSearch && `"${query}" 검색`}
                                {hasActiveSearch && hasActiveFilters && ' + '}
                                {hasActiveFilters && '필터'} 결과: 총{' '}
                                {totalElements}개의 콘서트 중 {currentPage + 1}{' '}
                                / {totalPages} 페이지
                            </>
                        ) : (
                            <>
                                총 {totalElements}개의 콘서트 중{' '}
                                {currentPage + 1} / {totalPages} 페이지
                            </>
                        )}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default ConcertListPage;
