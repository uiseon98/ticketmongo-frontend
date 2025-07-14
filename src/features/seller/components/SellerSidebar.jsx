import React, { useState, useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

const SellerSidebar = ({ isMobile, sidebarOpen, setSidebarOpen }) => {
    const { user } = useContext(AuthContext);
    const [isConcertMenuOpen, setIsConcertMenuOpen] = useState(false);
    const location = useLocation();

    // 판매자 권한 확인
    const isAdmin =
        user &&
        (user.role === 'ROLE_ADMIN' ||
            (user.roles && user.roles.includes('ROLE_ADMIN')));
    const isSeller =
        user &&
        (user.role === 'ROLE_SELLER' ||
            (user.roles && user.roles.includes('ROLE_SELLER')));

    // '판매자 권한 상태' 탭의 동적 텍스트 결정
    const sellerStatusTabText = location.pathname.startsWith('/seller/apply')
        ? '판매자 권한 신청'
        : '판매자 권한 상태';

    // 콘서트 관리 메뉴 토글 함수
    const toggleConcertMenu = () => {
        setIsConcertMenuOpen((prev) => !prev);
    };

    // 네비게이션 링크 클릭 시 모바일에서 사이드바 닫기
    const handleNavClick = () => {
        if (isMobile && setSidebarOpen) {
            setSidebarOpen(false);
        }
    };

    return (
        <div
            className="flex flex-col bg-gray-900 border-r border-gray-700 h-full w-full"
            style={{
                backgroundColor: '#111827',
                borderRight: '1px solid #374151',
            }}
        >
            {/* 모바일에서 닫기 버튼 */}
            {isMobile && (
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">
                        판매자 메뉴
                    </h2>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                        aria-label="사이드바 닫기"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>
            )}

            {/* 네비게이션 메뉴 */}
            <div className="flex-1 flex flex-col gap-2 p-4 overflow-y-auto">
                {/* 판매자 페이지 홈 링크 */}
                <NavLink
                    to="/seller"
                    end
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-gray-700 text-blue-400'
                                : 'hover:bg-gray-700'
                        }`
                    }
                >
                    {/* 홈 아이콘 */}
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                    {isSeller ? '홈' : '홈 (일반 유저)'}
                </NavLink>

                {/* '판매자 권한 상태' 탭 */}
                {user && !isAdmin && (
                    <NavLink
                        to="/seller/status"
                        onClick={handleNavClick}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                                isActive ||
                                location.pathname.startsWith('/seller/apply')
                                    ? 'bg-gray-700 text-blue-400'
                                    : 'hover:bg-gray-700'
                            }`
                        }
                    >
                        {/* 유저 아이콘 */}
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                        {sellerStatusTabText}
                    </NavLink>
                )}

                {/* 판매자 유저에게만 보이는 탭들 */}
                {isSeller && (
                    <>
                        {/* 구분선 */}
                        <div className="border-t border-gray-700 my-2"></div>

                        {/* 콘서트 관리 토글 메뉴 */}
                        <div className="flex flex-col">
                            <button
                                onClick={toggleConcertMenu}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-white text-sm font-medium w-full text-left transition-colors hover:bg-gray-700 focus:bg-gray-700 ${
                                    location.pathname.includes(
                                        '/seller/concerts',
                                    ) || isConcertMenuOpen
                                        ? 'bg-gray-700'
                                        : ''
                                }`}
                            >
                                <span className="flex items-center gap-3">
                                    {/* 콘서트 아이콘 */}
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                        />
                                    </svg>
                                    콘서트 관리
                                </span>
                                {/* 토글 화살표 아이콘 */}
                                {isConcertMenuOpen ? (
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="m18 15-6-6-6 6"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="m6 9 6 6 6-6"
                                        />
                                    </svg>
                                )}
                            </button>

                            {/* 하위 메뉴 */}
                            {(isConcertMenuOpen ||
                                location.pathname.includes(
                                    '/seller/concerts',
                                )) && (
                                <div className="flex flex-col pl-6 mt-1 space-y-1">
                                    <NavLink
                                        to="/seller/concerts/register"
                                        onClick={handleNavClick}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-gray-700 text-blue-400'
                                                    : 'hover:bg-gray-700'
                                            }`
                                        }
                                    >
                                        {/* Plus 아이콘 */}
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 5v14M5 12h14"
                                            />
                                        </svg>
                                        콘서트 등록
                                    </NavLink>
                                    <NavLink
                                        to="/seller/concerts/manage"
                                        onClick={handleNavClick}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                                                isActive
                                                    ? 'bg-gray-700 text-blue-400'
                                                    : 'hover:bg-gray-700'
                                            }`
                                        }
                                    >
                                        {/* List 아이콘 */}
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"
                                            />
                                        </svg>
                                        콘서트 관리
                                    </NavLink>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SellerSidebar;
