import axios from 'axios'; // axios 임포트

// 백엔드 API의 기본 URL을 .env 파일에서 가져옵니다.
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

// axios 인스턴스 생성 및 기본 설정
// baseURL 설정으로 모든 요청에 기본 URL이 자동으로 붙습니다.
// withCredentials는 쿠키를 주고받기 위해 필요하며, 백엔드 CORS 설정과 일치해야 합니다.
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // 중요: 쿠키(JWT 토큰)를 주고받기 위해 필수
    headers: {
        'Content-Type': 'application/json',
    },
});

// 요청 인터셉터 (모든 요청이 보내지기 전에 실행)
// 여기에서 JWT 토큰을 Authorization 헤더에 자동으로 추가하거나, 공통 로직을 처리할 수 있습니다.
// 현재 HttpOnly 쿠키를 사용하므로, 브라우저가 자동으로 쿠키를 보내주기 때문에 여기서는 명시적으로 헤더에 추가할 필요가 없습니다.
// 만약 HttpOnly가 아닌 다른 방식으로 토큰을 관리한다면 이 인터셉터에서 헤더를 추가합니다.
apiClient.interceptors.request.use(
    (config) => {
        // 예시: 로컬 스토리지 등에 토큰이 있다면 헤더에 추가 (현재 HttpOnly 쿠키 사용으로 불필요)
        // const token = localStorage.getItem('accessToken');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 응답 인터셉터 (모든 응답이 처리되기 전에 실행)
// 여기에서 에러를 일괄적으로 처리하거나, 응답 데이터를 가공할 수 있습니다.
apiClient.interceptors.response.use(
    (response) => {
        // 백엔드의 SuccessResponse 구조에 따라 data.data에 실제 응답이 있을 수 있습니다.
        // 예를 들어, { "success": true, "message": "성공", "data": {...} } 형태라면 response.data.data를 반환합니다.
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            if (response.data.success) {
                return response.data; // SuccessResponse 구조 그대로 반환 (data, message 포함)
            } else {
                // 백엔드의 ErrorResponse 구조에 따라 에러 메시지 처리
                const errorMessage = response.data.message || '알 수 없는 오류가 발생했습니다.';
                const error = new Error(errorMessage);
                error.response = response; // 원본 응답 객체를 에러 객체에 추가
                return Promise.reject(error);
            }
        }
        return response; // SuccessResponse 구조가 아니라면 원본 응답 반환
    },
    (error) => {
        // HTTP 상태 코드 4xx, 5xx 에러 처리
        if (error.response) {
            const status = error.response.status;
            const errorMessage = error.response.data?.message || `API 호출 실패: ${status}`;
            console.error(`API Error - Status: ${status}, Message: ${errorMessage}`);

            // 특정 상태 코드에 대한 전역 처리 (예: 401 Unauthorized 시 로그인 페이지로 리다이렉트)
            if (status === 401 || status === 403) {
                // window.location.href = '/login'; // 예시: 실제 로그인 페이지 경로로 리다이렉트
                // throw new Error("인증 또는 권한이 필요합니다.");
            }
            return Promise.reject(new Error(errorMessage)); // 에러 메시지를 포함한 Error 객체 반환
        } else if (error.request) {
            // 요청이 전송되었으나 응답을 받지 못한 경우 (네트워크 오류 등)
            console.error("API Error: 응답을 받지 못했습니다.", error.request);
            return Promise.reject(new Error("네트워크 오류가 발생했습니다."));
        } else {
            // 요청 설정 중 오류가 발생한 경우
            console.error("API Error: 요청 설정 중 오류가 발생했습니다.", error.message);
            return Promise.reject(new Error("API 요청 설정 중 오류가 발생했습니다."));
        }
    }
);


// 백엔드 콘서트 목록 API 호출 함수 (GET 요청)
export async function fetchConcerts() {
    // 백엔드의 콘서트 목록 API 경로: /api/concerts (현재 SecurityConfig에서 permitAll()로 설정)
    // apiClient.get()을 사용하면 자동으로 baseURL이 앞에 붙습니다.
    const response = await apiClient.get('/concerts');
    // 백엔드 SuccessResponse 구조에 따라 data.data에 실제 목록이 있을 수 있습니다.
    // 예를 들어, { "success": true, "message": "성공", "data": { content: [...] } } 형태라면
    // response.data.data.content가 실제 배열이 됩니다.
    // 응답 인터셉터에서 response.data만 반환하도록 조정했으므로 여기서는 response.data를 바로 사용합니다.
    return response.data;
}

// 판매자 콘서트 목록 API 호출 함수 (GET 요청 - 예시: 인증 필요)
export async function fetchSellerConcerts(sellerId, page = 0, size = 10, sortBy = 'createdAt', sortDir = 'desc') {
    const response = await apiClient.get('/seller/concerts', {
        params: {
            sellerId,
            page,
            size,
            sortBy,
            sortDir
        }
    });
    return response.data;
}

// 로그인 API 호출 함수 (POST 요청 - 예시: 인증 정보 전송)
export async function loginUser(username, password) {
    // 백엔드의 LoginFilter가 처리하는 /api/auth/login 경로
    // Spring Security의 기본 폼 로그인 형식이므로 Content-Type은 application/x-www-form-urlencoded
    // axios는 기본적으로 JSON을 보내지만, form-urlencoded 형태로 보내려면 URLSearchParams 사용
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    // axios를 사용하면 withCredentials: true 설정 덕분에 쿠키가 자동으로 주고받아집니다.
    const response = await apiClient.post('/auth/login', formData, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    return response.data; // 성공 시 로그인 응답 데이터 (쿠키는 자동으로 설정됨)
}


// 추후 다른 API 함수들도 여기에 추가 가능합니다.
// export async function registerUser(userData) { ... }
// export async function createConcert(concertData) { ... }