import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

function NotFoundPage() {
    const navigate = useNavigate();
    const { isMobile, isTablet } = useResponsive();

    const quickActions = [
        {
            title: '홈으로 돌아가기',
            description: '메인 페이지로 이동',
            icon: '🏠',
            path: '/',
            color: '#3b82f6', // blue-600
        },
        {
            title: '콘서트 보기',
            description: '다양한 콘서트 둘러보기',
            icon: '🎭',
            path: '/concerts',
            color: '#10b981', // emerald-600
        },
        {
            title: '이전 페이지',
            description: '브라우저 뒤로가기',
            icon: '↩️',
            action: () => navigate(-1),
            color: '#8b5cf6', // purple-600
        },
    ];

    return (
        <div
            style={{
                backgroundColor: '#111827', // gray-900
                minHeight: '100vh',
                width: '100vw',
                margin: 0,
                padding: 0,
                overflowX: 'hidden',
            }}
        >
            <div
                className={isMobile
                    ? "p-4 overflow-x-hidden"
                    : isTablet
                        ? "max-w-5xl mx-auto p-4 overflow-x-hidden"
                        : "max-w-7xl mx-auto p-6 overflow-x-hidden"
                }
                style={{
                    backgroundColor: '#111827',
                    minHeight: '100vh',
                    color: '#FFFFFF',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    className="text-center"
                    style={{
                        maxWidth: isMobile ? '100%' : '800px',
                        width: '100%',
                    }}
                >
                    {/* 404 숫자 */}
                    <div
                        style={{
                            fontSize: isMobile ? '120px' : isTablet ? '150px' : '200px',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            marginBottom: isMobile ? '24px' : '32px',
                            lineHeight: '1',
                        }}
                    >
                        404
                    </div>

                    {/* 메인 메시지 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile ? '32px 24px' : isTablet ? '40px 32px' : '48px 40px',
                            marginBottom: isMobile ? '24px' : '32px',
                        }}
                    >
                        <div className="text-6xl mb-6">🔍</div>
                        <h1 
                            className="font-bold text-white mb-4"
                            style={{
                                fontSize: isMobile ? '24px' : isTablet ? '28px' : '32px',
                            }}
                        >
                            페이지를 찾을 수 없습니다
                        </h1>
                        <p 
                            className="text-gray-300 leading-relaxed"
                            style={{
                                fontSize: isMobile ? '16px' : '18px',
                                marginBottom: isMobile ? '24px' : '32px',
                            }}
                        >
                            요청하신 페이지가 존재하지 않거나 삭제되었을 수 있습니다.
                            <br />
                            아래 버튼을 통해 다른 페이지로 이동해보세요.
                        </p>
                    </div>

                    {/* 빠른 액션 버튼들 */}
                    <div
                        className={`grid gap-4 ${
                            isMobile
                                ? 'grid-cols-1'
                                : isTablet
                                    ? 'grid-cols-2'
                                    : 'grid-cols-3'
                        }`}
                        style={{
                            marginBottom: isMobile ? '32px' : '40px',
                        }}
                    >
                        {quickActions.map((action, index) => (
                            <div
                                key={index}
                                className="rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer"
                                style={{
                                    backgroundColor: '#1f2937', // gray-800
                                    border: '1px solid #374151', // gray-700
                                    padding: isMobile ? '24px' : '28px',
                                    minHeight: isMobile ? '140px' : '160px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    textAlign: 'center',
                                }}
                                onClick={() => {
                                    if (action.path) {
                                        navigate(action.path);
                                    } else if (action.action) {
                                        action.action();
                                    }
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = action.color;
                                    e.currentTarget.style.boxShadow = `0 8px 25px ${action.color}33`;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#374151';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                    style={{ 
                                        backgroundColor: action.color,
                                        fontSize: isMobile ? '24px' : '28px',
                                    }}
                                >
                                    {action.icon}
                                </div>
                                <h3 
                                    className="font-bold text-white mb-2"
                                    style={{
                                        fontSize: isMobile ? '16px' : '18px',
                                    }}
                                >
                                    {action.title}
                                </h3>
                                <p 
                                    className="text-gray-400"
                                    style={{
                                        fontSize: isMobile ? '14px' : '15px',
                                    }}
                                >
                                    {action.description}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* 도움말 섹션 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile ? '24px' : '32px',
                        }}
                    >
                        <h3 
                            className="text-lg font-semibold text-white mb-4 flex items-center justify-center gap-2"
                            style={{
                                fontSize: isMobile ? '16px' : '18px',
                            }}
                        >
                            💡 도움말
                        </h3>
                        <div 
                            className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-6'} text-gray-300 leading-relaxed`}
                            style={{
                                fontSize: isMobile ? '14px' : '15px',
                            }}
                        >
                            <div>
                                <h4 className="text-blue-400 mb-2 font-semibold">페이지를 찾을 수 없는 이유</h4>
                                <ul className="space-y-1 text-left">
                                    <li>• URL을 잘못 입력했을 가능성</li>
                                    <li>• 페이지가 이동되거나 삭제됨</li>
                                    <li>• 임시적인 서버 문제</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-green-400 mb-2 font-semibold">해결 방법</h4>
                                <ul className="space-y-1 text-left">
                                    <li>• URL 주소 확인 후 다시 시도</li>
                                    <li>• 메인 페이지에서 원하는 페이지 찾기</li>
                                    <li>• 문제 지속 시 고객센터 문의</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* 하단 연락처 정보 */}
                    <div 
                        className="text-gray-500 mt-8"
                        style={{
                            fontSize: isMobile ? '12px' : '14px',
                        }}
                    >
                        <p>문제가 지속되면 고객센터(1588-1234)로 문의해주세요.</p>
                        <p className="mt-2">
                            &copy; 2025 TicketMon. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;