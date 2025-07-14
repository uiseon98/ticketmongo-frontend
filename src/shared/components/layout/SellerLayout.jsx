import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import SellerSidebar from '../../../features/seller/components/SellerSidebar';

const SellerLayout = () => {
    const location = useLocation();

    // SellerSidebar에 전달하기 위한 반응형 상태 (MainLayout과 중복될 수 있으나, SellerLayout의 특화된 사이드바 동작을 위해 유지)
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 768;
        }
        return false;
    });

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
        // SellerLayout은 MainLayout의 <main> 태그 안에 렌더링되므로,
        // min-h-screen, bg-gray-900 같은 최상위 레이아웃 스타일은 MainLayout이 담당합니다.
        // 여기서는 MainLayout의 남은 공간을 채우면서 내부적으로 사이드바와 콘텐츠를 배치하는 flex 컨테이너 역할을 합니다.
        <div className="flex flex-1 relative">
            {/* 오버레이 (모바일에서 사이드바가 열려있을 때만 표시) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    style={{ top: '5rem' }} // MainLayout의 Header 높이만큼 아래로 시작
                    onClick={handleOverlayClick}
                />
            )}

            {/* 사이드바 영역 */}
            <aside
                className="fixed left-0 top-0 h-full z-50 bg-gray-900 border-r border-gray-700
                           transition-transform duration-300 ease-in-out
                           lg:static lg:h-auto lg:translate-x-0 lg:w-64 lg:flex-shrink-0" // 데스크톱에서는 고정된 사이드바, 모바일에서만 슬라이드
                style={{
                    width: '256px',
                    transform: sidebarOpen
                        ? 'translateX(0)'
                        : 'translateX(-100%)',
                    top: '5rem', // MainLayout의 Header 높이만큼 아래로
                    height: 'calc(100vh - 5rem)', // Header 높이만큼 제외한 높이
                }}
            >
                <SellerSidebar
                    isMobile={isMobile}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
            </aside>

            {/* 메인 콘텐츠 영역 (사이드바 공간 확보) */}
            {/* lg:ml-64를 통해 데스크톱에서 사이드바 너비만큼 왼쪽 여백 확보 */}
            <div className="flex-1 flex flex-col p-6 lg:ml-64">
                {/* 햄버거 메뉴 버튼 및 '판매자 페이지' 제목 */}
                {/* 모바일에서만 보이고 데스크톱에서는 숨김 */}
                {/* MainLayout의 Header가 위에 있으므로, 그 아래에 위치 */}
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
                            판매자 페이지
                        </h1>
                    </div>
                    {/* 추가 액션 버튼들 (필요시) */}
                    <div className="flex items-center gap-2">
                        {/* 나중에 알림이나 설정 버튼 추가 가능 */}
                    </div>
                </div>

                <Outlet />
            </div>
        </div>
    );
};

export default SellerLayout;
