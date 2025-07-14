import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SellerSidebar from '../../../features/seller/components/SellerSidebar';

const SellerLayout = () => {
    const location = useLocation();

    // Header.jsx의 useResponsive와 동일하게 isMobile 상태를 관리
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 768;
        }
        return false;
    });
    // Header 높이를 동적으로 가져오기 (MainLayout이 Header 높이를 prop으로 넘겨주거나, Header 내부에서 상태를 공유하는 것이 이상적)
    // 현재 Header.jsx를 보면 isMobile에 따라 h-16 (64px) 또는 h-20 (80px)으로 변하므로, 이 값을 여기서 동적으로 받아와야 함
    // 일단 여기서는 5rem (80px)을 기본으로 하고, 모바일 시 4rem (64px)으로 가정
    const headerHeightPx = isMobile ? 64 : 80; // Header.jsx의 h-16 (64px), h-20 (80px)에 맞춰 설정

    // 사이드바 열림/닫힘 상태 (SellerLayout 내에서 관리)
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
        // MainLayout의 flex-1을 이어받아 남은 공간을 채움
        // 데스크톱에서는 사이드바(flex item)와 콘텐츠(flex-1)를 옆으로 배치하는 flex 컨테이너 역할
        // 모바일에서는 flex-col로 쌓이되, 사이드바는 fixed로 오버레이 처리
        <div className="flex flex-1">
            {/* 사이드바 영역 */}
            <aside
                // 모바일에서는 fixed로 화면에 오버레이 (숨겨져 있다가 열림)
                // 데스크톱 (md 이상)에서는 static flex item으로 문서 흐름에 포함
                className={`
                    ${isMobile ? 'fixed left-0 top-0 h-full z-50' : 'hidden md:block'} /* 모바일에서는 fixed, 데스크톱에서는 기본적으로 block */
                    bg-gray-900 border-r border-gray-700 transition-transform duration-300 ease-in-out
                    w-64 flex-shrink-0
                `}
                style={{
                    transform:
                        isMobile && !sidebarOpen
                            ? 'translateX(-100%)'
                            : 'translateX(0)', // 모바일에서만 슬라이드
                    top: isMobile ? `${headerHeightPx}px` : '0', // 모바일에서 Header 높이만큼 아래로
                    height: isMobile
                        ? `calc(100vh - ${headerHeightPx}px)`
                        : '100%', // 모바일에서 Header 높이 제외
                }}
            >
                <SellerSidebar
                    isMobile={isMobile}
                    sidebarOpen={sidebarOpen}
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
            {/* 데스크톱에서는 사이드바 옆에, 모바일에서는 전체 너비 사용 */}
            <div
                className="flex-1 flex flex-col p-6"
                // 데스크톱에서는 (isMobile이 false일 때) ml-64 (사이드바 너비)
                // 모바일에서는 ml-0
                style={{ marginLeft: isMobile ? '0' : '256px' }}
            >
                {/* 햄버거 메뉴 버튼 및 페이지 제목 (모바일에서만 보임) */}
                <div className="flex items-center justify-between pb-6 mb-6 md:hidden">
                    {' '}
                    {/* md:hidden 사용 */}
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
                            판매자 페이지
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

export default SellerLayout;
