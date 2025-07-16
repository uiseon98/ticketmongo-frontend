import { useState, useEffect, useCallback } from 'react';
import { expectationService } from '../services/expectationService.js';
import { ExpectationDefaults } from '../types/expectation.js';

export const useExpectations = (concertId) => {
    const [expectations, setExpectations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(ExpectationDefaults.pageSize); // 🔧 수정: 고정값으로 변경 (setPageSize 제거)
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchExpectations = useCallback(
        async (params = {}) => {
            try {
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }

                setLoading(true);
                setError(null);

                const requestParams = {
                    concertId,
                    page: params.page !== undefined ? params.page : currentPage,
                    size: pageSize, // 🔧 수정: 고정된 pageSize 사용
                };

                const response =
                    await expectationService.getConcertExpectations(
                        requestParams,
                    );

                if (response && response.data) {
                    setExpectations(response.data.content || []);
                    setCurrentPage(response.data.number || 0);
                    setTotalPages(response.data.totalPages || 0);
                    setTotalElements(response.data.totalElements || 0);
                    // 🔧 수정: setPageSize 제거 (고정값이므로 불필요)

                    console.info(
                        `기대평 목록 로드 완료: ${response.data.content?.length || 0}개 (콘서트 ID: ${concertId})`,
                    );
                } else {
                    setExpectations([]);
                    setError('기대평 데이터를 불러올 수 없습니다.');
                }
            } catch (err) {
                console.error(
                    `기대평 목록 조회 실패 (콘서트 ID: ${concertId}):`,
                    err,
                );
                setError(
                    err.message ||
                        '기대평 목록을 불러오는 중 오류가 발생했습니다.',
                );
                setExpectations([]);
            } finally {
                setLoading(false);
            }
        },
        [concertId, currentPage, pageSize], // 의존성 그대로 유지
    );

    const createExpectation = useCallback(
        async (expectationData) => {
            try {
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }

                setActionLoading(true);
                setError(null);

                const response = await expectationService.createExpectation(
                    concertId,
                    expectationData,
                );

                await fetchExpectations({ page: 0 });

                console.info(
                    `기대평 작성 완료: 기대점수 ${expectationData.expectationRating}점 (콘서트 ID: ${concertId})`,
                );

                return response.data;
            } catch (err) {
                console.error(
                    `기대평 작성 실패 (콘서트 ID: ${concertId}):`,
                    err,
                );
                setError(err.message || '기대평 작성 중 오류가 발생했습니다.');
                throw err;
            } finally {
                setActionLoading(false);
            }
        },
        [concertId, fetchExpectations],
    );

    const updateExpectation = useCallback(
        async (expectationId, expectationData) => {
            try {
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }
                if (!expectationId || expectationId < 1) {
                    throw new Error('유효한 기대평 ID가 필요합니다.');
                }

                setActionLoading(true);
                setError(null);

                const response = await expectationService.updateExpectation(
                    concertId,
                    expectationId,
                    expectationData,
                );

                await fetchExpectations();

                console.info(
                    `기대평 수정 완료: ID ${expectationId} (콘서트 ID: ${concertId})`,
                );

                return response.data;
            } catch (err) {
                console.error(
                    `기대평 수정 실패 (기대평 ID: ${expectationId}):`,
                    err,
                );
                setError(err.message || '기대평 수정 중 오류가 발생했습니다.');
                throw err;
            } finally {
                setActionLoading(false);
            }
        },
        [concertId, fetchExpectations],
    );

    const deleteExpectation = useCallback(
        async (expectationId) => {
            try {
                if (!concertId || concertId < 1) {
                    throw new Error('유효한 콘서트 ID가 필요합니다.');
                }
                if (!expectationId || expectationId < 1) {
                    throw new Error('유효한 기대평 ID가 필요합니다.');
                }

                setActionLoading(true);
                setError(null);

                await expectationService.deleteExpectation(
                    concertId,
                    expectationId,
                );

                const currentExpectationCount = expectations.length;
                if (currentExpectationCount === 1 && currentPage > 0) {
                    await fetchExpectations({ page: currentPage - 1 });
                } else {
                    await fetchExpectations();
                }

                console.info(
                    `기대평 삭제 완료: ID ${expectationId} (콘서트 ID: ${concertId})`,
                );
            } catch (err) {
                console.error(
                    `기대평 삭제 실패 (기대평 ID: ${expectationId}):`,
                    err,
                );
                setError(err.message || '기대평 삭제 중 오류가 발생했습니다.');
                throw err;
            } finally {
                setActionLoading(false);
            }
        },
        [concertId, fetchExpectations, expectations.length, currentPage],
    );

    const goToPage = useCallback(
        async (newPage) => {
            if (newPage < 0 || newPage >= totalPages) {
                console.warn(
                    `유효하지 않은 페이지 번호: ${newPage} (범위: 0-${totalPages - 1})`,
                );
                return;
            }

            if (newPage === currentPage) {
                console.info('같은 페이지이므로 API 호출을 건너뜁니다.');
                return;
            }

            await fetchExpectations({ page: newPage });
        },
        [fetchExpectations, totalPages, currentPage],
    );

    const filterByRating = useCallback(
        (rating) => {
            if (rating === null || rating === undefined) {
                return expectations;
            }

            return expectations.filter(
                (expectation) => expectation.expectationRating === rating,
            );
        },
        [expectations],
    );

    useEffect(() => {
        if (concertId && concertId > 0) {
            fetchExpectations({
                page: 0,
            });

            console.info(
                `콘서트 ID ${concertId}의 기대평 목록을 자동 로드합니다.`,
            );
        }
    }, [concertId]);

    return {
        // 📊 데이터 상태
        expectations,
        loading,
        actionLoading,
        error,

        // 📄 페이지네이션 상태
        currentPage,
        totalPages,
        totalElements,
        pageSize, // 읽기 전용으로 유지

        // 🔧 액션 함수들
        fetchExpectations,
        createExpectation,
        updateExpectation,
        deleteExpectation,
        goToPage,

        // 🔍 필터링 함수들
        filterByRating,

        // 🎛️ 편의 기능들
        refresh: () => fetchExpectations(),
        hasNextPage: currentPage < totalPages - 1,
        hasPrevPage: currentPage > 0,
        isEmpty: expectations.length === 0 && !loading,
        isFirstPage: currentPage === 0,
        isLastPage: currentPage === totalPages - 1,

        // 기대평 관련 편의 속성들
        hasExpectations: expectations.length > 0,
    };
};
