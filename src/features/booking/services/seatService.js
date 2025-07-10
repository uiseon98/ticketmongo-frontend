// src/features/booking/services/seatService.js

import apiClient from '../../../shared/utils/apiClient';

/**
 * 좌석 관련 API 서비스
 * 백엔드 API 컨트롤러 분석 결과를 바탕으로 구현
 */

// ===========================================
// 좌석 상태 조회 관련 API (SeatQueryController)
// ===========================================

/**
 * 콘서트 전체 좌석 상태 조회
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Array>} 좌석 상태 배열
 */
export async function fetchAllSeatStatus(concertId) {
    const response = await apiClient.get(`/seats/concerts/${concertId}/status`);
    return response.data;
}

/**
 * 특정 좌석 상태 조회
 * @param {number} concertId - 콘서트 ID
 * @param {number} seatId - 좌석 ID (ConcertSeat ID)
 * @returns {Promise<Object>} 좌석 상태 정보
 */
export async function fetchSeatStatus(concertId, seatId) {
    const response = await apiClient.get(`/seats/concerts/${concertId}/seats/${seatId}/status`);
    return response.data;
}

/**
 * 사용자 선점 좌석 조회
 * @param {number} concertId - 콘서트 ID
 * @param {number} userId - 사용자 ID
 * @returns {Promise<Array>} 사용자가 선점한 좌석 배열
 */
export async function fetchUserReservedSeats(concertId, userId) {
    const response = await apiClient.get(`/seats/concerts/${concertId}/users/${userId}/reserved`);
    return response.data;
}

// ===========================================
// 좌석 예약 관리 관련 API (SeatReservationController)
// ===========================================

/**
 * 좌석 임시 선점 (분산 락 적용)
 * @param {number} concertId - 콘서트 ID
 * @param {number} seatId - 좌석 ID (ConcertSeat ID)
 * @returns {Promise<Object>} 선점된 좌석 상태
 */
export async function reserveSeat(concertId, seatId) {
    const response = await apiClient.post(`/seats/concerts/${concertId}/seats/${seatId}/reserve`);
    return response.data;
}

/**
 * 좌석 선점 해제 (권한 검증 포함)
 * @param {number} concertId - 콘서트 ID
 * @param {number} seatId - 좌석 ID (ConcertSeat ID)
 * @returns {Promise<string>} 해제 결과 ("SUCCESS")
 */
export async function releaseSeat(concertId, seatId) {
    const response = await apiClient.delete(`/seats/concerts/${concertId}/seats/${seatId}/release`);
    return response.data;
}

// ===========================================
// 좌석 배치도 관련 API (SeatLayoutController)
// ===========================================

/**
 * 콘서트 전체 좌석 배치도 조회
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 좌석 배치도 정보
 */
export async function fetchSeatLayout(concertId) {
    const response = await apiClient.get(`/concerts/${concertId}/seat-layout`);
    return response.data;
}

/**
 * 특정 구역의 좌석 배치 조회
 * @param {number} concertId - 콘서트 ID
 * @param {string} sectionName - 구역명 (예: "A", "B", "VIP")
 * @returns {Promise<Object>} 구역별 좌석 배치 정보
 */
export async function fetchSectionLayout(concertId, sectionName) {
    const response = await apiClient.get(`/concerts/${concertId}/seat-layout/sections/${sectionName}`);
    return response.data;
}

/**
 * 좌석 배치도 요약 정보 조회 (경량화된 API)
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 좌석 배치도 요약 정보
 */
export async function fetchSeatLayoutSummary(concertId) {
    const response = await apiClient.get(`/concerts/${concertId}/seat-layout/summary`);
    return response.data;
}

// ===========================================
// 좌석 실시간 폴링 관련 API (SeatPollingController)
// ===========================================

// 폴링 시스템 설정
export const POLLING_CONFIG = {
    // 백엔드 Long Polling 엔드포인트 구현 여부
    BACKEND_POLLING_ENABLED: true,

    // 폴링 간격 (밀리초) - 폴백 모드용 (Long Polling 타임아웃 또는 데이터 없을 시 재요청 대기 시간)
    POLLING_INTERVAL: 40000, // 35초

    // 클라이언트 측 네트워크 타임아웃 (백엔드 타임아웃보다 충분히 길게 설정)
    CLIENT_NETWORK_TIMEOUT: 65000, // 65초
};

/**
 * Long Polling을 통한 실시간 좌석 상태 업데이트 (XMLHttpRequest 기반)
 * @param {number} concertId - 콘서트 ID
 * @param {string|null} lastUpdateTime - 마지막 업데이트 시간 (ISO 8601 문자열)
 * @param {AbortSignal|null} signal - 요청 취소 신호
 * @returns {Promise<Object>} 실시간 좌석 상태 업데이트 정보 (type: 'update', 'timeout', 'no_data', 'parse_error', 'client_timeout')
 */
export async function pollSeatStatus(concertId, lastUpdateTime = null, signal = null) {
    if (!POLLING_CONFIG.BACKEND_POLLING_ENABLED) {
        console.log('🔥 백엔드 Long Polling 비활성화 - 폴링 스킵');
        return null;
    }

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // URL 및 파라미터 구성
        const params = new URLSearchParams({
            ...(lastUpdateTime && { lastUpdateTime: lastUpdateTime }) // lastUpdateTime이 string으로 전달되므로 toString() 불필요
        });
        const url = `${import.meta.env.VITE_APP_API_URL}/seats/concerts/${concertId}/polling?${params}`;

        xhr.timeout = POLLING_CONFIG.CLIENT_NETWORK_TIMEOUT; // 클라이언트 측 타임아웃 설정
        xhr.open('GET', url, true);

        // 헤더 설정
        xhr.setRequestHeader('Content-Type', 'application/json');

        // AccessKey 설정
        const accessKey = sessionStorage.getItem(`accessKey-${concertId}`);
        if (accessKey) {
            xhr.setRequestHeader('X-Access-Key', accessKey);
        }

        // JWT 토큰 설정 (credentials: 'include'로 쿠키 전송)
        xhr.withCredentials = true;

        console.log(`🔥 XMLHttpRequest 폴링 API 호출: ${url}`);

        // AbortSignal 처리
        if (signal) {
            signal.addEventListener('abort', () => {
                xhr.abort();
                // Abort는 에러가 아니므로 reject 대신 resolve로 처리하여 폴링 중단을 알림
                reject(new Error('AbortError')); // 상위 createStablePollingManager에서 AbortError를 필터링하도록 reject
            });
        }

        // 1. 요청 성공 및 응답 수신 시 (200 OK 응답 올바른 처리)
        xhr.onload = function() {
            console.log(`🔥 XMLHttpRequest onload 호출 - status: ${xhr.status}, readyState: ${xhr.readyState}`);
            if (xhr.readyState === 4) { // 요청이 완료되었을 때 (DONE)
                if (xhr.status === 200 || xhr.status === 201) {
                    try {
                        const responseBody = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                        const responseData = responseBody.data; // 백엔드 SuccessResponse 구조

                        // 백엔드 타임아웃 응답 처리 (백엔드에서 status: 'timeout-ok'를 data 필드에 넘겨줌)
                        if (responseData && responseData.status === 'timeout-ok') {
                            console.log('🔥 백엔드 Long Polling 정상 타임아웃');
                            resolve({ type: 'timeout', data: null, updateTime: responseData.updateTime || null });
                        } else if (responseData && responseData.hasUpdate === true && responseData.seatUpdates) {
                            // 실제 좌석 상태 데이터 수신
                            console.log('🔥 좌석 상태 데이터 수신:', responseData.seatUpdates);
                            resolve({ type: 'update', data: responseData.seatUpdates, updateTime: responseData.updateTime });
                        } else {
                            // 기타 200 OK 응답 (예상치 못한 형식 또는 데이터 없음)
                            console.log('🔥 200 OK 응답 수신 (예상치 못한 형식 또는 데이터 없음)');
                            resolve({ type: 'no_data', data: null, updateTime: null }); // 데이터 없음을 알림
                        }
                    } catch (e) {
                        // JSON 파싱 에러 (서버가 빈 응답을 보내거나 유효하지 않은 JSON을 보낼 경우)
                        console.warn('🔥 JSON 파싱 에러 또는 빈 응답:', e);
                        resolve({ type: 'parse_error', data: null, updateTime: null }); // 파싱 에러도 정상적인 폴링 종료로 간주
                    }
                } else if (xhr.status === 401) {
                    console.log('🔥 401 응답 상세 정보:', {
                        status: xhr.status,
                        statusText: xhr.statusText,
                        responseText: xhr.responseText,
                        responseURL: xhr.responseURL,
                        headers: xhr.getAllResponseHeaders()
                    });
                    
                    // 백엔드 타임아웃 시 401 에러가 발생하는 경우를 처리
                    try {
                        const errorBody = xhr.responseText ? JSON.parse(xhr.responseText) : {};
                        // 백엔드에서 타임아웃 시 401과 함께 timeout 정보를 보내는 경우 처리
                        if (errorBody.data && errorBody.data.status === 'timeout-ok') {
                            console.log('🔥 백엔드 Long Polling 타임아웃 (401 응답과 함께 수신)');
                            resolve({ type: 'timeout', data: null, updateTime: errorBody.data.updateTime || null });
                            return;
                        }
                        // 백엔드에서 타임아웃 메시지를 보내는 경우 처리
                        if (errorBody.message && errorBody.message.includes('timeout')) {
                            console.log('🔥 백엔드 Long Polling 타임아웃 (401 응답, timeout 메시지 포함)');
                            resolve({ type: 'timeout', data: null, updateTime: null });
                            return;
                        }
                    } catch (e) {
                        // JSON 파싱 실패 시 기본 401 에러 처리로 진행
                        console.log('🔥 401 응답 JSON 파싱 실패:', e);
                    }
                    console.error('🔥 인증 실패 (401):', xhr.responseText);
                    reject(new Error('인증이 필요합니다. 로그인해주세요.'));
                } else if (xhr.status === 403) {
                    console.error('🔥 접근 권한 없음 (403):', xhr.responseText);
                    reject(new Error('접근 권한이 없습니다.'));
                } else if (xhr.status >= 400) {
                    console.error(`🔥 폴링 API 에러 ${xhr.status}:`, xhr.responseText);
                    let errorMessage = `서버 에러 (${xhr.status})`;
                    try {
                        const errorResponse = JSON.parse(xhr.responseText);
                        if (errorResponse.message) {
                            errorMessage = errorResponse.message;
                        }
                    } catch (e) {
                        // ignore JSON parse error for error response
                    }
                    reject(new Error(errorMessage));
                }
            }
        };

        // 2. 클라이언트 측 타임아웃 발생 시
        xhr.ontimeout = function() {
            console.warn('🔥 클라이언트 측 타임아웃 발생 (xhr.timeout 초과)');
            // reject 대신 resolve로 CLIENT_TIMEOUT 상태를 넘겨줘서 에러로 처리하지 않음
            resolve({ type: 'client_timeout', data: null, updateTime: null });
        };

        // 3. 네트워크 에러 발생 시
        xhr.onerror = function() {
            console.error('🔥 네트워크 에러 발생 (xhr.onerror):', {
                status: xhr.status,
                statusText: xhr.statusText,
                responseText: xhr.responseText,
                responseURL: xhr.responseURL,
                readyState: xhr.readyState
            });
            reject(new Error('네트워크 에러가 발생했습니다.')); // 실제 네트워크 문제이므로 reject
        };

        // 4. 요청 중단 시
        xhr.onabort = function() {
            console.log('🔥 폴링 요청 중단 (xhr.onabort)');
            reject(new Error('AbortError')); // Abort는 외부 요청이므로 reject
        };

        xhr.send();
    });
}


/**
 * 폴링 시스템 상태 조회
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 폴링 시스템 상태
 */
export async function fetchPollingStatus(concertId) {
    const response = await apiClient.get(`/seats/concerts/${concertId}/polling/status`);
    return response.data;
}

// ===========================================
// 관리자 API (SeatAdminController) - 필요 시 유지
// ===========================================

/**
 * 좌석 캐시 초기화 (관리자 전용)
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 캐시 초기화 결과
 */
export async function initializeSeatCache(concertId) {
    const response = await apiClient.post(`/admin/seats/concerts/${concertId}/cache/init`);
    return response.data;
}

/**
 * 좌석 캐시 상태 조회 (관리자 전용)
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 캐시 상태 정보
 */
export async function fetchSeatCacheStatus(concertId) {
    const response = await apiClient.get(`/admin/seats/concerts/${concertId}/cache/status`);
    return response.data;
}

/**
 * 좌석 캐시 삭제 (관리자 전용)
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 캐시 삭제 결과
 */
export async function deleteSeatCache(concertId) {
    const response = await apiClient.delete(`/admin/seats/concerts/${concertId}/cache`);
    return response.data;
}

/**
 * 만료된 선점 좌석 정리 (관리자 전용)
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 정리 결과
 */
export async function cleanupExpiredReservations(concertId) {
    const response = await apiClient.post(`/admin/seats/concerts/${concertId}/cleanup`);
    return response.data;
}

/**
 * 수동 캐시 Warm-up 스케줄러 실행 (관리자 전용)
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 스케줄러 실행 결과
 */
export async function triggerCacheWarmup(concertId) {
    const response = await apiClient.post(`/admin/seats/concerts/${concertId}/cache/warmup`);
    return response.data;
}

/**
 * 캐시 처리 이력 조회 (관리자 전용)
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Array>} 캐시 처리 이력
 */
export async function fetchCacheHistory(concertId) {
    const response = await apiClient.get(`/admin/seats/concerts/${concertId}/cache/history`);
    return response.data;
}

// ===========================================
// 폴링 관리자 API (SeatPollingAdminController) - 필요 시 유지
// ===========================================

/**
 * 폴링 시스템 대시보드 정보 조회 (관리자 전용)
 * @returns {Promise<Object>} 폴링 시스템 대시보드 정보
 */
export async function fetchPollingDashboard() {
    const response = await apiClient.get('/admin/seats/polling/dashboard');
    return response.data;
}

/**
 * 콘서트별 폴링 세션 상세 정보 (관리자 전용)
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 콘서트별 폴링 세션 정보
 */
export async function fetchConcertPollingDetails(concertId) {
    const response = await apiClient.get(`/admin/seats/polling/concerts/${concertId}`);
    return response.data;
}

/**
 * 수동 폴링 세션 정리 (관리자 전용)
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 세션 정리 결과
 */
export async function cleanupPollingSessions(concertId) {
    const response = await apiClient.post(`/admin/seats/polling/concerts/${concertId}/cleanup`);
    return response.data;
}

/**
 * Redis 구독자 재시작 (관리자 전용)
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 재시작 결과
 */
export async function restartRedisSubscriber(concertId) {
    const response = await apiClient.post(`/admin/seats/polling/concerts/${concertId}/restart-subscriber`);
    return response.data;
}

/**
 * 테스트 이벤트 발행 (관리자 전용)
 * @param {number} concertId - 콘서트 ID
 * @returns {Promise<Object>} 테스트 이벤트 발행 결과
 */
export async function publishTestEvent(concertId) {
    const response = await apiClient.post(`/admin/seats/polling/concerts/${concertId}/test-event`);
    return response.data;
}

// ===========================================
// 유틸리티 함수 및 폴링 매니저
// ===========================================

/**
 * 좌석 ID 유효성 검증
 * @param {number} seatId - 좌석 ID
 * @returns {boolean} 유효성 여부
 */
export function validateSeatId(seatId) {
    return typeof seatId === 'number' && seatId > 0;
}

/**
 * 콘서트 ID 유효성 검증
 * @param {number} concertId - 콘서트 ID
 * @returns {boolean} 유효성 여부
 */
export function validateConcertId(concertId) {
    return typeof concertId === 'number' && concertId > 0;
}

/**
 * 백엔드 Long Polling 지원 여부 확인
 */
export const isBackendPollingSupported = () => {
    return POLLING_CONFIG.BACKEND_POLLING_ENABLED;
};

/**
 * 폴링 간격 가져오기 (Long Polling 사용 시에는 더 긴 간격)
 */
export const getPollingInterval = () => {
    return POLLING_CONFIG.POLLING_INTERVAL;
};

/**
 * 클라이언트 네트워크 타임아웃 가져오기
 */
export const getClientNetworkTimeout = () => {
    return POLLING_CONFIG.CLIENT_NETWORK_TIMEOUT;
};

/**
 * 백엔드 Long Polling 활성화 (백엔드 구현 완료 시 호출)
 */
export const enableBackendPolling = () => {
    POLLING_CONFIG.BACKEND_POLLING_ENABLED = true;
    console.log('🔥 백엔드 Long Polling 활성화');
};

/**
 * 백엔드 Long Polling 비활성화
 */
export const disableBackendPolling = () => {
    POLLING_CONFIG.BACKEND_POLLING_ENABLED = false;
    console.log('🔥 백엔드 Long Polling 비활성화');
};

/**
 * 재시도 로직이 포함된 안정적인 폴링 시스템 (백엔드 자체 타임아웃 관리)
 * @param {number} concertId - 콘서트 ID
 * @param {Object} options - 폴링 옵션
 * @returns {Object} 폴링 매니저 객체
 */
export function createStablePollingManager(concertId, options = {}) {
    const {
        onUpdate = null,
        onError = null,
        onStatusChange = null,
        maxRetries = 3,
        baseDelay = 1000,
        maxDelay = 30000
    } = options;

    let isPolling = false;
    let retryCount = 0;
    let lastUpdateTime = null;
    let abortController = null; // 현재 활성화된 요청을 취소하기 위한 AbortController

    const resetRetryCount = () => {
        retryCount = 0;
    };

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const executePolling = async () => {
        if (!isPolling) {
            console.log('🔥 폴링 중지 상태, 실행 스킵');
            return;
        }

        try {
            // 새로운 AbortController 생성 (매 폴링 시 요청 취소를 위함)
            abortController = new AbortController();

            const response = await pollSeatStatus(
                concertId,
                lastUpdateTime,
                abortController.signal
            );

            // `pollSeatStatus`에서 resolve된 `type`에 따라 처리
            if (response.type === 'timeout' || response.type === 'no_data' || response.type === 'parse_error' || response.type === 'client_timeout') {
                // 백엔드 정상 타임아웃, 빈 응답, 파싱 에러, 클라이언트 타임아웃 -> 모두 정상적인 폴링 종료로 간주
                console.log(`🔥 폴링 정상 종료 (${response.type}) - 다음 폴링 시작`);
                resetRetryCount();
                if (onStatusChange) {
                    onStatusChange(true); // 폴링 상태가 정상임을 알림
                }
                // *** 수정된 부분: 업데이트가 없는 경우 폴링 간격 사용 ***
                if (isPolling) {
                    setTimeout(executePolling, POLLING_CONFIG.POLLING_INTERVAL); // 30초 대기
                }
            } else if (response.type === 'update' && response.data) {
                // 실제 좌석 데이터 업데이트
                console.log('🔥 좌석 데이터 업데이트 수신');
                lastUpdateTime = response.updateTime; // 마지막 업데이트 시간 갱신
                if (onUpdate) {
                    onUpdate(response.data);
                }
                resetRetryCount();
                if (onStatusChange) {
                    onStatusChange(true);
                }
                // *** 유지: 데이터 수신 후 즉시 다음 폴링 시작 (더 빠른 업데이트 확인을 위해) ***
                if (isPolling) {
                    setTimeout(executePolling, 100); // 0.1초 대기
                }
            } else {
                // 예상치 못한 성공 응답 (resolve 되었으나 처리할 데이터가 명확치 않은 경우)
                console.warn('🔥 pollSeatStatus에서 예상치 못한 성공 응답:', response);
                // 이 경우도 재시도 로직을 태우는 것이 안전
                throw new Error('UNEXPECTED_POLLING_RESPONSE');
            }

        } catch (error) {
            if (error.message === 'AbortError') {
                console.log('🔥 폴링 요청이 취소됨 (Aborted)');
                return; // 취소된 요청은 에러 처리하지 않고 종료
            }

            console.error('🔥 폴링 에러 발생:', error);

            // 401/403 인증 에러 처리 (다른 API와 동일하게)
            // 에러 메시지 내용에 따라 분기
            if (error.message.includes('인증이 필요합니다') || error.message.includes('접근 권한이 없습니다')) {
                console.error('🔥 폴링 API 인증 실패 - 폴링 중지');
                isPolling = false; // 폴링 강제 중지
                if (onError) {
                    // 사용자에게 보여줄 메시지를 구체적으로 전달
                    onError(new Error('예매 인증이 만료되었습니다. 대기열에서 다시 입장해주세요.'));
                }
                if (onStatusChange) {
                    onStatusChange(false); // 폴링 중지 상태 알림
                }
                return; // 인증 에러는 재시도 없이 중단
            }

            // 그 외의 일반적인 에러는 재시도 로직
            retryCount++;

            if (retryCount >= maxRetries) {
                console.error('🔥 최대 재시도 횟수 초과 - 폴링 중지');
                isPolling = false;
                if (onError) {
                    onError(new Error(`폴링 최대 재시도 횟수 초과 (${maxRetries}회)`));
                }
                if (onStatusChange) {
                    onStatusChange(false);
                }
                return;
            }

            const retryDelay = Math.min(baseDelay * Math.pow(2, retryCount - 1), maxDelay);
            console.log(`🔥 ${retryDelay}ms 후 재시도 (${retryCount}/${maxRetries})`);

            if (onError) {
                onError(error); // 상위 컴포넌트에 에러 알림
            }

            await delay(retryDelay);

            if (isPolling) {
                executePolling(); // 지연 후 재시도
            }
        }
    };

    return {
        start: (initialLastUpdateTime = null) => {
            if (isPolling) return;
            isPolling = true;
            resetRetryCount();
            lastUpdateTime = initialLastUpdateTime; // 초기 업데이트 시간 설정
            console.log('🔥 폴링 시스템 시작 (백엔드 자체 타임아웃 관리)');
            executePolling();
        },
        stop: () => {
            console.log('🔥 폴링 시스템 중지');
            isPolling = false;
            if (abortController) {
                abortController.abort(); // 현재 진행 중인 요청 취소
            }
            if (onStatusChange) {
                onStatusChange(false);
            }
        },
        isPolling: () => isPolling,
        getStatus: () => ({
            isPolling,
            retryCount,
            lastUpdateTime
        })
    };
}