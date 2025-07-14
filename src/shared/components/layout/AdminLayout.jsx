import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../../../features/admin/components/AdminSidebar';

const AdminLayout = () => {
    const location = useLocation();

    // Header.jsx의 useResponsive와 동일하게 isMobile 상태를 관리
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 768; // Tailwind CSS md breakpoint 기준
        }
        return false;
    });
    const headerHeightPx = isMobile ? 64 : 80; // Header.jsx의 h-16 (64px), h-20 (80px)에 맞춰 설정

    // 사이드바 열림/닫힘 상태 (AdminLayout 내에서 관리)
    // 이 상태는 '모바일'일 때만 사이드바의 가시성을 제어합니다.
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // 디바운스된 리사이즈 핸들러 (isMobile 상태 업데이트)
    const handleResize = useCallback(() => {
        const width = window.innerWidth;
        const newIsMobile = width <= 768;
        setIsMobile(newIsMobile);

        // 데스크톱으로 전환될 때 사이드바를 항상 열린 상태로 초기화 (혹은 모바일에서만 닫힘 상태 유지)
        // 이 부분이 중요합니다. isMobile이 false가 되면 sidebarOpen 상태와 관계없이 보여야 합니다.
        if (!newIsMobile) {
            setSidebarOpen(true); // 데스크톱에서는 항상 열려 있도록 설정
        } else {
            setSidebarOpen(false); // 모바일에서는 기본적으로 닫혀 있도록 설정
        }
    }, []);

    useEffect(() => {
        let timeoutId;
        const debouncedResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handleResize, 100);
        };

        window.addEventListener('resize', debouncedResize);

        // 컴포넌트 마운트 시 초기 상태 설정
        handleResize(); // 초기 렌더링 시에도 isMobile 상태 및 sidebarOpen 상태 설정

        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', debouncedResize);
        };
    }, [handleResize]);

    // 페이지 전환 시 사이드바 닫기 (UX 개선 - 모바일에서만)
    useEffect(() => {
        if (isMobile) {
            // 모바일일 때만 페이지 전환 시 사이드바 닫기
            setSidebarOpen(false);
        }
    }, [location.pathname, isMobile]); // isMobile도 의존성 배열에 추가

    // 사이드바 바깥 클릭 시 닫기 (모바일에서만 동작)
    const handleOverlayClick = useCallback(() => {
        if (isMobile && sidebarOpen) {
            // 모바일에서만 동작
            setSidebarOpen(false);
        }
    }, [isMobile, sidebarOpen]);

    return (
        <div className="flex flex-1">
            {/* 사이드바 영역 */}
            <aside
                // 모바일에서는 fixed로 화면에 오버레이 (숨겨져 있다가 열림)
                // 데스크톱 (md 이상)에서는 flex 아이템으로 문서 흐름에 포함
                className={`
                    ${isMobile ? 'fixed left-0 top-0 h-full z-50' : 'block'} /* 모바일에서는 fixed, 데스크톱에서는 항상 block */
                    bg-gray-900 border-r border-gray-700 transition-transform duration-300 ease-in-out
                    w-64 flex-shrink-0
                `}
                style={{
                    // 모바일에서만 transform 적용, 데스크톱에서는 transform: none (즉, translateX(0)과 동일)
                    transform:
                        isMobile && !sidebarOpen
                            ? 'translateX(-100%)'
                            : 'translateX(0)',
                    top: `${headerHeightPx}px`, // isMobile 관계없이 headerHeightPx 사용
                    height: `calc(100vh - ${headerHeightPx}px)`, // isMobile 관계없이 headerHeightPx 사용
                }}
            >
                <AdminSidebar
                    isMobile={isMobile}
                    sidebarOpen={sidebarOpen} // 이 값은 AdminSidebar 내부 로직에서 사용 (모바일 닫기 버튼 등)
                    setSidebarOpen={setSidebarOpen}
                />
            </aside>

            {/* 오버레이 (모바일에서 사이드바가 열려있을 때만 표시) */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    style={{ top: `${headerHeightPx}px` }}
                    onClick={handleOverlayClick}
                />
            )}

            {/* 메인 콘텐츠 영역 */}
            {/* isMobile일 때는 ml-0, 데스크톱일 때는 ml-64 (사이드바 너비) */}
            <div
                className="flex-1 flex flex-col p-6"
                style={{ marginLeft: isMobile ? '0' : '256px' }}
            >
                {/* 햄버거 메뉴 버튼 및 페이지 제목 (모바일에서만 보임) */}
                <div className="flex items-center justify-between pb-6 mb-6 md:hidden">
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
                            관리자 페이지{' '}
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
