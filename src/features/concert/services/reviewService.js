// src/features/concert/services/reviewService.js

// 프로젝트 공통 API 클라이언트 import (SuccessResponse 자동 처리, 인터셉터 설정 완료)
import apiClient from "../../../shared/utils/apiClient.js";

/**
 * 리뷰(후기) 관련 API 호출 서비스
 * 백엔드의 ReviewController와 ConcertController의 리뷰 관련 엔드포인트와 1:1 매핑
 *
 * 📋 지원하는 기능:
 * - 리뷰 목록 조회 (페이지네이션 + 정렬)
 * - 리뷰 상세 조회
 * - 리뷰 작성
 * - 리뷰 수정
 * - 리뷰 삭제
 *
 * 🔗 백엔드 엔드포인트:
 * - GET    /api/concerts/reviews/{concertId}?page=...&size=...&sortBy=...&sortDir=...
 * - GET    /api/concerts/{concertId}/reviews/{reviewId} (상세 조회)
 * - POST   /api/concerts/{concertId}/reviews
 * - PUT    /api/concerts/{concertId}/reviews/{reviewId}
 * - DELETE /api/concerts/{concertId}/reviews/{reviewId}
 */
export const reviewService = {
  /**
   * 특정 콘서트의 리뷰 목록을 페이지네이션과 정렬로 조회
   * 백엔드: GET /api/concerts/reviews/{concertId}?page=...&size=...&sortBy=...&sortDir=...
   *
   * @param {import('../types/review.js').ReviewListParams} params - 조회 파라미터
   * @param {number} params.concertId - 콘서트 ID (필수, 1 이상의 양수)
   * @param {number} params.page - 페이지 번호 (0부터 시작, 기본값 0)
   * @param {number} params.size - 페이지 크기 (1-100, 기본값 10)
   * @param {string} params.sortBy - 정렬 기준 (createdAt/rating/title, 기본값 createdAt)
   * @param {string} params.sortDir - 정렬 방향 (asc/desc, 기본값 desc)
   * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/concert.js').PageResponse<import('../types/review.js').Review[]>>>}
   */
  async getConcertReviews(params) {
    try {
      // params에서 필요한 값들 추출 및 기본값 설정
      const {
        concertId,
        page = 0,
        size = 10,
        sortBy = "createdAt",
        sortDir = "desc",
      } = params;

      // concertId 유효성 검증 - 필수값이고 양수여야 함
      if (!concertId || concertId < 1) {
        throw new Error("콘서트 ID는 1 이상의 양수여야 합니다.");
      }

      // 페이지네이션 파라미터 유효성 검증
      if (page < 0) {
        throw new Error("페이지 번호는 0 이상이어야 합니다.");
      }
      if (size < 1 || size > 100) {
        throw new Error("페이지 크기는 1 이상 100 이하여야 합니다.");
      }

      // 정렬 기준 유효성 검증 (백엔드에서 허용하는 필드만)
      const allowedSortFields = ["createdAt", "rating", "title"];
      if (!allowedSortFields.includes(sortBy)) {
        throw new Error(
          `정렬 기준은 ${allowedSortFields.join(", ")} 중 하나여야 합니다.`,
        );
      }

      // 정렬 방향 유효성 검증
      const allowedSortDirections = ["asc", "desc"];
      if (!allowedSortDirections.includes(sortDir.toLowerCase())) {
        throw new Error("정렬 방향은 asc 또는 desc여야 합니다.");
      }

      // API 요청: URL 경로에 concertId 포함, 나머지는 쿼리 파라미터로 전달
      // 결과 예시: /api/concerts/reviews/123?page=0&size=10&sortBy=createdAt&sortDir=desc
      const response = await apiClient.get(`/concerts/reviews/${concertId}`, {
        params: {
          page, // 페이지 번호 (0부터 시작)
          size, // 한 페이지당 리뷰 개수
          sortBy, // 정렬 기준 필드
          sortDir, // 정렬 방향
        },
      });

      // apiClient가 SuccessResponse를 자동 처리하므로 그대로 반환
      // response.data 구조: { content: [], totalElements: number, totalPages: number, ... }
      return response;
    } catch (error) {
      // 어떤 콘서트의 리뷰 조회에서 실패했는지 로그에 기록
      console.error(
        `리뷰 목록 조회 실패 (콘서트 ID: ${params.concertId}):`,
        error,
      );

      // 에러를 컴포넌트로 전달하여 사용자에게 적절한 에러 메시지 표시
      throw error;
    }
  },

  /**
   * 특정 리뷰 상세 조회
   * 백엔드: GET /api/concerts/{concertId}/reviews/{reviewId}
   *
   * @param {number} concertId - 콘서트 ID (필수, 1 이상의 양수)
   * @param {number} reviewId - 리뷰 ID (필수, 1 이상의 양수)
   * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/review.js').Review>>}
   */
  async getReviewDetail(concertId, reviewId) {
    try {
      // ID 파라미터 유효성 검증
      if (!concertId || concertId < 1) {
        throw new Error("콘서트 ID는 1 이상의 양수여야 합니다.");
      }
      if (!reviewId || reviewId < 1) {
        throw new Error("리뷰 ID는 1 이상의 양수여야 합니다.");
      }

      // API 요청: URL 경로에 concertId와 reviewId 모두 포함
      // 결과 예시: /api/concerts/123/reviews/456
      const response = await apiClient.get(
        `/concerts/${concertId}/reviews/${reviewId}`,
      );

      // apiClient가 SuccessResponse를 자동 처리하므로 그대로 반환
      // response.data 구조: Review 객체
      return response;
    } catch (error) {
      // 어떤 리뷰 상세 조회에서 실패했는지 로그에 기록
      console.error(
        `리뷰 상세 조회 실패 (콘서트 ID: ${concertId}, 리뷰 ID: ${reviewId}):`,
        error,
      );

      // 에러를 컴포넌트로 전달하여 사용자에게 적절한 에러 메시지 표시
      throw error;
    }
  },

  /**
   * 새로운 리뷰 작성
   * 백엔드: POST /api/concerts/{concertId}/reviews
   *
   * @param {number} concertId - 콘서트 ID (URL 경로에 포함)
   * @param {import('../types/review.js').ReviewFormData} reviewData - 작성할 리뷰 데이터
   * @param {string} reviewData.title - 리뷰 제목 (필수, 최대 100자)
   * @param {string} reviewData.description - 리뷰 내용 (필수, 최대 1000자)
   * @param {number} reviewData.rating - 평점 (필수, 1-5점)
   * @param {string} reviewData.userNickname - 작성자 닉네임 (필수, 최대 50자)
   * @param {number} reviewData.userId - 작성자 ID (필수, 1 이상)
   * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/review.js').Review>>}
   */

  /**
   * 리뷰 데이터 유효성 검증
   * @private
   */
  _validateReviewData(reviewData) {
    // 제목 검증
    if (!reviewData.title || reviewData.title.trim().length === 0) {
      throw new Error("리뷰 제목은 필수입니다.");
    }
    if (reviewData.title.length > 100) {
      throw new Error("리뷰 제목은 100자 이하여야 합니다.");
    }

    // 내용 검증
    if (!reviewData.description || reviewData.description.trim().length === 0) {
      throw new Error("리뷰 내용은 필수입니다.");
    }
    if (reviewData.description.length > 1000) {
      throw new Error("리뷰 내용은 1000자 이하여야 합니다.");
    }

    // 평점 검증
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error("평점은 1 이상 5 이하여야 합니다.");
    }
    if (!Number.isInteger(reviewData.rating)) {
      throw new Error("평점은 정수여야 합니다.");
    }

    // 닉네임 검증
    if (
      !reviewData.userNickname ||
      reviewData.userNickname.trim().length === 0
    ) {
      throw new Error("작성자 닉네임은 필수입니다.");
    }
    if (reviewData.userNickname.length > 50) {
      throw new Error("작성자 닉네임은 50자 이하여야 합니다.");
    }

    // 사용자 ID 검증
    if (!reviewData.userId || reviewData.userId < 1) {
      throw new Error("작성자 ID는 1 이상이어야 합니다.");
    }
  },

  async createReview(concertId, reviewData) {
    try {
      // concertId 유효성 검증
      if (!concertId || concertId < 1) {
        throw new Error("콘서트 ID는 1 이상의 양수여야 합니다.");
      }
      // 리뷰 데이터 유효성 검증
      this._validateReviewData(reviewData);

      // 요청 바디 구성 - 백엔드 ReviewDTO 형식에 맞춤
      const payload = {
        title: reviewData.title.trim(), // 앞뒤 공백 제거
        description: reviewData.description.trim(), // 앞뒤 공백 제거
        rating: reviewData.rating, // 1-5 평점
        userNickname: reviewData.userNickname.trim(), // 앞뒤 공백 제거
        userId: reviewData.userId, // 작성자 ID
        concertId: concertId, // URL과 일치성 확인용
      };

      // POST 요청: 두 번째 파라미터가 request body
      const response = await apiClient.post(
        `/concerts/${concertId}/reviews`,
        payload,
      );

      // 성공 시 생성된 리뷰 정보 반환
      return response;
    } catch (error) {
      console.error(`리뷰 작성 실패 (콘서트 ID: ${concertId}):`, error);
      throw error;
    }
  },

  /**
   * 기존 리뷰 수정
   * 백엔드: PUT /api/concerts/{concertId}/reviews/{reviewId}
   *
   * @param {number} concertId - 콘서트 ID
   * @param {number} reviewId - 수정할 리뷰 ID
   * @param {import('../types/review.js').ReviewFormData} reviewData - 수정할 데이터
   * @returns {Promise<import('../types/concert.js').ApiResponse<import('../types/review.js').Review>>}
   */
  async updateReview(concertId, reviewId, reviewData) {
    try {
      // ID 파라미터 유효성 검증
      if (!concertId || concertId < 1) {
        throw new Error("콘서트 ID는 1 이상의 양수여야 합니다.");
      }
      if (!reviewId || reviewId < 1) {
        throw new Error("리뷰 ID는 1 이상의 양수여야 합니다.");
      }

      // 수정할 데이터 유효성 검증 (생성 시와 동일한 규칙)

      // 제목 검증
      if (!reviewData.title || reviewData.title.trim().length === 0) {
        throw new Error("리뷰 제목은 필수입니다.");
      }
      if (reviewData.title.length > 100) {
        throw new Error("리뷰 제목은 100자 이하여야 합니다.");
      }

      // 내용 검증
      if (
        !reviewData.description ||
        reviewData.description.trim().length === 0
      ) {
        throw new Error("리뷰 내용은 필수입니다.");
      }
      if (reviewData.description.length > 1000) {
        throw new Error("리뷰 내용은 1000자 이하여야 합니다.");
      }

      // 평점 검증
      if (
        !reviewData.rating ||
        reviewData.rating < 1 ||
        reviewData.rating > 5
      ) {
        throw new Error("평점은 1 이상 5 이하여야 합니다.");
      }
      if (!Number.isInteger(reviewData.rating)) {
        throw new Error("평점은 정수여야 합니다.");
      }

      // 닉네임 검증
      if (
        !reviewData.userNickname ||
        reviewData.userNickname.trim().length === 0
      ) {
        throw new Error("작성자 닉네임은 필수입니다.");
      }
      if (reviewData.userNickname.length > 50) {
        throw new Error("작성자 닉네임은 50자 이하여야 합니다.");
      }

      // 사용자 ID 검증
      if (!reviewData.userId || reviewData.userId < 1) {
        throw new Error("작성자 ID는 1 이상이어야 합니다.");
      }

      // 수정 요청 바디 구성
      const payload = {
        title: reviewData.title.trim(), // 수정된 리뷰 제목
        description: reviewData.description.trim(), // 수정된 리뷰 내용
        rating: reviewData.rating, // 수정된 평점
        userNickname: reviewData.userNickname.trim(), // 수정된 닉네임 (보통 변경되지 않음)
        userId: reviewData.userId, // 권한 확인용 사용자 ID
      };

      // PUT 요청으로 기존 리뷰 전체 내용 교체
      // URL에 concertId와 reviewId 모두 포함 (백엔드 권한 확인용)
      const response = await apiClient.put(
        `/concerts/${concertId}/reviews/${reviewId}`,
        payload,
      );

      // 수정된 리뷰 정보 반환
      return response;
    } catch (error) {
      console.error(`리뷰 수정 실패 (리뷰 ID: ${reviewId}):`, error);
      throw error;
    }
  },

  /**
   * 리뷰 삭제
   * 백엔드: DELETE /api/concerts/{concertId}/reviews/{reviewId}
   *
   * @param {number} concertId - 콘서트 ID
   * @param {number} reviewId - 삭제할 리뷰 ID
   * @returns {Promise<import('../types/concert.js').ApiResponse<null>>}
   */
  async deleteReview(concertId, reviewId) {
    try {
      // ID 파라미터 유효성 검증
      if (!concertId || concertId < 1) {
        throw new Error("콘서트 ID는 1 이상의 양수여야 합니다.");
      }
      if (!reviewId || reviewId < 1) {
        throw new Error("리뷰 ID는 1 이상의 양수여야 합니다.");
      }

      // DELETE 요청: request body 없음, URL에 필요한 ID들 포함
      // 백엔드에서 사용자 권한 확인 후 삭제 처리
      const response = await apiClient.delete(
        `/concerts/${concertId}/reviews/${reviewId}`,
      );

      // 삭제 성공 시 null 반환 (성공 메시지는 response.message에 포함)
      return response;
    } catch (error) {
      console.error(`리뷰 삭제 실패 (리뷰 ID: ${reviewId}):`, error);
      throw error;
    }
  },
};
