import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import SellerSidebar from '../../../features/seller/components/SellerSidebar';

const SellerLayout = () => {
    const location = useLocation();

    // 반응형 상태를 안정적으로 관리
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth <= 768;
        }
        return false;
    });

    // 사이드바 상태 - 기본적으로 닫혀있음 (데스크톱도 동일)
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // 디바운스된 리사이즈 핸들러
    const handleResize = useCallback(() => {
        const width = window.innerWidth;
        const newIsMobile = width <= 768;

        setIsMobile((prevIsMobile) => {
            if (prevIsMobile !== newIsMobile) {
                return newIsMobile;
            }
            return prevIsMobile;
        });
    }, []);

    // 리사이즈 이벤트 등록 (디바운스 적용)
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

    // 페이지 전환 시 사이드바 닫기 (모바일/데스크톱 공통)
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
        <div className="min-h-screen flex flex-col bg-gray-900">
            {/* 🔧 수정: Header를 MainLayout, PublicLayout과 동일하게 배치 */}
            <Header />

            {/* 오버레이 (사이드바가 열려있을 때만) */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    style={{ top: '5rem' }}
                    onClick={handleOverlayClick}
                />
            )}

            {/* 사이드바 (햄버거 메뉴로만 열림) */}
            <aside
                className="fixed left-0 top-20 h-[calc(100vh-5rem)] z-50 bg-gray-900 border-r border-gray-700"
                style={{
                    width: '256px',
                    transform: sidebarOpen
                        ? 'translateX(0)'
                        : 'translateX(-100%)',
                    transition: 'transform 0.3s ease-in-out',
                    visibility: sidebarOpen ? 'visible' : 'hidden',
                }}
            >
                <SellerSidebar
                    isMobile={isMobile}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
            </aside>

            {/* 메인 콘텐츠 영역을 MainLayout, PublicLayout과 동일한 구조로 변경 */}
            <main
                className="flex-1 bg-gray-900 relative"
                id="main-content"
                role="main"
            >
                {/* 햄버거 메뉴 버튼 */}
                <div className="flex items-center justify-between p-6 bg-gray-900 border-b border-gray-700">
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

                {/* 실제 페이지 콘텐츠 */}
                <div className="p-6">
                    <Outlet />
                </div>
            </main>

            {/* Footer를 MainLayout, PublicLayout과 동일하게 배치 */}
            <Footer />
        </div>
    );
};

export default SellerLayout;
