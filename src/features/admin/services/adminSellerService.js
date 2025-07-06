// src/features/admin/services/adminSellerService.js

import apiClient from '../../../shared/utils/apiClient.js';

export const adminSellerService = {
    /**
     * API-04-01: 대기 중인 판매자 신청 목록 조회
     * GET /api/admin/seller-requests
     */
    async getPendingSellerApplications() {
        try {
            const response = await apiClient.get('/admin/seller-requests');
            return response.data;
        } catch (error) {
            console.error('대기 중인 판매자 신청 목록 조회 실패:', error);
            throw error;
        }
    },

    /**
     * API-04-02: 판매자 신청 승인/반려 처리
     * PATCH /api/admin/seller-requests/{userId}/process
     */
    async processSellerApplication(userId, approve, reason) {
        try {
            const payload = { approve, reason: approve ? null : reason };
            const response = await apiClient.patch(
                `/admin/seller-requests/${userId}/process`,
                payload,
            );
            return response.message;
        } catch (error) {
            console.error(`판매자 신청 처리 실패 (UserID: ${userId}):`, error);
            throw error;
        }
    },

    /**
     * API-04-03: 판매자 강제 권한 해제
     * DELETE /api/admin/sellers/{userId}/role
     */
    async revokeSellerRole(userId, reason) {
        try {
            const payload = { reason }; // DELETE 요청이지만 body에 reason 포함
            const response = await apiClient.delete(
                `/admin/sellers/${userId}/role`,
                { data: payload },
            ); // axios에서 DELETE 요청 body는 `data` 속성으로 전달
            return response.message;
        } catch (error) {
            console.error(
                `판매자 권한 강제 해제 실패 (UserID: ${userId}):`,
                error,
            );
            throw error;
        }
    },

    /**
     * API-04-06: 전체 판매자 이력 목록 조회 (검색, 정렬, 필터 포함)
     * GET /api/admin/approvals/history
     * 백엔드 `SellerApprovalHistory.ActionType`에 맞춰 필터링 타입 정의 필요 (예: `SUBMITTED`, `APPROVED`, `REJECTED`, `REVOKED`, `WITHDRAWN`, `REQUEST`)
     */
    async getAllSellerApprovalHistory(params) {
        try {
            const response = await apiClient.get('/admin/approvals/history', {
                params,
            });
            return response.data; // Page<SellerApprovalHistoryResponseDTO>
        } catch (error) {
            console.error('전체 판매자 이력 목록 조회 실패:', error);
            throw error;
        }
    },

    /**
     * API-04-04: 특정 유저의 판매자 권한 이력 조회 (상세 보기용)
     * GET /api/admin/sellers/{userId}/approval-history
     */
    async getSellerApprovalHistoryForUser(userId) {
        try {
            const response = await apiClient.get(
                `/admin/sellers/${userId}/approval-history`,
            );
            return response.data; // List<SellerApprovalHistoryResponseDTO>
        } catch (error) {
            console.error(
                `특정 유저 이력 조회 실패 (UserID: ${userId}):`,
                error,
            );
            throw error;
        }
    },

    /**
     * API-04-05: 현재 판매자 목록 조회 (관리자)
     * GET /api/admin/sellers
     */
    async getCurrentSellers() {
        try {
            const response = await apiClient.get('/admin/sellers');
            return response.data; // List<AdminSellerApplicationListResponseDTO>
        } catch (error) {
            console.error('현재 판매자 목록 조회 실패:', error);
            throw error;
        }
    },

    /**
     * API-04-07: 특정 판매자 신청서 상세 조회 (관리자)
     * GET /api/admin/seller-requests/{applicationId}
     * @param {number} applicationId - 조회할 판매자 신청서 ID
     * @returns {Promise<import('../../../shared/types/api.types').ApiResponse<AdminSellerApplicationListResponseDTO>>}
     */
    async getSellerApplicationDetail(applicationId) {
        try {
            console.log(
                `adminSellerService.getSellerApplicationDetail 호출됨. 요청 applicationId: ${applicationId}`,
            );
            if (!applicationId || applicationId < 1) {
                console.error('유효하지 않은 신청서 ID:', applicationId);
                throw new Error('유효한 신청서 ID가 필요합니다.');
            }

            const response = await apiClient.get(
                `/admin/seller-requests/${applicationId}`,
            );
            console.log('API 응답 성공:', response.data);
            return response.data;
        } catch (error) {
            console.error(
                `판매자 신청서 상세 조회 실패 (ID: ${applicationId}):`,
                error,
            );
            throw error;
        }
    },
};
