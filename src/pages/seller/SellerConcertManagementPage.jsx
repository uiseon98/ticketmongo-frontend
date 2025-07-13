import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';
import SellerConcertList from '../../features/seller/components/SellerConcertList.jsx';
import ConcertForm from '../../features/seller/components/ConcertForm.jsx';
import { AlertCircle, Music, Plus } from 'lucide-react';

/**
 * SellerConcertManagementPage.jsx (Responsive Version)
 *
 * 판매자 콘서트 관리 페이지 - 완전 반응형
 * - 판매자 권한 확인
 * - 모바일 우선 설계
 * - 터치 친화적 인터페이스
 * - 적응형 레이아웃
 * - 스크린 크기별 최적화
 * - 모달 관리 개선
 */
const SellerConcertManagementPage = () => {
    const { user } = useContext(AuthContext);
    const [isMobile, setIsMobile] = useState(false);

    // 모달 상태 관리
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedConcert, setSelectedConcert] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // 판매자 ID
    const sellerId = user?.userId;

    // 화면 크기 감지
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // ====== 이벤트 핸들러들 ======

    // 콘서트 생성 모달 열기
    const handleCreateConcert = () => {
        setSelectedConcert(null);
        setShowCreateModal(true);
    };

    // 콘서트 수정 모달 열기
    const handleEditConcert = (concert) => {
        setSelectedConcert(concert);
        setShowEditModal(true);
    };

    // 콘서트 생성/수정 성공 시
    const handleConcertSuccess = (concert) => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedConcert(null);
        setRefreshTrigger((prev) => prev + 1);
    };

    // 모달 닫기
    const handleCloseModal = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedConcert(null);
    };

    // 로그인하지 않았거나 판매자가 아닌 경우 처리 (반응형)
    if (!user || !sellerId) {
        return (
            <div
                style={{
                    padding: isMobile ? '16px' : '24px',
                    backgroundColor: '#111922',
                    color: 'white',
                    minHeight: '100vh',
                    width: '100%',
                    boxSizing: 'border-box',
                }}
            >
                {/* 페이지 헤더 */}
                <div
                    style={{
                        marginBottom: isMobile ? '24px' : '32px',
                        textAlign: isMobile ? 'center' : 'left',
                    }}
                >
                    <h1
                        style={{
                            fontSize: isMobile ? '28px' : '36px',
                            fontWeight: 'bold',
                            marginBottom: isMobile ? '8px' : '16px',
                            color: '#ffffff',
                            lineHeight: '1.2',
                        }}
                    >
                        콘서트 관리
                    </h1>
                </div>

                {/* 권한 없음 상태 */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: isMobile ? '60vh' : '400px',
                        padding: isMobile ? '20px' : '40px',
                    }}
                >
                    <div
                        style={{
                            textAlign: 'center',
                            maxWidth: isMobile ? '90%' : '500px',
                            width: '100%',
                            padding: isMobile ? '32px 24px' : '40px 32px',
                            backgroundColor: '#1f2937',
                            borderRadius: '16px',
                            border: '1px solid #374151',
                            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        {/* 아이콘 */}
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                marginBottom: isMobile ? '20px' : '24px',
                            }}
                        >
                            <div
                                style={{
                                    width: isMobile ? '64px' : '80px',
                                    height: isMobile ? '64px' : '80px',
                                    backgroundColor: '#dc2626',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <AlertCircle
                                    size={isMobile ? 32 : 40}
                                    style={{ color: 'white' }}
                                />
                            </div>
                        </div>

                        {/* 제목 */}
                        <h3
                            style={{
                                fontSize: isMobile ? '24px' : '28px',
                                fontWeight: 'bold',
                                marginBottom: isMobile ? '12px' : '16px',
                                color: '#ffffff',
                                lineHeight: '1.3',
                            }}
                        >
                            접근 권한이 없습니다
                        </h3>

                        {/* 설명 */}
                        <p
                            style={{
                                marginBottom: isMobile ? '32px' : '40px',
                                fontSize: isMobile ? '16px' : '18px',
                                color: '#d1d5db',
                                lineHeight: '1.6',
                            }}
                        >
                            콘서트 관리는 로그인한 판매자만 가능합니다.
                        </p>

                        {/* 로그인 버튼 */}
                        <button
                            onClick={() => (window.location.href = '/login')}
                            style={{
                                backgroundColor: '#3b82f6',
                                color: 'white',
                                padding: isMobile ? '16px 32px' : '12px 32px',
                                borderRadius: '12px',
                                border: 'none',
                                fontSize: isMobile ? '18px' : '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                minHeight: isMobile ? '52px' : 'auto',
                                width: isMobile ? '100%' : 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                            }}
                            onMouseEnter={(e) => {
                                if (!isMobile) {
                                    e.target.style.backgroundColor = '#2563eb';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isMobile) {
                                    e.target.style.backgroundColor = '#3b82f6';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                                }
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
                padding: isMobile ? '16px' : '24px',
                backgroundColor: '#111922',
                color: 'white',
                minHeight: '100vh',
                width: '100%',
                boxSizing: 'border-box',
            }}
        >
            {/* 페이지 헤더 - 반응형 */}
            <div
                style={{
                    marginBottom: isMobile ? '24px' : '32px',
                    textAlign: isMobile ? 'center' : 'left',
                }}
            >
                {/* 타이틀과 아이콘 */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isMobile ? 'center' : 'flex-start',
                        gap: '12px',
                        marginBottom: isMobile ? '8px' : '16px',
                    }}
                >
                    <div
                        style={{
                            width: isMobile ? '40px' : '48px',
                            height: isMobile ? '40px' : '48px',
                            backgroundColor: '#3b82f6',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Music size={isMobile ? 20 : 24} color="white" />
                    </div>
                    <h1
                        style={{
                            fontSize: isMobile ? '28px' : '36px',
                            fontWeight: 'bold',
                            color: '#ffffff',
                            lineHeight: '1.2',
                            margin: 0,
                        }}
                    >
                        콘서트 관리
                    </h1>
                </div>

                {/* 설명 */}
                <p
                    style={{
                        fontSize: isMobile ? '16px' : '18px',
                        color: '#d1d5db',
                        lineHeight: '1.6',
                        margin: 0,
                        maxWidth: isMobile ? '100%' : '600px',
                        marginLeft: isMobile ? '0' : '60px', // 아이콘과 정렬
                    }}
                >
                    등록된 콘서트 목록을 확인하고 관리하는 페이지입니다.
                </p>

                {/* 빠른 액션 버튼 (모바일에서만) */}
                {isMobile && (
                    <button
                        onClick={handleCreateConcert}
                        style={{
                            marginTop: '20px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            padding: '16px 24px',
                            borderRadius: '12px',
                            border: 'none',
                            fontSize: '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            minHeight: '52px',
                            transition: 'all 0.2s ease',
                        }}
                        onTouchStart={(e) => {
                            e.target.style.transform = 'scale(0.98)';
                        }}
                        onTouchEnd={(e) => {
                            e.target.style.transform = 'scale(1)';
                        }}
                    >
                        <Plus size={20} />
                        새 콘서트 등록
                    </button>
                )}
            </div>

            {/* 콘서트 목록 컴포넌트 - 반응형 */}
            <div
                style={{
                    backgroundColor: isMobile ? 'transparent' : '#374151',
                    borderRadius: isMobile ? '0' : '12px',
                    border: isMobile ? 'none' : '1px solid #4b5563',
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

            {/* 콘서트 생성 모달 */}
            {showCreateModal && (
                <ConcertForm
                    isOpen={showCreateModal}
                    onClose={handleCloseModal}
                    onSuccess={handleConcertSuccess}
                    concert={null} // 생성 모드
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
                    concert={selectedConcert} // 수정 모드
                    sellerId={sellerId}
                    modal={true}
                />
            )}

            {/* 플로팅 액션 버튼 (모바일에서만, 리스트가 있을 때) */}
            {isMobile && (
                <button
                    onClick={handleCreateConcert}
                    style={{
                        position: 'fixed',
                        bottom: '24px',
                        right: '24px',
                        width: '64px',
                        height: '64px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        fontSize: '24px',
                        cursor: 'pointer',
                        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                    }}
                    onTouchStart={(e) => {
                        e.target.style.transform = 'scale(0.95)';
                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                    }}
                    onTouchEnd={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.3)';
                    }}
                    aria-label="새 콘서트 등록"
                >
                    <Plus size={28} />
                </button>
            )}
        </div>
    );
};

export default SellerConcertManagementPage;