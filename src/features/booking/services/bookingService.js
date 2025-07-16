import apiClient from '../../../shared/utils/apiClient';
// 좌석 관련 API는 seatService.js로 분리됨
import { fetchAllSeatStatus, reserveSeat, releaseSeat } from './seatService';

// 좌석 관련 API 함수들을 재수출 (하위 호환성 유지)
export { fetchAllSeatStatus, reserveSeat, releaseSeat };

// 예매 생성 및 결제 준비 API
export async function createBookingAndPreparePayment(bookingCreateRequest) {
    const response = await apiClient.post('/bookings', bookingCreateRequest);
    return response.data; // PaymentExecutionResponse
}

/**
 * 콘서트 대기열 입장 요청
 * 백엔드: POST /api/queue/enter?concertId={concertId}
 * @param {number} concertId - 대기열에 입장할 콘서트 ID
 * @returns {Promise<any>} - 서버에서 반환한 대기열 관련 데이터
 */
export async function enterWaitingQueue(concertId) {
    try {
        const response = await apiClient.post(
            `/queue/enter?concertId=${concertId}`,
        );
        console.log('[enterWaitingQueue] Success:', response);
        return response.data;
    } catch (error) {
        console.error(
            `[enterWaitingQueue] 실패 (concertId: ${concertId}):`,
            error,
        );
        throw error; // 호출자에게 에러를 전달
    }
}

export async function checkQueueStatus(concertId) {
    const response = await apiClient.get(
        `/queue/status?concertId=${concertId}`,
    );
    return response.data; // QueueStatusDto 반환
}

/**
 * 좌석 복구 API
 * 결제 실패 시 호출하는 좌석을 복구하는 API
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<any>} - 서버에서 반환한 좌석 복구 결과
 */
export async function restoreSeats(concertId) {
    try {
        const response = await apiClient.post(
            `/bookings/concerts/${concertId}/seats/restore`,
        );
        console.log('[restoreSeats] Success:', response);
        return response.data;
    } catch (error) {
        console.error(`[restoreSeats] 실패 (concertId: ${concertId}):`, error);
        throw error; // 호출자에게 에러를 전달
    }
}

/**
 * 액세스 키 연장 API
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<any>}
 */
export async function extendAccessKey(concertId) {
    // API 클라이언트의 요청 인터셉터가 자동으로 헤더에 키를 추가해줍니다.
    return await apiClient.patch(`/access-keys/extend?concertId=${concertId}`);
}

/**
 * 액세스 키 즉시 폐기(삭제) API
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<any>}
 */
export async function invalidateAccessKey(concertId) {
    return await apiClient.delete(`/access-keys?concertId=${concertId}`);
}
