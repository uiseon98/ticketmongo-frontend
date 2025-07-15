// src/shared/components/layout/AdminLayout.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../../../features/admin/components/AdminSidebar';
import { Menu, X } from 'lucide-react'; // 햄버거 아이콘 임포트

const AdminLayout = () => {
    const location = useLocation();

    // Header의 높이를 동적으로 가져오기 (Header의 isMobile 로직과 맞춰야 함)
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 768;
        }
        return false;
    });
    const headerHeightPx = isMobile ? 64 : 80; // Header.jsx의 h-16 (64px), h-20 (80px)에 맞춰 설정

    // 사이드바 열림/닫힘 상태 (이제 AdminLayout 내부에서만 관리)
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleResize = useCallback(() => {
        const width = window.innerWidth;
        setIsMobile(width <= 768);
        // 리사이즈 시 사이드바는 기본적으로 닫힌 상태로 초기화 (모든 환경에서 햄버거로만 열리므로)
        setSidebarOpen(false);
    }, []);

    useEffect(() => {
        let timeoutId;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', debouncedResize);
        handleResize(); // 컴포넌트 마운트 시 초기 상태 설정

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', debouncedResize);
        };
    }, [handleResize]);

    // 페이지 전환 시 사이드바 닫기 (모든 환경에서 적용)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]); // isMobile 조건 제거

    // 사이드바 바깥 클릭 시 닫기
    const handleOverlayClick = useCallback(() => {
        if (sidebarOpen) {
            setSidebarOpen(false);
        }
    }, [sidebarOpen]);

    return (
        <div className="flex flex-1 relative">
            {/* 햄버거 메뉴 버튼 (주황색/분홍색 네모 위치) */}
            <button
                className={`
                    fixed left-0 top-0 text-gray-300 hover:text-white transition-colors p-2 md:block z-50 /* 항상 fixed, md 이상에서도 보임 */
                    ${sidebarOpen ? 'transform translate-x-64' : ''} /* 사이드바 열리면 오른쪽으로 이동 */
                    transition-transform duration-300 ease-in-out
                `}
                style={{
                    top: `${headerHeightPx}px`, // Header 높이만큼 아래
                    marginLeft: `calc((100vw - min(100%, 1024px)) / 2 + 8px)`, // max-w-7xl 기준 중앙 정렬된 공간의 왼쪽 여백 + 8px
                }}
                onClick={() => setSidebarOpen((prev) => !prev)}
                aria-label="메뉴 토글"
            >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* 사이드바 영역 */}
            <aside
                // 모든 환경에서 fixed로 화면에 오버레이
                className={`
                    fixed left-0 top-0 h-full z-50 /* 항상 fixed */
                    bg-gray-900 border-r border-gray-700 transition-transform duration-300 ease-in-out
                    w-64 flex-shrink-0
                `}
                style={{
                    // sidebarOpen 상태에 따라 transform 적용 (모든 환경에서 슬라이드)
                    transform: sidebarOpen
                        ? 'translateX(0)'
                        : 'translateX(-100%)',
                    top: `${headerHeightPx}px`, // Header 높이만큼 아래로
                    height: `calc(100vh - ${headerHeightPx}px)`, // Header 높이 제외
                    marginLeft: `calc((100vw - min(100%, 1024px)) / 2)`, // max-w-7xl 기준 중앙 정렬된 공간의 왼쪽 여백
                }}
            >
                <AdminSidebar
                    isMobile={isMobile} // Sidebar 내부에서 모바일 닫기 버튼 등에 사용
                    sidebarOpen={sidebarOpen} // 이제 이 컴포넌트 내부 상태 전달
                    setSidebarOpen={setSidebarOpen} // 이 컴포넌트 내부 상태 변경 함수 전달
                />
            </aside>

            {/* 오버레이 (사이드바가 열려있을 때만 표시) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    style={{ top: `${headerHeightPx}px` }}
                    onClick={handleOverlayClick}
                />
            )}

            {/* 메인 콘텐츠 영역 (사이드바와 별개로 고정된 위치) */}
            <div className="flex-1 flex flex-col p-6">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
