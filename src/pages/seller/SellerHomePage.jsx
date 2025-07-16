// ===== SellerHomePage.jsx =====
// 콘서트 페이지와 통일된 디자인 적용
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

// 반응형 Hook (콘서트 페이지와 동일)
const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
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
        screenWidth,
    };
};

const SellerHomePage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isMobile, isTablet } = useResponsive();

    // 판매자 권한 확인
    const isAdmin =
        user &&
        (user.role === 'ROLE_ADMIN' ||
            (user.roles && user.roles.includes('ROLE_ADMIN')));
    const isSeller =
        user &&
        (user.role === 'ROLE_SELLER' ||
            (user.roles && user.roles.includes('ROLE_SELLER')));

    // 빠른 액션 데이터 (필요한 것만)
    const quickActions = [
        {
            title: '콘서트 등록',
            description: '새로운 콘서트를 등록하세요',
            icon: '🎭',
            path: '/seller/concerts/register',
            color: '#10b981', // green-600
            requiresSeller: true,
        },
        {
            title: '콘서트 관리',
            description: '등록된 콘서트를 관리하세요',
            icon: '📊',
            path: '/seller/concerts/manage',
            color: '#3b82f6', // blue-600
            requiresSeller: true,
        },
        {
            title: '권한 상태',
            description: '판매자 권한 상태를 확인하세요',
            icon: '👤',
            path: '/seller/status',
            color: '#8b5cf6', // purple-600
            requiresSeller: false,
        },
    ];

    // 상태별 메시지
    const getWelcomeMessage = () => {
        if (isAdmin) {
            return {
                title: '관리자 대시보드',
                subtitle: '판매자 기능을 체험해볼 수 있습니다',
                message:
                    '관리자로 로그인되어 있습니다. 관리자는 판매자 기능을 이용할 수 없습니다.',
            };
        } else if (isSeller) {
            return {
                title: '판매자 대시보드',
                subtitle: `환영합니다, ${user?.username || '판매자'}님!`,
                message: '콘서트를 등록하고 관리할 수 있습니다.',
            };
        } else {
            return {
                title: '판매자 페이지',
                subtitle: `안녕하세요, ${user?.username || '사용자'}님!`,
                message: '판매자 권한을 신청하여 콘서트를 등록하고 관리하세요.',
            };
        }
    };

    const welcomeData = getWelcomeMessage();

    return (
        <div
            style={{
                backgroundColor: '#111827', // gray-900 - 콘서트 페이지와 동일
                minHeight: '100vh',
                width: '100vw',
                margin: 0,
                padding: 0,
                overflowX: 'hidden',
            }}
        >
            <div
                className={
                    isMobile
                        ? 'p-4 overflow-x-hidden'
                        : isTablet
                          ? 'max-w-4xl mx-auto p-4 overflow-x-hidden'
                          : 'max-w-6xl mx-auto p-6 overflow-x-hidden'
                }
                style={{
                    backgroundColor: '#111827',
                    minHeight: '100vh',
                    color: '#FFFFFF',
                    boxSizing: 'border-box',
                }}
            >
                {/* 페이지 제목 - 콘서트 페이지와 동일한 스타일 */}
                <h1
                    className={
                        isMobile
                            ? 'text-xl font-bold mb-4 text-center break-words'
                            : isTablet
                              ? 'text-2xl font-bold mb-5 text-center break-words'
                              : 'text-4xl font-bold mb-6 text-center break-words'
                    }
                    style={{
                        color: '#FFFFFF',
                        padding: isMobile ? '0 8px' : '0',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    {welcomeData.title}
                </h1>

                {/* 부제목 - 콘서트 페이지와 동일한 스타일 */}
                <p
                    className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                    style={{
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '0 16px' : '0',
                    }}
                >
                    {welcomeData.subtitle}
                </p>

                {/* 콘텐츠 영역 - 콘서트 페이지와 동일한 간격 시스템 */}
                <div
                    className={`space-y-${isMobile ? '4' : isTablet ? '5' : '8'}`}
                >
                    {/* 환영 메시지 카드 */}
                    <div
                        className="rounded-xl shadow-md text-center"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile
                                ? '24px'
                                : isTablet
                                  ? '28px'
                                  : '32px',
                        }}
                    >
                        <div className="text-6xl mb-4">
                            {isAdmin ? '👑' : isSeller ? '🎪' : '🎭'}
                        </div>
                        <h2
                            className={`font-bold text-white mb-3 ${isMobile ? 'text-lg' : 'text-xl'}`}
                        >
                            {welcomeData.subtitle}
                        </h2>
                        <p
                            className={`text-gray-300 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}
                        >
                            {welcomeData.message}
                        </p>
                    </div>

                    {/* 빠른 액션 카드들 */}
                    <div>
                        <h3
                            className={`font-bold text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}
                        >
                            빠른 액션
                        </h3>
                        <div
                            className={`grid gap-4 ${
                                isMobile
                                    ? 'grid-cols-1'
                                    : isTablet
                                      ? 'grid-cols-2'
                                      : 'grid-cols-3'
                            }`}
                        >
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (
                                            action.requiresSeller &&
                                            !isSeller &&
                                            !isAdmin
                                        ) {
                                            alert(
                                                '이 기능을 사용하려면 판매자 권한이 필요합니다.',
                                            );
                                            navigate('/seller/apply');
                                            return;
                                        }
                                        if (action.requiresSeller && isAdmin) {
                                            alert(
                                                '관리자는 판매자 기능을 사용할 수 없습니다.',
                                            );
                                            return;
                                        }
                                        navigate(action.path);
                                    }}
                                    className="text-left p-6 rounded-xl shadow-md transition-all hover:scale-105"
                                    style={{
                                        backgroundColor: '#1f2937', // gray-800
                                        border: '1px solid #374151', // gray-700
                                        minHeight: isMobile ? '120px' : '140px',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isMobile) {
                                            e.target.style.borderColor =
                                                action.color;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isMobile) {
                                            e.target.style.borderColor =
                                                '#374151';
                                        }
                                    }}
                                >
                                    <div className="flex items-start gap-4">
                                        <div
                                            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                            style={{
                                                backgroundColor: action.color,
                                            }}
                                        >
                                            <span className="text-xl">
                                                {action.icon}
                                            </span>
                                        </div>
                                        <div className="flex-1">
                                            <h4
                                                className={`font-semibold text-white mb-1 ${isMobile ? 'text-base' : 'text-lg'}`}
                                            >
                                                {action.title}
                                            </h4>
                                            <p
                                                className={`text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}
                                            >
                                                {action.description}
                                            </p>
                                            {action.requiresSeller &&
                                                !isSeller &&
                                                !isAdmin && (
                                                    <p className="text-yellow-400 text-xs mt-1">
                                                        * 판매자 권한 필요
                                                    </p>
                                                )}
                                            {action.requiresSeller &&
                                                isAdmin && (
                                                    <p className="text-red-400 text-xs mt-1">
                                                        * 관리자 접근 불가
                                                    </p>
                                                )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 추가 정보 카드 (일반 사용자에게만 표시) */}
                    {!isSeller && !isAdmin && (
                        <div
                            className="rounded-xl shadow-md"
                            style={{
                                backgroundColor: '#1f2937', // gray-800
                                border: '1px solid #374151', // gray-700
                                padding: isMobile ? '20px' : '24px',
                            }}
                        >
                            <h3
                                className={`font-bold text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}
                            >
                                💡 판매자가 되는 방법
                            </h3>
                            <div
                                className={`space-y-4 text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        1
                                    </span>
                                    <div>
                                        <p className="font-medium text-white">
                                            판매자 권한 신청
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            사업자 정보와 필요 서류를 제출하세요
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        2
                                    </span>
                                    <div>
                                        <p className="font-medium text-white">
                                            승인 대기
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            관리자가 신청 내용을 검토합니다
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        3
                                    </span>
                                    <div>
                                        <p className="font-medium text-white">
                                            승인 완료
                                        </p>
                                        <p className="text-sm text-gray-400">
                                            콘서트 등록 및 관리가 가능합니다
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <button
                                    onClick={() => navigate('/seller/status')}
                                    className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all ${
                                        isMobile
                                            ? 'w-full py-3 px-6'
                                            : 'py-2 px-6'
                                    }`}
                                >
                                    판매자 권한 신청하기
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 모바일에서 하단 여백 - 콘서트 페이지와 동일 */}
                {isMobile && <div className="h-16" aria-hidden="true"></div>}
            </div>
        </div>
    );
};

export default SellerHomePage;
