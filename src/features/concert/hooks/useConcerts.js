// src/features/concert/hooks/useConcerts.js

// React에서 제공하는 기본 훅들을 import
// useState: 컴포넌트의 상태(데이터)를 관리하는 훅
// useEffect: 컴포넌트가 렌더링된 후 특정 작업을 수행하는 훅 (API 호출 등)
// useCallback: 함수를 메모이제이션(캐싱)해서 불필요한 재생성을 방지하는 훅
import { useState, useEffect, useCallback } from 'react';

// 우리가 만든 콘서트 서비스 import (실제 API 호출 로직이 들어있음)
import { concertService } from '../services/concertService.js';

/**
 * 콘서트 목록 관리를 위한 커스텀 React 훅
 *
 * 🎯 이 훅이 하는 일:
 * 1. 콘서트 목록 데이터 상태 관리 (concerts 배열)
 * 2. API 호출 중인지 상태 관리 (loading boolean)
 * 3. 에러 발생 시 에러 상태 관리 (error 객체/메시지)
 * 4. 페이지네이션 상태 관리 (page, totalPages 등)
 * 5. 콘서트 목록을 가져오는 함수 제공 (fetchConcerts)
 * 6. 검색 기능 제공 (searchConcerts)
 * 7. 필터링 기능 제공 (filterConcerts)
 *
 * 🔄 사용 방법:
 * const { concerts, loading, error, fetchConcerts } = useConcerts();
 *
 * @returns {Object} 콘서트 관련 상태와 함수들이 담긴 객체
 */
export const useConcerts = () => {
    // ===== 상태(State) 정의 =====
    // React의 useState 훅을 사용해서 컴포넌트의 상태를 정의
    // useState는 [현재값, 값을 변경하는 함수] 배열을 반환

    // 콘서트 목록 데이터를 저장하는 상태
    // 초기값: 빈 배열 []
    const [concerts, setConcerts] = useState([]);

    // API 호출 중인지 여부를 나타내는 상태
    // 초기값: false (로딩 중이 아님)
    const [loading, setLoading] = useState(false);

    // 에러 발생 시 에러 정보를 저장하는 상태
    // 초기값: null (에러 없음)
    const [error, setError] = useState(null);

    // 페이지네이션 관련 상태들
    // 현재 페이지 번호 (0부터 시작)
    const [currentPage, setCurrentPage] = useState(0);

    // 한 페이지당 보여줄 콘서트 개수
    const [pageSize, setPageSize] = useState(20);

    // 전체 페이지 수 (API에서 받아옴)
    const [totalPages, setTotalPages] = useState(0);

    // 전체 콘서트 개수 (API에서 받아옴)
    const [totalElements, setTotalElements] = useState(0);

    // 정렬 관련 상태들
    const [sortBy, setSortBy] = useState('concertDate'); // 정렬 기준
    const [sortDir, setSortDir] = useState('asc'); // 정렬 방향

    // ===== 함수 정의 =====

    /**
     * 콘서트 목록을 가져오는 함수
     * @param {number} page - 가져올 페이지 번호 (기본값: 0)
     * @param {number} size - 페이지 크기 (기본값: 20)
     * @param {string} newSortBy - 정렬 기준 (기본값: 현재 sortBy)
     * @param {string} newSortDir - 정렬 방향 (기본값: 현재 sortDir)
     */
    const fetchConcerts = useCallback(
        async (
            page = 0,
            size = 20,
            newSortBy = sortBy,
            newSortDir = sortDir,
        ) => {
            try {
                setLoading(true);
                setError(null);

                // 실제 API 호출: concertService의 getConcerts 메서드 사용
                const response = await concertService.getConcerts({
                    page,
                    size,
                    sortBy: newSortBy,
                    sortDir: newSortDir,
                });

                // API 호출 성공 시 받아온 데이터로 상태 업데이트
                if (response && response.data) {
                    setConcerts(response.data.content || []);
                    setCurrentPage(response.data.number || 0);
                    setTotalPages(response.data.totalPages || 0);
                    setTotalElements(response.data.totalElements || 0);
                    setPageSize(response.data.size || 20);
                    setSortBy(newSortBy); // 정렬 기준 업데이트
                    setSortDir(newSortDir); // 정렬 방향 업데이트

                    console.log('✅ [API 성공] 콘서트 목록 업데이트 완료:', {
                        concerts: response.data.content?.length,
                        page: response.data.number,
                        totalElements: response.data.totalElements,
                        sortBy: newSortBy,
                        sortDir: newSortDir,
                    });
                } else {
                    setConcerts([]);
                    setError('콘서트 데이터를 불러올 수 없습니다.');
                }
            } catch (err) {
                console.error('❌ [API 오류] 콘서트 목록 조회 실패:', err);
                setError(
                    err.message ||
                        '콘서트 목록을 불러오는 중 오류가 발생했습니다.',
                );
                setConcerts([]);
            } finally {
                setLoading(false);
            }
        },
        [sortBy, sortDir],
    ); // sortBy, sortDir 의존성 추가

    /**
     * 정렬 변경 함수 (서버 정렬)
     * @param {string} newSortBy - 새로운 정렬 기준
     * @param {string} newSortDir - 새로운 정렬 방향
     */
    const changeSorting = useCallback(
        async (newSortBy, newSortDir = 'asc') => {
            const allowedSortFields = [
                'concertDate',
                'title',
                'artist',
                'createdAt',
            ];
            if (!allowedSortFields.includes(newSortBy)) {
                console.warn(`유효하지 않은 정렬 기준: ${newSortBy}`);
                return;
            }

            const allowedSortDirections = ['asc', 'desc'];
            if (!allowedSortDirections.includes(newSortDir)) {
                console.warn(`유효하지 않은 정렬 방향: ${newSortDir}`);
                return;
            }

            // 같은 정렬 기준이면 방향만 토글
            if (newSortBy === sortBy && newSortDir === sortDir) {
                newSortDir = sortDir === 'asc' ? 'desc' : 'asc';
            }

            // 🔥 핵심: 서버에서 정렬된 데이터를 가져오기
            await fetchConcerts(0, pageSize, newSortBy, newSortDir);
        },
        [sortBy, sortDir, fetchConcerts, pageSize],
    );

    /**
     * 콘서트 검색 함수
     * 키워드로 콘서트를 검색
     *
     * @param {string} keyword - 검색할 키워드
     */
    const searchConcerts = useCallback(
        async (keyword) => {
            try {
                // 검색 시작: 로딩 상태 활성화
                setLoading(true);
                setError(null);

                // 키워드가 비어있는지 확인
                if (!keyword || keyword.trim().length === 0) {
                    // 빈 키워드면 전체 목록 조회
                    await fetchConcerts(0, pageSize);
                    return;
                }

                // 실제 검색 API 호출
                const response = await concertService.searchConcerts(
                    keyword.trim(),
                );

                // 검색 결과 처리
                if (response && response.data) {
                    // 검색 결과는 배열 형태 (페이지네이션 없음)
                    setConcerts(response.data);

                    // 검색 결과에는 페이지네이션 정보가 없으므로 기본값 설정
                    setCurrentPage(0);
                    setTotalPages(1); // 검색 결과는 한 페이지에 모두 표시
                    setTotalElements(response.data.length);
                    setPageSize(response.data.length || 20);
                } else {
                    setConcerts([]);
                    setError('검색 결과를 불러올 수 없습니다.');
                }
            } catch (err) {
                console.error('콘서트 검색 실패:', err);
                setError(err.message || '검색 중 오류가 발생했습니다.');
                setConcerts([]);
            } finally {
                setLoading(false);
            }
        },
        [fetchConcerts, pageSize],
    ); // fetchConcerts와 pageSize에 의존

    /**
     * 콘서트 필터링 함수
     * 날짜, 가격 등으로 콘서트를 필터링
     *
     * @param {Object} filterParams - 필터 조건 객체
     */
    const filterConcerts = useCallback(async (filterParams) => {
        try {
            setLoading(true);
            setError(null);

            // 실제 필터링 API 호출
            const response = await concertService.filterConcerts(filterParams);

            if (response && response.data) {
                // 필터링 결과 처리 (검색과 유사)
                setConcerts(response.data);
                setCurrentPage(0);
                setTotalPages(1);
                setTotalElements(response.data.length);
                setPageSize(response.data.length || 20);
            } else {
                setConcerts([]);
                setError('필터링 결과를 불러올 수 없습니다.');
            }
        } catch (err) {
            console.error('콘서트 필터링 실패:', err);
            setError(err.message || '필터링 중 오류가 발생했습니다.');
            setConcerts([]);
        } finally {
            setLoading(false);
        }
    }, []); // 의존성 없음

    /**
     * 페이지 변경 함수
     * 다른 페이지의 콘서트 목록을 가져옴
     *
     * @param {number} newPage - 이동할 페이지 번호
     */
    const goToPage = useCallback(
        async (newPage) => {
            // 페이지 번호가 유효한지 확인
            if (newPage >= 0 && newPage < totalPages) {
                await fetchConcerts(newPage, pageSize);
            }
        },
        [fetchConcerts, totalPages, pageSize],
    ); // 이 변수들이 변경되면 함수 재생성

    /**
     * 페이지 크기 변경 함수
     * 한 페이지에 보여줄 항목 수를 변경
     *
     * @param {number} newSize - 새로운 페이지 크기
     */
    const changePageSize = useCallback(
        async (newSize) => {
            // 유효한 페이지 크기인지 확인 (1~100)
            if (newSize >= 1 && newSize <= 100) {
                setPageSize(newSize);
                // 첫 페이지부터 새로운 크기로 데이터 가져오기
                await fetchConcerts(0, newSize);
            }
        },
        [fetchConcerts],
    );

    // ===== 부수 효과(Side Effect) =====

    /**
     * 컴포넌트가 처음 렌더링될 때 자동으로 콘서트 목록을 가져오는 효과
     * useEffect: 컴포넌트 렌더링 후 실행되는 함수를 정의
     */
    useEffect(() => {
        // 컴포넌트가 마운트(처음 화면에 나타날 때)되면 콘서트 목록 자동 로드
        fetchConcerts(0, 20); // 첫 페이지, 20개씩
    }, [fetchConcerts]); // fetchConcerts가 변경되면 다시 실행 (실제로는 거의 변경되지 않음)

    // ===== 반환값 =====

    /**
     * 이 훅을 사용하는 컴포넌트에게 제공할 상태와 함수들
     * 컴포넌트에서 구조 분해 할당으로 필요한 것만 가져다 쓸 수 있음
     */
    return {
        // 📊 데이터 상태
        concerts, // 현재 로드된 콘서트 목록 배열
        loading, // 로딩 중인지 여부 (true/false)
        error, // 에러 메시지 (문자열 또는 null)

        // 📄 페이지네이션 상태
        currentPage, // 현재 페이지 번호
        totalPages, // 전체 페이지 수
        totalElements, // 전체 콘서트 개수
        pageSize, // 한 페이지당 항목 수

        // 🔄 정렬 상태 (새로 추가)
        sortBy,
        sortDir,

        // 🔧 액션 함수들 (컴포넌트에서 호출해서 상태 변경)
        fetchConcerts, // 콘서트 목록 새로고침
        searchConcerts, // 키워드로 검색
        filterConcerts, // 조건으로 필터링
        goToPage, // 특정 페이지로 이동
        changePageSize, // 페이지 크기 변경
        changeSorting,

        // 🎛️ 편의 기능들
        refresh: () => fetchConcerts(currentPage, pageSize, sortBy, sortDir), // 정렬 상태 유지
        hasNextPage: currentPage < totalPages - 1,
        hasPrevPage: currentPage > 0,
        isEmpty: concerts.length === 0 && !loading,

        // 🔄 정렬 상태 체크 함수들 (새로 추가)
        isSortedByDate: sortBy === 'concertDate',
        isSortedByCreated: sortBy === 'createdAt',
        isSortedByTitle: sortBy === 'title',
        isSortedByArtist: sortBy === 'artist',
        isAscending: sortDir === 'asc',
        isDescending: sortDir === 'desc',
    };
};
