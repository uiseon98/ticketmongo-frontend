import { createContext, useState, useEffect } from 'react';

const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

// 1. Context 생성
export const AuthContext = createContext();

// 2. Provider 컴포넌트
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // 로그인한 사용자 정보
    const [loading, setLoading] = useState(true);

    // 3. 앱 시작 시 사용자 정보 로딩
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await fetchCurrentUser(); // 중앙화된 API 함수 호출
                if (data) {
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    // 로그아웃 요청 및 상태 초기화
    const logout = async () => {
        try {
            await fetch(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            console.warn('로그아웃 요청 실패');
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
