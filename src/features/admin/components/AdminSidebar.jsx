import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// isMobile, sidebarOpen, setSidebarOpen props를 받습니다.
const AdminSidebar = ({
    isMobile,
    sidebarOpen, // eslint-disable-line no-unused-vars
    setSidebarOpen,
}) => {
    // sidebarOpen prop은 AdminLayout에서 <aside> 태그의 스타일을 제어하는 데 사용되므로, AdminSidebar 내부에서는 직접 사용되지 않아 ESLint 경고가 발생합니다.
    // 이는 의도된 구조이므로, 해당 경고를 무시합니다.

    const location = useLocation();
    // location은 NavLink의 isActive prop 계산에 간접적으로 사용되지만, 이 컴포넌트 내부의 다른 로직에서 직접 참조되지 않아 ESLint 경고가 발생합니다.
    // 이는 의도된 구조이므로, 해당 경고를 무시합니다.

    // 네비게이션 링크 클릭 시 모바일에서 사이드바 닫기
    const handleNavClick = () => {
        if (isMobile && setSidebarOpen) {
            setSidebarOpen(false);
        }
    };

    return (
        <div
            className="flex flex-col bg-gray-900 border-r border-gray-700 h-full w-full" // 배경색 및 테두리 SellerLayout과 통일
            style={{
                backgroundColor: '#111827', // 기존 AdminSidebar의 배경색 유지 (더 어둡게)
                borderRight: '1px solid #374151', // 기존 AdminSidebar의 테두리 유지
            }}
        >
            {/* 모바일에서 닫기 버튼 */}
            {isMobile && ( // isMobile prop 사용
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white">
                        관리자 메뉴
                    </h2>
                    <button
                        onClick={() => setSidebarOpen(false)} // setSidebarOpen prop 사용
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

            <div className="flex-1 flex flex-col gap-2 py-4 overflow-y-auto">
                {/* Dashboard 메뉴 */}
                <NavLink
                    to="/admin"
                    end
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-left text-white text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-gray-700 text-blue-400'
                                : 'hover:bg-gray-700' // 색상 SellerSidebar와 통일
                        }`
                    }
                >
                    <img
                        src="/admin-vector-00.svg"
                        alt="Dashboard Icon"
                        className="w-6 h-6"
                    />
                    Dashboard
                </NavLink>
                {/* Seller Approval 메뉴 */}
                <NavLink
                    to="/admin/seller-approvals"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-left text-white text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-gray-700 text-blue-400'
                                : 'hover:bg-gray-700'
                        }`
                    }
                >
                    <img
                        src="/admin-vector-01.svg"
                        alt="Seller Approval Icon"
                        className="w-6 h-6"
                    />
                    Seller Approval
                </NavLink>
                {/* Seller Management 메뉴 */}
                <NavLink
                    to="/admin/sellers"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-left text-white text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-gray-700 text-blue-400'
                                : 'hover:bg-gray-700'
                        }`
                    }
                >
                    <img
                        src="/admin-vector-02.svg"
                        alt="Seller Management Icon"
                        className="w-6 h-6"
                    />
                    Seller Management
                </NavLink>
                {/* Application History 메뉴 */}
                <NavLink
                    to="/admin/history"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-left text-white text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-gray-700 text-blue-400'
                                : 'hover:bg-gray-700'
                        }`
                    }
                >
                    <img
                        src="/admin-vector-03.svg"
                        alt="Application History Icon"
                        className="w-6 h-6"
                    />
                    Application History
                </NavLink>
                {/* Settings 메뉴 */}
                <NavLink
                    to="/admin/settings"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-left text-white text-sm font-medium transition-colors ${
                            isActive
                                ? 'bg-gray-700 text-blue-400'
                                : 'hover:bg-gray-700'
                        }`
                    }
                >
                    <img
                        src="/admin-vector-04.svg"
                        alt="Settings Icon"
                        className="w-6 h-6"
                    />
                    Settings
                </NavLink>
            </div>
        </div>
    );
};

export default AdminSidebar;
