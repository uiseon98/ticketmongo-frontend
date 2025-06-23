// src/services/api.js
// 백엔드 API의 기본 URL을 .env 파일에서 가져옵니다.
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

// GET 요청을 위한 공통 함수 (예시)
async function get(path) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // 인증이 필요한 API라면, 쿠키가 자동으로 포함되도록 credentials: 'include'를 사용합니다.
            // fetch API는 기본적으로 same-origin 요청에는 쿠키를 보내고, cross-origin 요청에는 credentials: 'omit'이 기본값입니다.
            // 백엔드 CORS 설정 (SecurityConfig)에서 allowCredentials: true 로 설정했기 때문에,
            // 크로스 오리진 요청 시에도 쿠키가 전송되도록 credentials: 'include'를 명시해야 합니다.
        },
        credentials: 'include' // 중요: 쿠키를 주고받기 위해 필수
    });

    if (!response.ok) {
        // API 응답이 성공(2xx)이 아닐 경우 에러 처리
        const errorData = await response.json();
        throw new Error(errorData.message || `API 호출 실패: ${response.status}`);
    }
    return response.json();
}

// 백엔드 콘서트 목록 API 호출 함수
export async function fetchConcerts() {
    // 백엔드의 콘서트 목록 API 경로: /api/concerts (SecurityConfig에서 authenticated()로 보호될 수 있음)
    return await get('/concerts');
}

// 추후 로그인, 회원가입 등 다른 API 함수들도 여기에 추가 가능합니다.
// export async function loginUser(credentials) { ... }