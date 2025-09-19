// 기존 src/services/auth.js의 로그인/소셜 로그인 함수와 src/context/AuthContext.jsx에서 직접 호출하던 사용자 인증 및 로그아웃 관련 API 로직을 이곳으로 통합합니다.
import apiClient from '../../../shared/utils/apiClient'; // 공통 apiClient 임포트
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

/**
 * 사용자 로그인을 처리합니다.
 * @param {Object} data - 사용자 로그인 정보 (username, password)
 * @returns {Promise<Object|null>} 로그인 성공 시 사용자 정보 객체, 실패 시 null
 */
export const loginUser = async (data) => {
    try {
        // 백엔드에서 application/x-www-form-urlencoded 타입을 기대하므로 URLSearchParams를 사용합니다.
        const formData = new URLSearchParams();
        formData.append('username', data.username);
        formData.append('password', data.password);

        // apiClient를 사용하여 로그인 요청을 보냅니다.
        // 이 요청은 로그인 성공 시 쿠키/세션 등을 설정할 수 있습니다.
        await apiClient.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            // withCredentials는 apiClient 인스턴스에 기본 설정되어 있으므로 개별 요청에선 필요 없음
        });

        // 원규님의 auth.js 로직처럼, 로그인 성공 후 사용자 정보를 추가적으로 가져와 반환합니다.
        const userData = await fetchCurrentUser(); // 기존 authService의 fetchCurrentUser 재활용
        return userData;
    } catch (error) {
        console.error('Login failed', error);
        // 에러 응답이 있다면 에러 응답 데이터를 반환하거나, 특정 에러 메시지를 반환할 수 있습니다.
        return null;
    }
};

/**
 * 소셜 로그인을 시작합니다. 브라우저를 해당 소셜 로그인 URL로 리다이렉트합니다.
 * @param {string} provider - 소셜 로그인 제공자 (예: 'google', 'kakao')
 */
export const socialLoginUser = (provider) => {
    // socialLoginUser는 브라우저 리다이렉트가 필요하므로 apiClient를 직접 사용하지 않습니다.
    // .env 파일의 VITE_APP_API_URL을 활용하여 백엔드 소셜 로그인 엔드포인트로 이동합니다.
    // API URL에서 '/api' 부분을 제거하여 기본 백엔드 URL을 만듭니다.
    const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');
    window.location.href = `${BACKEND_BASE_URL}/oauth2/authorization/${provider}`;
};

/**
 * 현재 로그인된 사용자 정보를 가져옵니다.
 * @returns {Promise<Object|null>} 현재 사용자 정보 객체, 실패 시 null
 */
export const fetchCurrentUser = async () => {
    try {
        const response = await apiClient.get('/auth/me'); // apiClient 사용
        return response.data; // SuccessResponse의 data 필드에서 사용자 정보 추출
    } catch (error) {
        console.error('Failed to fetch current user', error);
        return null;
    }
};

/**
 * 사용자 로그아웃을 처리합니다.
 * @returns {Promise<void>}
 */
export const logoutUser = async () => {
    try {
        const response = await apiClient.post(`/auth/logout`); // apiClient 사용
        console.log(response.status);
    } catch (error) {
        console.warn('Logout request failed', error); // 로그아웃 실패는 경고로 처리 (앱 동작에 치명적이지 않을 수 있음)
    }
};
