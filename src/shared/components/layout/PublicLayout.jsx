// src/shared/components/layout/PublicLayout.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function PublicLayout() {
    const location = useLocation();

    // 결제 페이지인지 확인
    const isPaymentPage = location.pathname.includes('/payment/result/');

    // 결제 페이지가 아닐 때만 메타태그 업데이트
    useEffect(() => {
        if (isPaymentPage) return; // 결제 페이지에서는 메타태그 건드리지 않음

        const updatePageMeta = () => {
            const path = location.pathname;
            let title = '티켓몬 - 콘서트 예매의 새로운 경험';
            let description =
                '최고의 콘서트를 만나보세요. 안전하고 편리한 예매 서비스를 제공합니다.';

            if (path === '/') {
                title = '티켓몬 - 콘서트 예매의 새로운 경험';
                description =
                    '다양한 아티스트의 콘서트를 한 곳에서 예매하세요. 간편하고 안전한 티켓 예매 서비스.';
            } else if (path === '/concerts') {
                title = '콘서트 목록 - 티켓몬';
                description =
                    '다양한 장르의 콘서트를 탐색하고 원하는 공연을 찾아보세요.';
            } else if (path.includes('/concerts/')) {
                title = '콘서트 상세 - 티켓몬';
                description = '콘서트 상세 정보를 확인하고 바로 예매하세요.';
            }

            document.title = title;

            const metaDescription = document.querySelector(
                'meta[name="description"]',
            );
            if (metaDescription) {
                metaDescription.setAttribute('content', description);
            }

            const ogTitle = document.querySelector('meta[property="og:title"]');
            const ogDescription = document.querySelector(
                'meta[property="og:description"]',
            );

            if (ogTitle) ogTitle.setAttribute('content', title);
            if (ogDescription)
                ogDescription.setAttribute('content', description);
        };

        updatePageMeta();
    }, [location.pathname, isPaymentPage]);

    // 결제 페이지가 아닐 때만 스크롤 복원
    useEffect(() => {
        if (isPaymentPage) return; // 결제 페이지에서는 스크롤 건드리지 않음

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, [location.pathname, isPaymentPage]);

    return (
        <div className="min-h-screen flex flex-col bg-gray-900">
            <Header />

            <main
                className="flex-1 bg-gray-900 relative"
                id="main-content"
                role="main"
            >
                {/* 결제 페이지는 전환 효과 없이 바로 렌더링 */}
                {isPaymentPage ? (
                    <Outlet />
                ) : (
                    <div className="transition-all duration-300 ease-in-out">
                        <Outlet />
                    </div>
                )}

                {/* 결제 페이지가 아닐 때만 배경 효과 적용 */}
                {!isPaymentPage && location.pathname === '/' && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10"></div>
                    </div>
                )}

                {!isPaymentPage && location.pathname.includes('/concerts') && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/5 to-transparent"></div>
                    </div>
                )}
            </main>

            <Footer />

            {/* 결제 페이지가 아닐 때만 스크롤 버튼 표시 */}
            {!isPaymentPage && <ScrollToTopButton />}

            {/* 개발 모드 디버그 정보는 결제 페이지에서 제외 */}
            {import.meta.env.DEV && !isPaymentPage && (
                <div className="fixed bottom-4 left-4 bg-gray-800 border border-gray-600 rounded-lg p-2 text-xs text-gray-400 opacity-75 hover:opacity-100 transition-opacity z-30">
                    <div>Layout: Public</div>
                    <div>Path: {location.pathname}</div>
                </div>
            )}
        </div>
    );
}

// 상단으로 스크롤 버튼 컴포넌트
const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = React.useState(false);

    React.useEffect(() => {
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
            behavior: 'smooth',
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
