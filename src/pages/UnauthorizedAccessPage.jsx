import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

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

const UnauthorizedAccessPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isMobile, isTablet } = useResponsive();

    // 사용자 권한 확인
    const isAdmin =
        user &&
        (user.role === 'ROLE_ADMIN' ||
            (user.roles && user.roles.includes('ROLE_ADMIN')));
    const isSeller =
        user &&
        (user.role === 'ROLE_SELLER' ||
            (user.roles && user.roles.includes('ROLE_SELLER')));
    const isLoggedIn = !!user;

    // 빠른 액션 데이터
    const quickActions = [
        {
            title: '홈으로',
            description: '메인 페이지로 이동',
            icon: '🏠',
            action: () => navigate('/'),
            color: '#3b82f6', // blue-600
            showAlways: true,
        },
        {
            title: '관리자 페이지로',
            description: '관리자 대시보드 이동',
            icon: '⚙️',
            action: () => navigate('/admin'),
            color: '#10b981', // emerald-600
            condition: isLoggedIn && isAdmin,
        },
        {
            title: '판매자 페이지로',
            description: '판매자 센터 이동',
            icon: '💰',
            action: () => navigate('/seller'),
            color: '#f59e0b', // amber-600
            condition: isLoggedIn && isSeller,
        },
        {
            title: '로그인',
            description: '계정으로 로그인',
            icon: '🔑',
            action: () => navigate('/login'),
            color: '#8b5cf6', // purple-600
            condition: !isLoggedIn,
        },
        {
            title: '콘서트 보기',
            description: '다양한 공연 둘러보기',
            icon: '🎭',
            action: () => navigate('/concerts'),
            color: '#ec4899', // pink-600
            showAlways: true,
        },
    ];

    // 조건에 맞는 액션들만 필터링
    const availableActions = quickActions.filter(action => 
        action.showAlways || action.condition
    );

    const getWelcomeMessage = () => {
        if (!isLoggedIn) {
            return {
                title: '로그인이 필요합니다',
                subtitle: '접근하려는 페이지는 로그인이 필요한 서비스입니다',
                message: '로그인 후 다시 시도해주세요.',
                emoji: '🔐',
            };
        } else if (isAdmin) {
            return {
                title: '접근 권한이 없습니다',
                subtitle: `관리자 계정 (${user?.username || '사용자'}님)`,
                message: '관리자는 해당 페이지에 접근할 수 없습니다.',
                emoji: '👑',
            };
        } else if (isSeller) {
            return {
                title: '접근 권한이 없습니다',
                subtitle: `판매자 계정 (${user?.username || '사용자'}님)`,
                message: '판매자는 해당 페이지에 접근할 수 없습니다.',
                emoji: '🎪',
            };
        } else {
            return {
                title: '접근 권한이 없습니다',
                subtitle: `일반 사용자 (${user?.username || '사용자'}님)`,
                message: '해당 페이지에 접근할 권한이 없습니다.',
                emoji: '🚫',
            };
        }
    };

    const welcomeData = getWelcomeMessage();

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
                        maxWidth: isMobile ? '100%' : '900px',
                        width: '100%',
                    }}
                >
                    {/* 403 숫자 */}
                    <div
                        style={{
                            fontSize: isMobile ? '100px' : isTablet ? '120px' : '150px',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #ef4444, #f97316, #f59e0b)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                            marginBottom: isMobile ? '24px' : '32px',
                            lineHeight: '1',
                        }}
                    >
                        403
                    </div>

                    {/* 메인 메시지 카드 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile ? '32px 24px' : isTablet ? '40px 32px' : '48px 40px',
                            marginBottom: isMobile ? '24px' : '32px',
                        }}
                    >
                        <div 
                            style={{
                                fontSize: isMobile ? '48px' : '64px',
                                marginBottom: '16px',
                            }}
                        >
                            {welcomeData.emoji}
                        </div>
                        <h1 
                            className="font-bold text-white mb-4"
                            style={{
                                fontSize: isMobile ? '24px' : isTablet ? '28px' : '32px',
                            }}
                        >
                            {welcomeData.title}
                        </h1>
                        <h2 
                            className="text-gray-300 mb-4"
                            style={{
                                fontSize: isMobile ? '16px' : '18px',
                            }}
                        >
                            {welcomeData.subtitle}
                        </h2>
                        <p 
                            className="text-gray-400 leading-relaxed"
                            style={{
                                fontSize: isMobile ? '14px' : '16px',
                            }}
                        >
                            {welcomeData.message}
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
                        {availableActions.map((action, index) => (
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
                                onClick={action.action}
                                onMouseEnter={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.borderColor = action.color;
                                        e.currentTarget.style.boxShadow = `0 8px 25px ${action.color}33`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isMobile) {
                                        e.currentTarget.style.borderColor = '#374151';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }
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

                    {/* 추가 정보 섹션 */}
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
                            ℹ️ 추가 정보
                        </h3>
                        <div 
                            className={`${isMobile ? 'space-y-4' : 'grid grid-cols-2 gap-6'} text-gray-300 leading-relaxed`}
                            style={{
                                fontSize: isMobile ? '14px' : '15px',
                            }}
                        >
                            <div>
                                <h4 className="text-blue-400 mb-2 font-semibold">접근 권한이란?</h4>
                                <ul className="space-y-1 text-left">
                                    <li>• 페이지별로 다른 권한이 필요합니다</li>
                                    <li>• 관리자, 판매자, 일반 사용자로 구분</li>
                                    <li>• 보안을 위한 접근 제어 시스템</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-green-400 mb-2 font-semibold">권한 획득 방법</h4>
                                <ul className="space-y-1 text-left">
                                    <li>• 일반 사용자: 회원가입 후 이용</li>
                                    <li>• 판매자: 별도 신청 및 승인 필요</li>
                                    <li>• 관리자: 시스템 관리자만 부여</li>
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
                        <p>권한 관련 문의는 고객센터(1588-1234)로 연락주세요.</p>
                        <p className="mt-2">
                            &copy; 2025 TicketMon. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedAccessPage;