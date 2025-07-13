import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

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

// 스크롤 복원 Hook
const useScrollRestoration = () => {
    const location = useLocation();

    useEffect(() => {
        // 새 페이지로 이동할 때 스크롤을 상단으로
        window.scrollTo(0, 0);
    }, [location.pathname]);
};

export default function MainLayout() {
    const { isMobile } = useResponsive();
    const location = useLocation();

    // 스크롤 복원 적용
    useScrollRestoration();

    // 페이지별 메타 정보 업데이트
    useEffect(() => {
        const updatePageMeta = () => {
            const path = location.pathname;
            let title = '티켓몬';
            let description = '최고의 콘서트 예매 서비스';

            // 경로에 따른 동적 메타 정보
            if (path.includes('/mypage')) {
                title = '마이페이지 - 티켓몬';
                description = '나의 예매 내역과 프로필을 관리하세요';
            } else if (path.includes('/booking')) {
                title = '예매하기 - 티켓몬';
                description = '원하는 좌석을 선택하고 예매를 완료하세요';
            } else if (path.includes('/seller')) {
                title = '판매자 센터 - 티켓몬';
                description = '콘서트를 등록하고 판매를 관리하세요';
            } else if (path.includes('/admin')) {
                title = '관리자 대시보드 - 티켓몬';
                description = '시스템 관리 및 사용자 관리';
            }

            document.title = title;

            // 메타 description 업데이트
            const metaDescription = document.querySelector('meta[name="description"]');
            if (metaDescription) {
                metaDescription.setAttribute('content', description);
            }
        };

        updatePageMeta();
    }, [location.pathname]);

    // 로딩 상태 관리 (필요시)
    const [isLoading, setIsLoading] = useState(false);

    // 페이지 전환 시 로딩 효과
    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 100);
        return () => clearTimeout(timer);
    }, [location.pathname]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-900">
            {/* 헤더 - sticky로 상단 고정, 콘서트 페이지와 동일한 스타일 */}
            <Header />

            {/* 메인 콘텐츠 영역 */}
            <main className="flex-1 bg-gray-900 relative">
                {/* 페이지 전환 로딩 오버레이 (선택사항) */}
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-40 transition-opacity duration-200">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 border-2 border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
                                <span className="text-gray-300 text-sm font-medium">
                                    페이지를 로딩하는 중...
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 실제 페이지 콘텐츠 */}
                <div className={`transition-opacity duration-200 ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                    <Outlet /> {/* 각 보호된 페이지 렌더 */}
                </div>

                {/* 모바일에서 하단 여백 (고정 버튼 등을 위한 공간) */}
                {isMobile && (
                    <div className="h-20" aria-hidden="true"></div>
                )}
            </main>

            {/* 푸터 - 콘서트 페이지와 동일한 스타일 */}
            <Footer />

            {/* 접근성: 스킵 링크 */}
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 transition-all"
            >
                본문으로 바로가기
            </a>
        </div>
    );
}