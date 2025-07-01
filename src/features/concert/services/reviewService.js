// src/features/concert/services/reviewService.js

// 프로젝트 공통 API 클라이언트 import (SuccessResponse 자동 처리, 인터셉터 설정 완료)
import apiClient from '../../../shared/utils/apiClient.js';

/**
 * 리뷰 데이터 유효성 검증 함수 (모듈 레벨)
 * @param {Object} reviewData - 검증할 리뷰 데이터
 */
const validateReviewData = (reviewData) => {
  // 제목 검증
  if (!reviewData.title || reviewData.title.trim().length === 0) {
    throw new Error('리뷰 제목은 필수입니다.');
  }
  if (reviewData.title.length > 100) {
    throw new Error('리뷰 제목은 100자 이하여야 합니다.');
  }

  // 내용 검증
  if (!reviewData.description || reviewData.description.trim().length === 0) {
    throw new Error('리뷰 내용은 필수입니다.');
  }
  if (reviewData.description.length > 1000) {
    throw new Error('리뷰 내용은 1000자 이하여야 합니다.');
  }

  // 평점 검증
  if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
    throw new Error('평점은 1 이상 5 이하여야 합니다.');
  }
  if (!Number.isInteger(reviewData.rating)) {
    throw new Error('평점은 정수여야 합니다.');
  }

  // 닉네임 검증
  if (!reviewData.userNickname || reviewData.userNickname.trim().length === 0) {
    throw new Error('작성자 닉네임은 필수입니다.');
  }
  if (reviewData.userNickname.length > 50) {
    throw new Error('작성자 닉네임은 50자 이하여야 합니다.');
  }

  // 사용자 ID 검증
  if (!reviewData.userId || reviewData.userId < 1) {
    throw new Error('작성자 ID는 1 이상이어야 합니다.');
  }
};

/**
 * 리뷰(후기) 관련 API 호출 서비스
 * 백엔드의 ReviewController와 ConcertController의 리뷰 관련 엔드포인트와 1:1 매핑
 */
export const reviewService = {

  /**
   * 특정 콘서트의 리뷰 목록을 페이지네이션과 정렬로 조회
   */
  async getConcertReviews(params) {
    try {
      const { concertId, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc' } = params;

      // concertId 유효성 검증
      if (!concertId || concertId < 1) {
        throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
      }

      // 페이지네이션 파라미터 유효성 검증
      if (page < 0) {
        throw new Error('페이지 번호는 0 이상이어야 합니다.');
      }
      if (size < 1 || size > 100) {
        throw new Error('페이지 크기는 1 이상 100 이하여야 합니다.');
      }

      // 정렬 기준 유효성 검증
      const allowedSortFields = ['createdAt', 'rating', 'title'];
      if (!allowedSortFields.includes(sortBy)) {
        throw new Error(`정렬 기준은 ${allowedSortFields.join(', ')} 중 하나여야 합니다.`);
      }

      // 정렬 방향 유효성 검증
      const allowedSortDirections = ['asc', 'desc'];
      if (!allowedSortDirections.includes(sortDir.toLowerCase())) {
        throw new Error('정렬 방향은 asc 또는 desc여야 합니다.');
      }

      // API 요청
      const response = await apiClient.get(`/concerts/reviews/${concertId}`, {
        params: {
          page,
          size,
          sortBy,
          sortDir
        }
      });

      return response;

    } catch (error) {
      console.error(`리뷰 목록 조회 실패 (콘서트 ID: ${params.concertId}):`, error);
      throw error;
    }
  },

  /**
   * 특정 리뷰 상세 조회
   */
  async getReviewDetail(concertId, reviewId) {
    try {
      if (!concertId || concertId < 1) {
        throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
      }
      if (!reviewId || reviewId < 1) {
        throw new Error('리뷰 ID는 1 이상의 양수여야 합니다.');
      }

      const response = await apiClient.get(`/concerts/${concertId}/reviews/${reviewId}`);
      return response;

    } catch (error) {
      console.error(`리뷰 상세 조회 실패 (콘서트 ID: ${concertId}, 리뷰 ID: ${reviewId}):`, error);
      throw error;
    }
  },

  /**
   * 새로운 리뷰 작성
   */
  async createReview(concertId, reviewData) {
    try {
      // concertId 유효성 검증
      if (!concertId || concertId < 1) {
        throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
      }

      // 리뷰 데이터 유효성 검증 (모듈 레벨 함수 사용)
      validateReviewData(reviewData);

      // 요청 바디 구성
      const payload = {
        title: reviewData.title.trim(),
        description: reviewData.description.trim(),
        rating: reviewData.rating,
        userNickname: reviewData.userNickname.trim(),
        userId: reviewData.userId,
        concertId: concertId
      };

      // POST 요청
      const response = await apiClient.post(`/concerts/${concertId}/reviews`, payload);
      return response;

    } catch (error) {
      console.error(`리뷰 작성 실패 (콘서트 ID: ${concertId}):`, error);
      throw error;
    }
  },

  /**
   * 기존 리뷰 수정
   */
  async updateReview(concertId, reviewId, reviewData) {
    try {
      // ID 파라미터 유효성 검증
      if (!concertId || concertId < 1) {
        throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
      }
      if (!reviewId || reviewId < 1) {
        throw new Error('리뷰 ID는 1 이상의 양수여야 합니다.');
      }

      // 수정할 데이터 유효성 검증 (모듈 레벨 함수 사용)
      validateReviewData(reviewData);

      // 수정 요청 바디 구성
      const payload = {
        title: reviewData.title.trim(),
        description: reviewData.description.trim(),
        rating: reviewData.rating,
        userNickname: reviewData.userNickname.trim(),
        userId: reviewData.userId
      };

      // PUT 요청
      const response = await apiClient.put(`/concerts/${concertId}/reviews/${reviewId}`, payload);
      return response;

    } catch (error) {
      console.error(`리뷰 수정 실패 (리뷰 ID: ${reviewId}):`, error);
      throw error;
    }
  },

  /**
   * 리뷰 삭제
   */
  async deleteReview(concertId, reviewId) {
    try {
      // ID 파라미터 유효성 검증
      if (!concertId || concertId < 1) {
        throw new Error('콘서트 ID는 1 이상의 양수여야 합니다.');
      }
      if (!reviewId || reviewId < 1) {
        throw new Error('리뷰 ID는 1 이상의 양수여야 합니다.');
      }

      // DELETE 요청
      const response = await apiClient.delete(`/concerts/${concertId}/reviews/${reviewId}`);
      return response;

    } catch (error) {
      console.error(`리뷰 삭제 실패 (리뷰 ID: ${reviewId}):`, error);
      throw error;
    }
  }
};