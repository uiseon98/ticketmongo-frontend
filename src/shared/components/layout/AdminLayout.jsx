import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../../../features/admin/components/AdminSidebar';

const AdminLayout = () => {
    const location = useLocation();

    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 768;
        }
        return false;
    });

    // 사이드바 열림/닫힘 상태 (AdminLayout 내에서 관리)
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // 디바운스된 리사이즈 핸들러 (isMobile 상태 업데이트)
    const handleResize = useCallback(() => {
        const width = window.innerWidth;
        setIsMobile(width <= 768);
    }, []);

    // 리사이즈 이벤트 리스너 등록 및 해제
    useEffect(() => {
        let timeoutId;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', debouncedResize);

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', debouncedResize);
        };
    }, [handleResize]);

    // 페이지 전환 시 사이드바 닫기 (UX 개선)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // 사이드바 바깥 클릭 시 닫기
    const handleOverlayClick = useCallback(() => {
        if (sidebarOpen) {
            setSidebarOpen(false);
        }
    }, [sidebarOpen]);

    return (
        <div className="flex flex-1 relative">
            {/* 오버레이 */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    style={{ top: '5rem' }}
                    onClick={handleOverlayClick}
                />
            )}

            {/* 사이드바 영역 */}
            <aside
                className="fixed left-0 top-0 h-full z-50 bg-gray-900 border-r border-gray-700
                           transition-transform duration-300 ease-in-out
                           lg:static lg:h-auto lg:translate-x-0 lg:w-64 lg:flex-shrink-0"
                style={{
                    width: '256px',
                    transform: sidebarOpen
                        ? 'translateX(0)'
                        : 'translateX(-100%)',
                    top: '5rem',
                    height: 'calc(100vh - 5rem)',
                }}
            >
                <AdminSidebar
                    // AdminSidebar에도 isMobile, sidebarOpen, setSidebarOpen props 전달
                    isMobile={isMobile}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
            </aside>

            {/* 메인 콘텐츠 영역 (사이드바 공간 확보) */}
            {/* lg:ml-64 대신 동적 style로 marginLeft 적용 */}
            <div
                className="flex-1 flex flex-col p-6"
                style={{ marginLeft: isMobile ? '0' : '256px' }} // isMobile 상태에 따라 동적으로 마진 조절
            >
                {/* 햄버거 메뉴 버튼 및 '관리자 페이지' 제목 */}
                <div className="flex items-center justify-between pb-6 mb-6 lg:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-lg shadow-lg transition-colors flex items-center justify-center"
                            aria-label="사이드바 메뉴 토글"
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
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                        <h1 className="text-xl font-semibold text-white">
                            관리자 페이지
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* 추가 액션 버튼들 (필요시) */}
                    </div>
                </div>

                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
