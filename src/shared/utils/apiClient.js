//API 클라이언트 설정

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => {
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            if (response.data.success) {
                return response.data;
            } else {
                const errorMessage = response.data.message || '알 수 없는 오류가 발생했습니다.';
                const error = new Error(errorMessage);
                error.response = response;
                return Promise.reject(error);
            }
        }
        return response;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            const errorMessage = error.response.data?.message || `API 호출 실패: ${status}`;
            console.error(`API Error - Status: ${status}, Message: ${errorMessage}`);
            if (status === 401 || status === 403) {
                // window.location.href = '/login'; // 필요한 경우 로그인 페이지로 리다이렉트
            }
            return Promise.reject(new Error(errorMessage));
        } else if (error.request) {
            console.error("API Error: 응답을 받지 못했습니다.", error.request);
            return Promise.reject(new Error("네트워크 오류가 발생했습니다."));
        } else {
            console.error("API Error: 요청 설정 중 오류가 발생했습니다.", error.message);
            return Promise.reject(new Error("API 요청 설정 중 오류가 발생했습니다."));
        }
    }
);

export default apiClient;