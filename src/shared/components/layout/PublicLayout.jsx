// src/shared/components/layout/PublicLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// 반응형 Hook
const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200
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
        screenWidth
    };
};

// 스크롤 복원 및 페이지 진입 효과
const usePageTransition = () => {
    const location = useLocation();
    const [isTransitioning, setIsTransitioning] = useState(false);

    useEffect(() => {
        // 페이지 전환 시작
        setIsTransitioning(true);

        // 스크롤을 상단으로 (부드럽게)
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });

        // 전환 완료
        const timer = setTimeout(() => {
            setIsTransitioning(false);
        }, 150);

        return () => clearTimeout(timer);
    }, [location.pathname]);

    return isTransitioning;
};

export default function PublicLayout() {
    const { isMobile } = useResponsive();
    const location = useLocation();
    const isTransitioning = usePageTransition();

    // 페이지별 동적 메타 정보 설정
    useEffect(() => {
        const updatePageMeta = () => {
            const path = location.pathname;
            let title = '티켓몬 - 콘서트 예매의 새로운 경험';
            let description = '최고의 콘서트를 만나보세요. 안전하고 편리한 예매 서비스를 제공합니다.';

            if (path === '/') {
                title = '티켓몬 - 콘서트 예매의 새로운 경험';
                description = '다양한 아티스트의 콘서트를 한 곳에서 예매하세요. 간편하고 안전한 티켓 예매 서비스.';
            } else if (path === '/concerts') {
                title = '콘서트 목록 - 티켓몬';
                description = '다양한 장르의 콘서트를 탐색하고 원하는 공연을 찾아보세요.';
            } else if (path.includes('/concerts/')) {
                title = '콘서트 상세 - 티켓몬';
                description = '콘서트 상세 정보를 확인하고 바로 예매하세요.';
            }

            // 문서 제목 업데이트
            document.title = title;

            // 메타 description 업데이트
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', description);
            }

            // Open Graph 메타태그 업데이트
            const ogTitle = document.querySelector('meta[property="og:title"]');
            const ogDescription = document.querySelector('meta[property="og:description"]');

            if (ogTitle) ogTitle.setAttribute('content', title);
            if (ogDescription) ogDescription.setAttribute('content', description);
        };

        updatePageMeta();
    }, [location.pathname]);

    // 홈페이지인지 확인
    const isHomePage = location.pathname === '/';

    // 콘서트 관련 페이지인지 확인
    const isConcertPage = location.pathname.includes('/concerts');

    return (
        <div className="min-h-screen flex flex-col bg-gray-900">
            {/* 헤더 - 로그인/회원가입 버튼 포함, 콘서트 페이지와 동일한 스타일 */}
            <Header />

            {/* 메인 콘텐츠 영역 */}
            <main
                className="flex-1 bg-gray-900 relative"
                id="main-content"
                role="main"
            >
                {/* 페이지 전환 효과 */}
                <div
                    className={`transition-all duration-300 ease-in-out ${
                        isTransitioning
                            ? 'opacity-90 transform translate-y-1'
                            : 'opacity-100 transform translate-y-0'
                    }`}
                >
                    <Outlet /> {/* 콘서트 목록/상세, 홈페이지 등 렌더 */}
                </div>

                {/* 홈페이지 배경 효과 (선택사항) */}
                {isHomePage && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {/* 그라데이션 배경 효과 */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10"></div>

                        {/* 부유하는 도형들 (데스크톱에서만) */}
                        {!isMobile && (
                            <>
                                <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-xl animate-pulse"></div>
                                <div className="absolute bottom-32 right-16 w-48 h-48 bg-purple-500/5 rounded-full blur-xl animate-pulse delay-1000"></div>
                                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-green-500/5 rounded-full blur-xl animate-pulse delay-2000"></div>
                            </>
                        )}
                    </div>
                )}

                {/* 콘서트 페이지 특별 효과 */}
                {isConcertPage && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent"></div>
                    </div>
                )}

                {/* 모바일에서 하단 여백 (필요시) */}
                {isMobile && (
                    <div className="h-16" aria-hidden="true"></div>
                )}
            </main>

            {/* 푸터 - 콘서트 페이지와 동일한 스타일 */}
            <Footer />

            {/* 접근성 개선: 스킵 네비게이션 */}
            <nav className="sr-only" aria-label="스킵 네비게이션">
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg z-50 transition-all font-medium"
                >
                    본문으로 바로가기
                </a>
                <a
                    href="#footer"
                    className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-36 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg z-50 transition-all font-medium"
                >
                    푸터로 바로가기
                </a>
            </nav>

            {/* 상단으로 스크롤 버튼 (긴 페이지에서만) */}
            <ScrollToTopButton />

            {/* 개발 모드 디버그 정보 */}
            {import.meta.env.DEV && (
                <div className="fixed bottom-4 left-4 bg-gray-800 border border-gray-600 rounded-lg p-2 text-xs text-gray-400 opacity-75 hover:opacity-100 transition-opacity z-30">
                    <div>Layout: Public</div>
                    <div>Path: {location.pathname}</div>
                    <div>Device: {isMobile ? 'Mobile' : 'Desktop'}</div>
                    <div>Transitioning: {isTransitioning ? 'Yes' : 'No'}</div>
                </div>
            )}
        </div>
    );
}

// 상단으로 스크롤 버튼 컴포넌트
const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!isVisible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-40 group"
            aria-label="맨 위로 스크롤"
        >
            <svg
                className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
            </svg>
        </button>
    );
};