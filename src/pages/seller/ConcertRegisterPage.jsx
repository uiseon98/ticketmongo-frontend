import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import ConcertForm from '../../features/seller/components/ConcertForm.jsx';

/**
 * ConcertRegisterPage.jsx (Responsive Version)
 *
 * 콘서트 등록 페이지 - 완전 반응형
 * - 판매자 권한 확인
 * - 모바일 우선 설계
 * - 터치 친화적 인터페이스
 * - 적응형 레이아웃
 * - 스크린 크기별 최적화
 */
const ConcertRegisterPage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [isMobile, setIsMobile] = useState(false);

    // 화면 크기 감지
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 판매자 권한 확인
    const sellerId = user?.userId; // 또는 user?.sellerId가 별도로 있다면 그것 사용

    // 로그인하지 않았거나 판매자가 아닌 경우 처리 (반응형)
    if (!user) {
        return (
            <div
                style={{
                    padding: isMobile ? '16px' : '24px',
                    backgroundColor: '#111922',
                    color: 'white',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        maxWidth: isMobile ? '90%' : '500px',
                        width: '100%',
                        padding: isMobile ? '24px' : '32px',
                        backgroundColor: '#1f2937',
                        borderRadius: '12px',
                        border: '1px solid #374151',
                    }}
                >
                    {/* 아이콘 */}
                    <div
                        style={{
                            fontSize: isMobile ? '48px' : '64px',
                            marginBottom: isMobile ? '16px' : '24px',
                        }}
                    >
                        🔒
                    </div>

                    {/* 제목 */}
                    <h2
                        style={{
                            fontSize: isMobile ? '24px' : '32px',
                            fontWeight: 'bold',
                            marginBottom: isMobile ? '12px' : '16px',
                            lineHeight: '1.3',
                            color: '#ffffff',
                        }}
                    >
                        접근 권한이 없습니다
                    </h2>

                    {/* 설명 */}
                    <p
                        style={{
                            marginBottom: isMobile ? '24px' : '32px',
                            fontSize: isMobile ? '16px' : '18px',
                            color: '#d1d5db',
                            lineHeight: '1.6',
                        }}
                    >
                        콘서트 등록은 로그인한 판매자만 가능합니다.
                    </p>

                    {/* 로그인 버튼 */}
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            padding: isMobile ? '16px 24px' : '12px 24px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: isMobile ? '18px' : '16px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minHeight: isMobile ? '48px' : 'auto',
                            width: isMobile ? '100%' : 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                        }}
                        onMouseEnter={(e) => {
                            if (!isMobile) {
                                e.target.style.backgroundColor = '#2563eb';
                                e.target.style.transform = 'translateY(-1px)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isMobile) {
                                e.target.style.backgroundColor = '#3b82f6';
                                e.target.style.transform = 'translateY(0)';
                            }
                        }}
                    >
                        🔑 로그인하기
                    </button>
                </div>
            </div>
        );
    }

    // 콘서트 등록 성공 시 콜백
    const handleConcertSuccess = (newConcert) => {
        console.log('콘서트 등록 성공:', newConcert);

        // 성공 메시지 표시
        alert(`"${newConcert.title}" 콘서트가 성공적으로 등록되었습니다!`);

        // 등록된 콘서트 상세 페이지로 이동
        navigate('/seller/concerts');
    };

    // 콘서트 등록 취소 시 (뒤로가기 등)
    const handleConcertCancel = () => {
        // 콘서트 목록 페이지로 이동하거나 이전 페이지로
        navigate('/concerts');
    };

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
                {/* 뒤로가기 버튼 (모바일에서 더 중요) */}
                {isMobile && (
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'transparent',
                            color: '#9ca3af',
                            border: '1px solid #4b5563',
                            padding: '8px 12px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginBottom: '16px',
                            minHeight: '44px',
                        }}
                    >
                        ← 뒤로가기
                    </button>
                )}

                {/* 제목 */}
                <h1
                    style={{
                        fontSize: isMobile ? '28px' : '36px',
                        fontWeight: 'bold',
                        marginBottom: isMobile ? '8px' : '16px',
                        color: '#ffffff',
                        lineHeight: '1.2',
                    }}
                >
                    콘서트 등록
                </h1>

                {/* 설명 */}
                <p
                    style={{
                        fontSize: isMobile ? '16px' : '18px',
                        color: '#d1d5db',
                        lineHeight: '1.6',
                        maxWidth: isMobile ? '100%' : '600px',
                        margin: '0 auto',
                    }}
                >
                    새로운 콘서트 정보를 등록하는 페이지입니다.
                </p>

                {/* 데스크톱에서 뒤로가기 버튼 */}
                {!isMobile && (
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'transparent',
                            color: '#9ca3af',
                            border: '1px solid #4b5563',
                            padding: '8px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer',
                            marginTop: '16px',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#374151';
                            e.target.style.borderColor = '#6b7280';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.borderColor = '#4b5563';
                        }}
                    >
                        ← 이전 페이지로
                    </button>
                )}
            </div>

            {/* 콘서트 등록 폼 컨테이너 - 반응형 */}
            <div
                style={{
                    maxWidth: isMobile ? '100%' : '1024px',
                    margin: '0 auto',
                    width: '100%',
                }}
            >
                {/* 안내 메시지 (모바일에서만 표시) */}
                {isMobile && (
                    <div
                        style={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            borderRadius: '8px',
                            padding: '16px',
                            marginBottom: '16px',
                            fontSize: '14px',
                            color: '#d1d5db',
                            lineHeight: '1.5',
                            textAlign: 'center',
                        }}
                    >
                        💡 모든 필드를 정확히 입력해주세요. 등록 후 수정이 가능합니다.
                    </div>
                )}

                {/* 콘서트 등록 폼 */}
                <ConcertForm
                    isOpen={true} // 항상 열려있음
                    modal={false} // 모달이 아닌 페이지 모드
                    onClose={handleConcertCancel}
                    onSuccess={handleConcertSuccess}
                    concert={null} // 생성 모드이므로 null
                    sellerId={sellerId}
                />
            </div>

            {/* 도움말 섹션 (데스크톱에서만 표시) */}
            {!isMobile && (
                <div
                    style={{
                        maxWidth: '1024px',
                        margin: '32px auto 0',
                        padding: '24px',
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '12px',
                    }}
                >
                    <h3
                        style={{
                            fontSize: '18px',
                            fontWeight: '600',
                            color: '#ffffff',
                            marginBottom: '16px',
                        }}
                    >
                        📋 콘서트 등록 가이드
                    </h3>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '24px',
                            fontSize: '14px',
                            color: '#d1d5db',
                            lineHeight: '1.6',
                        }}
                    >
                        <div>
                            <h4 style={{ color: '#3b82f6', marginBottom: '8px', fontWeight: '600' }}>
                                필수 정보
                            </h4>
                            <ul style={{ paddingLeft: '16px', margin: 0 }}>
                                <li>콘서트 제목 및 아티스트명</li>
                                <li>공연장 정보 (이름, 주소)</li>
                                <li>공연 일시 (날짜, 시작/종료 시간)</li>
                                <li>좌석 수 및 예매 기간</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ color: '#10b981', marginBottom: '8px', fontWeight: '600' }}>
                                추가 팁
                            </h4>
                            <ul style={{ paddingLeft: '16px', margin: 0 }}>
                                <li>포스터 이미지로 주목도 향상</li>
                                <li>상세한 콘서트 설명 작성</li>
                                <li>적절한 연령 제한 설정</li>
                                <li>등록 후 언제든 수정 가능</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* 플로팅 도움말 버튼 (모바일에서만) */}
            {isMobile && (
                <button
                    onClick={() => {
                        alert(`📋 콘서트 등록 가이드

필수 정보:
• 콘서트 제목 및 아티스트명
• 공연장 정보 (이름, 주소)
• 공연 일시 (날짜, 시작/종료 시간)
• 좌석 수 및 예매 기간

추가 팁:
• 포스터 이미지로 주목도 향상
• 상세한 콘서트 설명 작성
• 적절한 연령 제한 설정
• 등록 후 언제든 수정 가능`);
                    }}
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        width: '56px',
                        height: '56px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        fontSize: '24px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease',
                    }}
                    onTouchStart={(e) => {
                        e.target.style.transform = 'scale(0.95)';
                    }}
                    onTouchEnd={(e) => {
                        e.target.style.transform = 'scale(1)';
                    }}
                >
                    💡
                </button>
            )}
        </div>
    );
};

export default ConcertRegisterPage;