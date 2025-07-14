import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import ConcertForm from '../../features/seller/components/ConcertForm.jsx';

// 반응형 Hook (콘서트 페이지와 동일)
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

const ConcertRegisterPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { isMobile, isTablet } = useResponsive();

    const sellerId = user?.userId;

    // 로그인하지 않았거나 판매자가 아닌 경우 처리 - 콘서트 페이지와 동일한 스타일
    if (!user) {
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
                    className={isMobile
                        ? "p-4 overflow-x-hidden"
                        : isTablet
                            ? "max-w-4xl mx-auto p-4 overflow-x-hidden"
                            : "max-w-6xl mx-auto p-6 overflow-x-hidden"
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
                        className={isMobile
                            ? "text-xl font-bold mb-4 text-center break-words"
                            : isTablet
                                ? "text-2xl font-bold mb-5 text-center break-words"
                                : "text-4xl font-bold mb-6 text-center break-words"
                        }
                        style={{
                            color: '#FFFFFF',
                            padding: isMobile ? '0 8px' : '0',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                    >
                        콘서트 등록
                    </h1>

                    {/* 권한 없음 상태 - 콘서트 페이지 스타일 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile ? '32px 24px' : isTablet ? '40px 32px' : '48px 40px',
                            textAlign: 'center',
                            maxWidth: isMobile ? '100%' : '500px',
                            margin: '0 auto',
                        }}
                    >
                        <div className="text-6xl mb-6">🔒</div>
                        <h3 className={`font-bold text-red-400 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                            접근 권한이 없습니다
                        </h3>
                        <p className={`text-gray-300 mb-8 leading-relaxed ${isMobile ? 'text-base' : 'text-lg'}`}>
                            콘서트 등록은 로그인한 판매자만 가능합니다.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all ${
                                isMobile ? 'w-full py-4 px-6 text-lg' : 'py-3 px-8 text-base'
                            }`}
                            style={{
                                minHeight: isMobile ? '52px' : 'auto',
                            }}
                        >
                            🔑 로그인하기
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 콘서트 등록 성공 시 콜백
    const handleConcertSuccess = (newConcert) => {
        console.log('콘서트 등록 성공:', newConcert);
        alert(`"${newConcert.title}" 콘서트가 성공적으로 등록되었습니다!`);
        navigate('/seller/concerts');
    };

    // 콘서트 등록 취소 시
    const handleConcertCancel = () => {
        navigate('/concerts');
    };

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
                className={isMobile
                    ? "p-4 overflow-x-hidden"
                    : isTablet
                        ? "max-w-4xl mx-auto p-4 overflow-x-hidden"
                        : "max-w-6xl mx-auto p-6 overflow-x-hidden"
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
                    className={isMobile
                        ? "text-xl font-bold mb-4 text-center break-words"
                        : isTablet
                            ? "text-2xl font-bold mb-5 text-center break-words"
                            : "text-4xl font-bold mb-6 text-center break-words"
                    }
                    style={{
                        color: '#FFFFFF',
                        padding: isMobile ? '0 8px' : '0',
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word',
                    }}
                >
                    콘서트 등록
                </h1>

                {/* 부제목 - 콘서트 페이지와 동일한 스타일 */}
                <p
                    className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                    style={{
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '0 16px' : '0',
                    }}
                >
                    새로운 콘서트 정보를 등록하는 페이지입니다.
                </p>

                {/* 콘텐츠 영역 - 콘서트 페이지와 동일한 간격 시스템 */}
                <div className={`space-y-${isMobile ? '4' : isTablet ? '5' : '8'}`}>
                    {/* 뒤로가기 버튼 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile ? '16px' : isTablet ? '20px' : '24px',
                        }}
                    >
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                        >
                            ← 이전 페이지로
                        </button>
                    </div>

                    {/* 안내 메시지 (모바일에서만 표시) */}
                    {isMobile && (
                        <div
                            className="rounded-xl shadow-md"
                            style={{
                                backgroundColor: '#1f2937', // gray-800
                                border: '1px solid #374151', // gray-700
                                padding: '16px',
                            }}
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">💡</div>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    모든 필드를 정확히 입력해주세요. 등록 후 수정이 가능합니다.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* 콘서트 등록 폼 - 콘서트 페이지 카드 스타일 적용 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                        }}
                    >
                        <ConcertForm
                            isOpen={true}
                            modal={false}
                            onClose={handleConcertCancel}
                            onSuccess={handleConcertSuccess}
                            concert={null}
                            sellerId={sellerId}
                        />
                    </div>

                    {/* 도움말 섹션 (데스크톱에서만 표시) */}
                    {!isMobile && (
                        <div
                            className="rounded-xl shadow-md"
                            style={{
                                backgroundColor: '#1f2937', // gray-800
                                border: '1px solid #374151', // gray-700
                                padding: '24px',
                            }}
                        >
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                📋 콘서트 등록 가이드
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300 leading-relaxed">
                                <div>
                                    <h4 className="text-blue-400 mb-3 font-semibold">필수 정보</h4>
                                    <ul className="space-y-1 pl-4">
                                        <li>• 콘서트 제목 및 아티스트명</li>
                                        <li>• 공연장 정보 (이름, 주소)</li>
                                        <li>• 공연 일시 (날짜, 시작/종료 시간)</li>
                                        <li>• 좌석 수 및 예매 기간</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-green-400 mb-3 font-semibold">추가 팁</h4>
                                    <ul className="space-y-1 pl-4">
                                        <li>• 포스터 이미지로 주목도 향상</li>
                                        <li>• 상세한 콘서트 설명 작성</li>
                                        <li>• 적절한 연령 제한 설정</li>
                                        <li>• 등록 후 언제든 수정 가능</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 플로팅 도움말 버튼 (모바일에서만) */}
                {isMobile && (
                    <button
                        onClick={() => {
                            alert(`📋 콘서트 등록 가이드\n\n필수 정보:\n• 콘서트 제목 및 아티스트명\n• 공연장 정보 (이름, 주소)\n• 공연 일시 (날짜, 시작/종료 시간)\n• 좌석 수 및 예매 기간\n\n추가 팁:\n• 포스터 이미지로 주목도 향상\n• 상세한 콘서트 설명 작성\n• 적절한 연령 제한 설정\n• 등록 후 언제든 수정 가능`);
                        }}
                        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg z-50 flex items-center justify-center transition-all"
                        style={{
                            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
                        }}
                        onTouchStart={(e) => {
                            e.target.style.transform = 'scale(0.95)';
                        }}
                        onTouchEnd={(e) => {
                            e.target.style.transform = 'scale(1)';
                        }}
                        aria-label="도움말"
                    >
                        💡
                    </button>
                )}

                {/* 모바일에서 하단 여백 - 콘서트 페이지와 동일 */}
                {isMobile && (
                    <div className="h-16" aria-hidden="true"></div>
                )}
            </div>
        </div>
    );
};

export default ConcertRegisterPage;
