import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { Menu, X } from 'lucide-react';

// 반응형 Hook
const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
    );

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenWidth(width);
            setIsMobile(width <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        isMobile,
        isTablet: screenWidth <= 1024 && screenWidth > 768,
        isDesktop: screenWidth > 1024,
        screenWidth,
    };
};

export default function Header() {
    const { user, logout, loading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const { isMobile, isTablet } = useResponsive();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // 역할 확인 헬퍼 변수
    const isAdmin =
        user &&
        (user.role === 'ROLE_ADMIN' ||
            (user.roles && user.roles.includes('ROLE_ADMIN')));

    // 왼쪽 영역: 로고 및 메인 네비게이션에 포함될 링크들
    const mainNavigationLinks = [
        { to: '/', label: '홈' },
        { to: '/concerts', label: '콘서트' },
    ];

    // 사용자가 로그인되어 있을 때 왼쪽 네비게이션에 추가될 링크
    if (!loading && user) {
        if (isAdmin) {
            mainNavigationLinks.push({
                to: '/admin',
                label: 'Admin Dashboard',
            });
        }
        mainNavigationLinks.push({
            to: '/mypage/profile',
            label: '마이페이지',
        });
    }

    return (
        <header className="bg-gray-900 border-b border-gray-700 shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    className={`flex items-center justify-between ${isMobile ? 'h-16' : 'h-20'}`}
                >
                    {/* 왼쪽 영역: 로고 및 메인 네비게이션 */}
                    <div className="flex items-center space-x-8">
                        {/* 로고 */}
                        <NavLink
                            to="/"
                            className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
                        >
                            <div
                                className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}
                            >
                                🎭 TicketMon
                            </div>
                        </NavLink>

                        {/* 데스크톱 네비게이션 */}
                        <nav className="hidden md:flex items-center space-x-6">
                            {mainNavigationLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    className={({ isActive }) =>
                                        `text-gray-300 hover:text-white transition-colors font-medium ${
                                            isActive
                                                ? 'text-blue-400 border-b-2 border-blue-400 pb-1'
                                                : ''
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>

                    {/* 오른쪽 영역: 사용자 정보 및 액션 버튼들 */}
                    <div className="flex items-center space-x-4">
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
                                <span className="text-gray-400 text-sm">
                                    로딩중...
                                </span>
                            </div>
                        ) : user ? (
                            <div className="hidden md:flex items-center space-x-4">
                                {/* 관리자가 아닐 때만 판매자 페이지 링크 표시 */}
                                {!isAdmin && (
                                    <NavLink
                                        to="/seller"
                                        className={({ isActive }) =>
                                            `text-gray-300 hover:text-white transition-colors font-medium ${
                                                isActive ? 'text-blue-400' : ''
                                            }`
                                        }
                                    >
                                        판매자 페이지
                                    </NavLink>
                                )}

                                {/* 사용자 환영 메시지 */}
                                <div className="flex items-center space-x-2 text-gray-200">
                                    <span className="text-sm">안녕하세요,</span>
                                    <span className="font-medium text-blue-400">
                                        {user.username}님
                                    </span>
                                </div>

                                {/* 로그아웃 버튼 */}
                                <button
                                    onClick={handleLogout}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-3">
                                <NavLink
                                    to="/login"
                                    className="text-gray-300 hover:text-white transition-colors font-medium"
                                >
                                    로그인
                                </NavLink>
                                <NavLink
                                    to="/register"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    회원가입
                                </NavLink>
                            </div>
                        )}

                        {/* 햄버거 메뉴 (모바일용) */}
                        <button
                            className="md:hidden text-gray-300 hover:text-white transition-colors p-2"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label="메뉴 열기/닫기"
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* 모바일 드롭다운 메뉴 */}
                {menuOpen && (
                    <div className="md:hidden border-t border-gray-700 bg-gray-800">
                        <div className="px-4 py-3 space-y-3">
                            {/* 모바일 네비게이션 링크들 */}
                            {mainNavigationLinks.map((link) => (
                                <NavLink
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `block text-gray-300 hover:text-white transition-colors font-medium py-2 px-3 rounded-lg ${
                                            isActive
                                                ? 'bg-gray-700 text-blue-400'
                                                : 'hover:bg-gray-700'
                                        }`
                                    }
                                >
                                    {link.label}
                                </NavLink>
                            ))}

                            {/* 구분선 */}
                            <div className="border-t border-gray-700 my-3"></div>

                            {loading ? (
                                <div className="flex items-center space-x-2 py-2 px-3">
                                    <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin"></div>
                                    <span className="text-gray-400 text-sm">
                                        로딩중...
                                    </span>
                                </div>
                            ) : user ? (
                                <>
                                    {/* 관리자가 아닐 때만 판매자 페이지 링크 표시 (모바일) */}
                                    {!isAdmin && (
                                        <NavLink
                                            to="/seller"
                                            onClick={() => setMenuOpen(false)}
                                            className={({ isActive }) =>
                                                `block text-gray-300 hover:text-white transition-colors font-medium py-2 px-3 rounded-lg ${
                                                    isActive
                                                        ? 'bg-gray-700 text-blue-400'
                                                        : 'hover:bg-gray-700'
                                                }`
                                            }
                                        >
                                            판매자 페이지
                                        </NavLink>
                                    )}

                                    {/* 사용자 정보 */}
                                    <div className="py-2 px-3 text-gray-200">
                                        <div className="text-sm text-gray-400">
                                            로그인됨
                                        </div>
                                        <div className="font-medium text-blue-400">
                                            {user.username}님
                                        </div>
                                    </div>

                                    {/* 로그아웃 버튼 */}
                                    <button
                                        onClick={() => {
                                            setMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className="w-full text-left bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        로그아웃
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-2">
                                    <NavLink
                                        to="/login"
                                        onClick={() => setMenuOpen(false)}
                                        className="block text-gray-300 hover:text-white transition-colors font-medium py-2 px-3 rounded-lg hover:bg-gray-700"
                                    >
                                        로그인
                                    </NavLink>
                                    <NavLink
                                        to="/register"
                                        onClick={() => setMenuOpen(false)}
                                        className="block bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors text-center"
                                    >
                                        회원가입
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
