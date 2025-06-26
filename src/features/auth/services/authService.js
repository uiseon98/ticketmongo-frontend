// 기존 src/services/auth.js의 로그인/소셜 로그인 함수와 src/context/AuthContext.jsx에서 직접 호출하던 사용자 인증 및 로그아웃 관련 API 로직을 이곳으로 통합합니다.
import apiClient from '../../../shared/utils/apiClient'; // 공통 apiClient 임포트

export const loginUser = async (data) => {
    try {
        const formData = new URLSearchParams();
        formData.append('username', data.username);
        formData.append('password', data.password);

        // apiClient를 사용하여 POST 요청 보냄
        const response = await apiClient.post('/auth/login', formData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        // 백엔드의 SuccessResponse 구조에 따라 data 필드에서 사용자 정보 추출
        return response.data.data;
    } catch (error) {
        console.error('Login failed', error);
        return null;
    }
};

export const socialLoginUser = (provider) => {
    // socialLoginUser는 브라우저 리다이렉트가 필요하므로 apiClient를 직접 사용하지 않습니다.
    // .env 파일의 VITE_APP_API_URL을 활용하여 백엔드 소셜 로그인 엔드포인트로 이동합니다.
    window.location.href = `${import.meta.env.VITE_APP_API_URL.replace('/api', '')}/oauth2/authorization/${provider}`;
};

export const fetchCurrentUser = async () => {
    try {
        const response = await apiClient.get('/auth/me'); // apiClient 사용
        return response.data.data; // SuccessResponse의 data 필드에서 사용자 정보 추출
    } catch (error) {
        console.error('Failed to fetch current user', error);
        return null;
    }
};

export const logoutUser = async () => {
    try {
        await apiClient.post('/auth/logout'); // apiClient 사용
    } catch (error) {
        console.warn('Logout request failed', error);
    }
};