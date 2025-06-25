import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

export const loginUser = async (data) => {
    try {
        const response = await axios.post(`${BASE_URL}/api/auth/login`, data, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            withCredentials: true,
        });

        // 로그인 성공 시 추가적으로 사용자 정보 받아서 반환
        const userRes = await axios.get(`${BASE_URL}/api/auth/me`, {
            withCredentials: true,
        });

        return userRes.data;
    } catch (error) {
        console.error('Login failed', error);
        return null;
    }
};

export const socialLoginUser = (provider) => {
    window.location.href = `${BASE_URL}/oauth2/authorization/${provider}`;
};
