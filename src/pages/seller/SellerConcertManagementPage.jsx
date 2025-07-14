// ===== SellerConcertManagementPage.jsx =====
// 콘서트 페이지와 통일된 디자인 적용
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import SellerConcertList from '../../features/seller/components/SellerConcertList.jsx';
import ConcertForm from '../../features/seller/components/ConcertForm.jsx';
import { AlertCircle, Music, Plus } from 'lucide-react';

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

const SellerConcertManagementPage = () => {
    const { user } = useContext(AuthContext);
    const { isMobile, isTablet } = useResponsive();

    // 모달 상태 관리
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedConcert, setSelectedConcert] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const sellerId = user?.userId;

    // 이벤트 핸들러들
    const handleCreateConcert = () => {
        setSelectedConcert(null);
        setShowCreateModal(true);
    };

    const handleEditConcert = (concert) => {
        setSelectedConcert(concert);
        setShowEditModal(true);
    };

    const handleConcertSuccess = (concert) => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedConcert(null);
        setRefreshTrigger((prev) => prev + 1);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedConcert(null);
    };

    // 로그인하지 않았거나 판매자가 아닌 경우 처리 - 콘서트 페이지와 동일한 스타일
    if (!user || !sellerId) {
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
                        콘서트 관리
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
                            콘서트 관리는 로그인한 판매자만 가능합니다.
                        </p>
                        <button
                            onClick={() => (window.location.href = '/login')}
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
                    콘서트 관리
                </h1>

                {/* 부제목 - 콘서트 페이지와 동일한 스타일 */}
                <p
                    className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                    style={{
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '0 16px' : '0',
                    }}
                >
                    등록된 콘서트 목록을 확인하고 관리하는 페이지입니다.
                </p>

                {/* 콘텐츠 영역 - 콘서트 페이지와 동일한 간격 시스템 */}
                <div className={`space-y-${isMobile ? '4' : isTablet ? '5' : '8'}`}>
                    {/* 콘서트 목록 - 콘서트 페이지 카드 스타일 적용 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            overflow: 'hidden',
                        }}
                    >
                        <SellerConcertList
                            sellerId={sellerId}
                            onCreateConcert={handleCreateConcert}
                            onEditConcert={handleEditConcert}
                            refreshTrigger={refreshTrigger}
                        />
                    </div>
                </div>

                {/* 콘서트 생성 모달 */}
                {showCreateModal && (
                    <ConcertForm
                        isOpen={showCreateModal}
                        onClose={handleCloseModal}
                        onSuccess={handleConcertSuccess}
                        concert={null}
                        sellerId={sellerId}
                        modal={true}
                    />
                )}

                {/* 콘서트 수정 모달 */}
                {showEditModal && selectedConcert && (
                    <ConcertForm
                        isOpen={showEditModal}
                        onClose={handleCloseModal}
                        onSuccess={handleConcertSuccess}
                        concert={selectedConcert}
                        sellerId={sellerId}
                        modal={true}
                    />
                )}

                {/* 플로팅 액션 버튼 (모바일에서만) */}
                {isMobile && (
                    <button
                        onClick={handleCreateConcert}
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
                        aria-label="새 콘서트 등록"
                    >
                        <Plus size={24} />
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

export default SellerConcertManagementPage;