import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

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

function Footer() {
    const { isMobile, isTablet } = useResponsive();

    // 푸터 링크 섹션들
    const footerSections = [
        {
            title: '서비스',
            links: [
                { name: '콘서트 목록', path: '/concerts' },
                { name: '티켓 예매', path: '/concerts' },
                { name: '이벤트', path: '#' },
                { name: '공지사항', path: '#' },
            ]
        },
        {
            title: '고객지원',
            links: [
                { name: '자주 묻는 질문', path: '#' },
                { name: '고객센터', path: '#' },
                { name: '환불 정책', path: '#' },
                { name: '이용약관', path: '#' },
            ]
        },
        {
            title: '회사정보',
            links: [
                { name: '회사소개', path: '#' },
                { name: '채용정보', path: '#' },
                { name: '개인정보처리방침', path: '#' },
                { name: '제휴문의', path: '#' },
            ]
        }
    ];

    return (
        <footer className="bg-gray-900 border-t border-gray-700 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 구분선 */}
                <div className="border-t border-gray-700"></div>

                {/* 하단 카피라이트 및 추가 정보 */}
                <div className={`py-${isMobile ? '4' : '6'}`}>
                    <div className={`flex ${isMobile ? 'flex-col space-y-4' : isTablet ? 'flex-col sm:flex-row space-y-4 sm:space-y-0' : 'flex-row'} justify-between items-center`}>
                        
                        {/* 카피라이트 */}
                        <div className={`text-gray-400 ${isMobile ? 'text-sm text-center' : 'text-base'}`}>
                            <p>&copy; 2025 TicketMon. All rights reserved.</p>
                        </div>

                        {/* 추가 링크들 */}
                        <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'flex-row space-x-6'} ${isMobile ? 'text-center' : ''}`}>
                            <NavLink 
                                to="#" 
                                className={`text-gray-400 hover:text-white transition-colors ${isMobile ? 'text-sm' : 'text-base'}`}
                            >
                                개인정보처리방침
                            </NavLink>
                            <NavLink 
                                to="#" 
                                className={`text-gray-400 hover:text-white transition-colors ${isMobile ? 'text-sm' : 'text-base'}`}
                            >
                                이용약관
                            </NavLink>
                            <NavLink 
                                to="#" 
                                className={`text-gray-400 hover:text-white transition-colors ${isMobile ? 'text-sm' : 'text-base'}`}
                            >
                                쿠키정책
                            </NavLink>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;