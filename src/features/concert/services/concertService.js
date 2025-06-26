// 기존 src/services/api.js에 있던 콘서트 목록 조회 함수(fetchConcerts)를 이곳으로 옮깁니다.
import apiClient from '../../../shared/utils/apiClient'; // 공통 apiClient 임포트

export async function fetchConcerts() {
    // apiClient를 사용하여 GET 요청 보냄
    const response = await apiClient.get('/concerts');
    // 백엔드 Page 객체 응답의 content 필드에 실제 목록이 있습니다.
    return response.data.content;
}

// 추후 다른 콘서트 관련 API 함수들도 여기에 추가 가능합니다.
// export async function fetchConcertDetail(id) { ... }