// src/features/concert/hooks/useReviews.js

// React에서 제공하는 기본 훅들을 import
// useState: 컴포넌트의 상태(데이터)를 관리하는 훅
// useEffect: 컴포넌트가 렌더링된 후 특정 작업을 수행하는 훅 (API 호출 등)
// useCallback: 함수를 메모이제이션(캐싱)해서 불필요한 재생성을 방지하는 훅
import { useState, useEffect, useCallback } from 'react';

// 우리가 만든 리뷰 서비스 import (실제 API 호출 로직이 들어있음)
import { reviewService } from '../services/reviewService.js';

// 리뷰 관련 타입과 기본값들 import
import { ReviewDefaults } from '../types/review.js';

/**
 * 리뷰(후기) 목록 관리를 위한 커스텀 React 훅
 *
 * 🎯 이 훅이 하는 일:
 * 1. 특정 콘서트의 리뷰 목록 상태 관리 (reviews 배열)
 * 2. API 호출 중인지 상태 관리 (loading boolean)
 * 3. 에러 발생 시 에러 상태 관리 (error 객체/메시지)
 * 4. 페이지네이션 상태 관리 (page, totalPages 등)
 * 5. 정렬 상태 관리 (sortBy, sortDir)
 * 6. 리뷰 목록을 가져오는 함수 제공 (fetchReviews)
 * 7. 리뷰 작성/수정/삭제 함수 제공
 * 8. 정렬 및 페이지 변경 함수 제공
 *
 * 🔄 사용 방법:
 * const { reviews, loading, error, fetchReviews, createReview } = useReviews(concertId);
 *
 * @param {number} concertId - 리뷰를 관리할 콘서트 ID (필수)
 * @returns {Object} 리뷰 관련 상태와 함수들이 담긴 객체
 */
export const useReviews = (concertId) => {
  // ===== 상태(State) 정의 =====
  // React의 useState 훅을 사용해서 컴포넌트의 상태를 정의

  // 리뷰 목록 데이터를 저장하는 상태
  // 초기값: 빈 배열 []
  const [reviews, setReviews] = useState([]);

  // API 호출 중인지 여부를 나타내는 상태
  // 초기값: false (로딩 중이 아님)
  const [loading, setLoading] = useState(false);

  // 에러 발생 시 에러 정보를 저장하는 상태
  // 초기값: null (에러 없음)
  const [error, setError] = useState(null);

  // 페이지네이션 관련 상태들
  // 현재 페이지 번호 (0부터 시작)
  const [currentPage, setCurrentPage] = useState(0);

  // 한 페이지당 보여줄 리뷰 개수 (기본값: 10개)
  const [pageSize, setPageSize] = useState(ReviewDefaults.pageSize);

  // 전체 페이지 수 (API에서 받아옴)
  const [totalPages, setTotalPages] = useState(0);

  // 전체 리뷰 개수 (API에서 받아옴)
  const [totalElements, setTotalElements] = useState(0);

  // 정렬 관련 상태들
  // 정렬 기준 필드 (createdAt, rating, title 등)
  const [sortBy, setSortBy] = useState(ReviewDefaults.sortBy);

  // 정렬 방향 (asc: 오름차순, desc: 내림차순)
  const [sortDir, setSortDir] = useState(ReviewDefaults.sortDir);

  // 개별 리뷰 작업 상태 (작성/수정/삭제 중인지)
  const [actionLoading, setActionLoading] = useState(false);

  // ===== 함수 정의 =====

  /**
   * 리뷰 목록을 가져오는 함수
   * useCallback으로 감싸서 불필요한 함수 재생성을 방지
   *
   * @param {Object} params - 조회 파라미터 (선택사항)
   * @param {number} params.page - 가져올 페이지 번호 (기본값: currentPage)
   * @param {number} params.size - 페이지 크기 (기본값: pageSize)
   * @param {string} params.sortBy - 정렬 기준 (기본값: sortBy)
   * @param {string} params.sortDir - 정렬 방향 (기본값: sortDir)
   */
  const fetchReviews = useCallback(
    async (params = {}) => {
      try {
        // concertId가 없으면 리뷰를 조회할 수 없음
        if (!concertId || concertId < 1) {
          throw new Error('유효한 콘서트 ID가 필요합니다.');
        }

        // 로딩 시작: 사용자에게 "데이터 가져오는 중"임을 표시
        setLoading(true);

        // 이전 에러 상태 초기화: 새로운 요청이므로 기존 에러 제거
        setError(null);

        // 파라미터 기본값 설정 및 현재 상태와 병합
        const requestParams = {
          concertId, // 콘서트 ID (필수)
          page: params.page ?? currentPage, // 페이지 번호 (기본값: 현재 페이지)
          size: params.size ?? pageSize, // 페이지 크기 (기본값: 현재 페이지 크기)
          sortBy: params.sortBy ?? sortBy, // 정렬 기준 (기본값: 현재 정렬 기준)
          sortDir: params.sortDir ?? sortDir, // 정렬 방향 (기본값: 현재 정렬 방향)
        };

        // 실제 API 호출: reviewService의 getConcertReviews 메서드 사용
        // 백엔드에서 페이지네이션된 리뷰 데이터를 받아옴
        const response = await reviewService.getConcertReviews(requestParams);

        // API 호출 성공 시 받아온 데이터로 상태 업데이트
        if (response && response.data) {
          // 리뷰 목록 데이터 설정
          setReviews(response.data.content || []);

          // 페이지네이션 정보 업데이트
          setCurrentPage(response.data.number || 0); // 현재 페이지
          setTotalPages(response.data.totalPages || 0); // 전체 페이지 수
          setTotalElements(response.data.totalElements || 0); // 전체 리뷰 수
          setPageSize(response.data.size || ReviewDefaults.pageSize); // 페이지 크기

          // 요청한 정렬 정보로 상태 업데이트 (실제 사용된 파라미터로 동기화)
          setSortBy(requestParams.sortBy);
          setSortDir(requestParams.sortDir);

          // 개발/디버깅용 로그: 몇 개의 리뷰를 받았는지 확인
          console.info(
            `리뷰 목록 로드 완료: ${response.data.content?.length || 0}개 (콘서트 ID: ${concertId})`,
          );
        } else {
          // API 응답은 성공했지만 데이터 형식이 예상과 다른 경우
          setReviews([]);
          setError('리뷰 데이터를 불러올 수 없습니다.');
        }
      } catch (err) {
        // API 호출 실패 시 에러 처리
        console.error(`리뷰 목록 조회 실패 (콘서트 ID: ${concertId}):`, err);

        // 사용자에게 보여줄 친화적인 에러 메시지 설정
        setError(err.message || '리뷰 목록을 불러오는 중 오류가 발생했습니다.');

        // 에러 발생 시 빈 배열로 초기화
        setReviews([]);
      } finally {
        // 성공/실패 상관없이 로딩 상태 해제
        setLoading(false);
      }
    },
    [concertId],
  ); // 이 값들이 변경되면 함수 재생성

  /**
   * 새로운 리뷰를 작성하는 함수
   *
   * @param {import('../types/review.js').ReviewFormData} reviewData - 작성할 리뷰 데이터
   * @returns {Promise<import('../types/review.js').Review>} 생성된 리뷰 정보
   */
  const createReview = useCallback(
    async (reviewData) => {
      try {
        // concertId 유효성 검증
        if (!concertId || concertId < 1) {
          throw new Error('유효한 콘서트 ID가 필요합니다.');
        }

        // 개별 작업 로딩 시작 (리뷰 목록 로딩과 구분)
        setActionLoading(true);

        // 에러 상태 초기화
        setError(null);

        // 실제 API 호출: reviewService의 createReview 메서드 사용
        const response = await reviewService.createReview(
          concertId,
          reviewData,
        );

        // 리뷰 작성 성공 시 목록 새로고침
        // 첫 페이지로 이동해서 방금 작성한 리뷰를 보여줌 (최신순 정렬이므로)
        await fetchReviews({ page: 0 });

        // 성공 로그
        console.info(
          `리뷰 작성 완료: "${reviewData.title}" (콘서트 ID: ${concertId})`,
        );

        // 생성된 리뷰 정보 반환 (컴포넌트에서 추가 처리 가능)
        return response.data;
      } catch (err) {
        console.error(`리뷰 작성 실패 (콘서트 ID: ${concertId}):`, err);

        // 에러를 상태에 설정하고 컴포넌트로도 전달
        setError(err.message || '리뷰 작성 중 오류가 발생했습니다.');
        throw err; // 컴포넌트에서 에러 처리를 할 수 있도록 다시 throw
      } finally {
        // 개별 작업 로딩 해제
        setActionLoading(false);
      }
    },
    [concertId, fetchReviews],
  ); // concertId와 fetchReviews가 변경되면 함수 재생성

  /**
   * 기존 리뷰를 수정하는 함수
   *
   * @param {number} reviewId - 수정할 리뷰 ID
   * @param {import('../types/review.js').ReviewFormData} reviewData - 수정할 데이터
   * @returns {Promise<import('../types/review.js').Review>} 수정된 리뷰 정보
   */
  const updateReview = useCallback(
    async (reviewId, reviewData) => {
      try {
        // ID 파라미터 유효성 검증
        if (!concertId || concertId < 1) {
          throw new Error('유효한 콘서트 ID가 필요합니다.');
        }
        if (!reviewId || reviewId < 1) {
          throw new Error('유효한 리뷰 ID가 필요합니다.');
        }

        // 개별 작업 로딩 시작
        setActionLoading(true);
        setError(null);

        // 실제 API 호출: reviewService의 updateReview 메서드 사용
        const response = await reviewService.updateReview(
          concertId,
          reviewId,
          reviewData,
        );

        // 리뷰 수정 성공 시 현재 페이지 새로고침
        // 페이지 위치는 유지하면서 수정된 내용만 반영
        await fetchReviews();

        // 성공 로그
        console.info(
          `리뷰 수정 완료: ID ${reviewId} (콘서트 ID: ${concertId})`,
        );

        // 수정된 리뷰 정보 반환
        return response.data;
      } catch (err) {
        console.error(`리뷰 수정 실패 (리뷰 ID: ${reviewId}):`, err);

        // 에러를 상태에 설정하고 컴포넌트로도 전달
        setError(err.message || '리뷰 수정 중 오류가 발생했습니다.');
        throw err;
      } finally {
        // 개별 작업 로딩 해제
        setActionLoading(false);
      }
    },
    [concertId, fetchReviews],
  ); // concertId와 fetchReviews가 변경되면 함수 재생성

  /**
   * 리뷰를 삭제하는 함수
   *
   * @param {number} reviewId - 삭제할 리뷰 ID
   * @returns {Promise<void>}
   */
  const deleteReview = useCallback(
    async (reviewId) => {
      try {
        // ID 파라미터 유효성 검증
        if (!concertId || concertId < 1) {
          throw new Error('유효한 콘서트 ID가 필요합니다.');
        }
        if (!reviewId || reviewId < 1) {
          throw new Error('유효한 리뷰 ID가 필요합니다.');
        }

        // 개별 작업 로딩 시작
        setActionLoading(true);
        setError(null);

        // 실제 API 호출: reviewService의 deleteReview 메서드 사용
        await reviewService.deleteReview(concertId, reviewId);

        // 리뷰 삭제 성공 시 목록 새로고침
        // 현재 페이지에 리뷰가 없으면 이전 페이지로 이동
        const currentReviewCount = reviews.length;
        if (currentReviewCount === 1 && currentPage > 0) {
          // 현재 페이지의 마지막 리뷰를 삭제한 경우 이전 페이지로 이동
          await fetchReviews({ page: currentPage - 1 });
        } else {
          // 현재 페이지에 다른 리뷰가 있으면 현재 페이지 새로고침
          await fetchReviews();
        }

        // 성공 로그
        console.info(
          `리뷰 삭제 완료: ID ${reviewId} (콘서트 ID: ${concertId})`,
        );
      } catch (err) {
        console.error(`리뷰 삭제 실패 (리뷰 ID: ${reviewId}):`, err);

        // 에러를 상태에 설정하고 컴포넌트로도 전달
        setError(err.message || '리뷰 삭제 중 오류가 발생했습니다.');
        throw err;
      } finally {
        // 개별 작업 로딩 해제
        setActionLoading(false);
      }
    },
    [concertId, fetchReviews, reviews.length, currentPage],
  ); // 의존하는 상태들

  /**
   * 페이지를 변경하는 함수
   *
   * @param {number} newPage - 이동할 페이지 번호
   */
  const goToPage = useCallback(
    async (newPage) => {
      // 페이지 번호 유효성 검증
      if (newPage < 0 || newPage >= totalPages) {
        console.warn(
          `유효하지 않은 페이지 번호: ${newPage} (범위: 0-${totalPages - 1})`,
        );
        return;
      }

      // 현재 페이지와 같으면 불필요한 API 호출 방지
      if (newPage === currentPage) {
        console.info('같은 페이지이므로 API 호출을 건너뜁니다.');
        return;
      }

      // 새로운 페이지의 리뷰 목록 가져오기
      await fetchReviews({ page: newPage });
    },
    [fetchReviews, totalPages, currentPage],
  ); // 이 값들이 변경되면 함수 재생성

  /**
   * 정렬 방식을 변경하는 함수
   *
   * @param {string} newSortBy - 새로운 정렬 기준 (createdAt, rating, title)
   * @param {string} newSortDir - 새로운 정렬 방향 (asc, desc)
   */
  const changeSorting = useCallback(
    async (newSortBy, newSortDir = 'desc') => {
      // 정렬 기준 유효성 검증
      const allowedSortFields = ['createdAt', 'rating', 'title'];
      if (!allowedSortFields.includes(newSortBy)) {
        console.warn(`유효하지 않은 정렬 기준: ${newSortBy}`);
        return;
      }

      // 정렬 방향 유효성 검증
      const allowedSortDirections = ['asc', 'desc'];
      if (!allowedSortDirections.includes(newSortDir)) {
        console.warn(`유효하지 않은 정렬 방향: ${newSortDir}`);
        return;
      }

      // 현재 정렬과 같으면 불필요한 API 호출 방지
      if (newSortBy === sortBy && newSortDir === sortDir) {
        console.info('같은 정렬 방식이므로 API 호출을 건너뜁니다.');
        return;
      }
      console.log('changeSorting 호출됨:', newSortBy, newSortDir);
      // 정렬 변경 시 첫 페이지부터 다시 조회
      await fetchReviews({
        page: 0, // 첫 페이지로 이동
        sortBy: newSortBy, // 새로운 정렬 기준
        sortDir: newSortDir, // 새로운 정렬 방향
      });
    },
    [fetchReviews, sortBy, sortDir],
  ); // 이 값들이 변경되면 함수 재생성

  /**
   * 페이지 크기를 변경하는 함수
   *
   * @param {number} newSize - 새로운 페이지 크기 (1-100)
   */
  const changePageSize = useCallback(
    async (newSize) => {
      // 페이지 크기 유효성 검증
      if (newSize < 1 || newSize > 100) {
        console.warn(`유효하지 않은 페이지 크기: ${newSize} (범위: 1-100)`);
        return;
      }

      // 현재 페이지 크기와 같으면 불필요한 API 호출 방지
      if (newSize === pageSize) {
        console.info('같은 페이지 크기이므로 API 호출을 건너뜁니다.');
        return;
      }

      // 페이지 크기 변경 시 첫 페이지부터 다시 조회
      await fetchReviews({
        page: 0, // 첫 페이지로 이동
        size: newSize, // 새로운 페이지 크기
      });
    },
    [fetchReviews, pageSize],
  ); // 이 값들이 변경되면 함수 재생성

  // ===== 부수 효과(Side Effect) =====

  /**
   * concertId가 변경될 때마다 자동으로 리뷰 목록을 가져오는 효과
   * 새로운 콘서트 페이지로 이동했을 때 해당 콘서트의 리뷰를 자동으로 로드
   */
  useEffect(() => {
    // concertId가 유효한 값일 때만 API 호출
    if (concertId && concertId > 0) {
      // 새로운 콘서트의 리뷰 목록을 첫 페이지부터 기본 설정으로 가져오기
      fetchReviews({
        page: 0, // 첫 페이지
        size: ReviewDefaults.pageSize, // 기본 페이지 크기
        sortBy: sortBy, // 현재 상태 유지
        sortDir: sortDir, // 현재 상태 유지
      });

      // 개발자를 위한 로그: 어떤 콘서트의 리뷰를 가져오는지 확인
      console.info(`콘서트 ID ${concertId}의 리뷰 목록을 자동 로드합니다.`);
    }
  }, [concertId]); // concertID가 변경되면 다시 실행

  // ===== 반환값 =====

  /**
   * 이 훅을 사용하는 컴포넌트에게 제공할 상태와 함수들
   * 컴포넌트에서 구조 분해 할당으로 필요한 것만 가져다 쓸 수 있음
   */
  return {
    // 📊 데이터 상태
    reviews, // 현재 로드된 리뷰 목록 배열
    loading, // 리뷰 목록 로딩 중인지 여부 (true/false)
    actionLoading, // 개별 작업 (작성/수정/삭제) 중인지 여부
    error, // 에러 메시지 (문자열 또는 null)

    // 📄 페이지네이션 상태
    currentPage, // 현재 페이지 번호
    totalPages, // 전체 페이지 수
    totalElements, // 전체 리뷰 개수
    pageSize, // 한 페이지당 리뷰 수

    // 🔍 정렬 상태
    sortBy, // 현재 정렬 기준
    sortDir, // 현재 정렬 방향

    // 🔧 액션 함수들 (컴포넌트에서 호출해서 상태 변경)
    fetchReviews, // 리뷰 목록 새로고침
    createReview, // 새 리뷰 작성
    updateReview, // 기존 리뷰 수정
    deleteReview, // 리뷰 삭제
    goToPage, // 특정 페이지로 이동
    changeSorting, // 정렬 방식 변경
    changePageSize, // 페이지 크기 변경

    // 🎛️ 편의 기능들
    refresh: () => fetchReviews(), // 현재 설정으로 새로고침
    hasNextPage: currentPage < totalPages - 1, // 다음 페이지 있는지 여부
    hasPrevPage: currentPage > 0, // 이전 페이지 있는지 여부
    isEmpty: reviews.length === 0 && !loading, // 리뷰가 비어있는지 (로딩 중이 아닐 때)
    isFirstPage: currentPage === 0, // 첫 페이지인지 여부
    isLastPage: currentPage === totalPages - 1, // 마지막 페이지인지 여부

    // 정렬 관련 편의 기능
    isSortedByDate: sortBy === 'createdAt', // 날짜순 정렬인지
    isSortedByRating: sortBy === 'rating', // 평점순 정렬인지
    isSortedByTitle: sortBy === 'title', // 제목순 정렬인지
    isAscending: sortDir === 'asc', // 오름차순인지
    isDescending: sortDir === 'desc', // 내림차순인지
  };
};
