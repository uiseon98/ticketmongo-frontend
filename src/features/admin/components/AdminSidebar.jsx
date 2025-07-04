import React from 'react';
import { NavLink } from 'react-router-dom';

const AdminSidebar = () => {
    return (
        <div
            className="flex flex-col shrink-0 min-h-screen bg-[#111922] border-r border-solid border-r-[#243447] py-3 pl-4 pr-3"
            style={{ width: '200px' }}
        >
            <div className="flex flex-col gap-2 py-4">
                {/* Dashboard 메뉴 (홈 대신) */}
                <NavLink
                    to="/admin"
                    end
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            isActive ? 'bg-[#243447]' : 'hover:bg-[#243447]'
                        }`
                    }
                >
                    <img
                        src="/admin-vector-00.svg" // 대시보드 아이콘
                        alt="Dashboard Icon"
                        className="w-6 h-6"
                    />
                    Dashboard
                </NavLink>
                {/* Seller Approval 메뉴 추가 */}
                <NavLink
                    to="/admin/seller-approvals"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            isActive ? 'bg-[#243447]' : 'hover:bg-[#243447]'
                        }`
                    }
                >
                    <img
                        src="/admin-vector-03.svg" // 판매자/승인 관련 아이콘
                        alt="Seller Approval Icon"
                        className="w-6 h-6"
                    />
                    Seller Approval
                </NavLink>
                {/* Seller Management 메뉴 추가 */}
                <NavLink
                    to="/admin/sellers"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            isActive ? 'bg-[#243447]' : 'hover:bg-[#243447]'
                        }`
                    }
                >
                    <img
                        src="/admin-vector-04.svg" // 판매자 관리 관련 아이콘 (임시)
                        alt="Seller Management Icon"
                        className="w-6 h-6"
                    />
                    Seller Management
                </NavLink>
                {/* Application History 메뉴 추가 */}
                <NavLink
                    to="/admin/history"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            isActive ? 'bg-[#243447]' : 'hover:bg-[#243447]'
                        }`
                    }
                >
                    <img
                        src="/admin-vector-01.svg" // 이력/통계 관련 아이콘 (임시)
                        alt="Application History Icon"
                        className="w-6 h-6"
                    />
                    Application History
                </NavLink>
                {/* Settings 메뉴 추가 */}
                <NavLink
                    to="/admin/settings"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                            isActive ? 'bg-[#243447]' : 'hover:bg-[#243447]'
                        }`
                    }
                >
                    <img
                        src="/admin-vector-02.svg" // 설정 관련 아이콘 (임시)
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
