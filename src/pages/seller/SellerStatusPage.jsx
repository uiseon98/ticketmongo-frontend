// 콘서트 페이지와 통일된 디자인 적용
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../shared/utils/apiClient';

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

const SellerStatusPage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const { isMobile, isTablet } = useResponsive();

    const [sellerStatus, setSellerStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 모달 관련 상태
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
    const [showWithdrawalImpossibleModal, setShowWithdrawalImpossibleModal] = useState(false);
    const [confirmationInput, setConfirmationInput] = useState('');

    // 기존 useEffect와 핸들러들은 동일하게 유지...
    useEffect(() => {
        const fetchSellerStatus = async () => {
            if (!user) {
                setLoading(false);
                setError('로그인 정보가 없습니다.');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/users/me/seller-status');
                setSellerStatus(response.data);
            } catch (err) {
                console.error('판매자 상태 조회 실패:', err);
                setError(err.response?.data?.message || '판매자 상태를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchSellerStatus();
    }, [user]);

    const handleApplyClick = () => {
        navigate('/seller/apply');
    };

    const handleWithdrawClick = () => {
        if (!sellerStatus) return;

        if (sellerStatus.canWithdraw) {
            setShowWithdrawalModal(true);
        } else {
            setShowWithdrawalImpossibleModal(true);
        }
    };

    const confirmWithdrawal = async () => {
        const requiredPhrase = `${user?.username || ''}, 권한 철회 처리에 동의합니다.`;
        if (confirmationInput !== requiredPhrase) {
            alert('입력 문구가 일치하지 않습니다. 정확히 입력해주세요.');
            return;
        }

        try {
            await apiClient.delete('/users/me/role');
            alert('판매자 권한 철회 요청이 성공적으로 처리되었습니다. 이용해 주셔서 감사합니다.');
            setShowWithdrawalModal(false);
            setConfirmationInput('');
            window.location.reload();
        } catch (err) {
            console.error('판매자 권한 철회 실패:', err.response?.data);
            alert(err.response?.data?.message || '권한 철회에 실패했습니다.');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    // 로딩 상태 - 콘서트 페이지와 동일한 스타일
    if (loading) {
        return (
            <div
                style={{
                    backgroundColor: '#111827',
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
                    {/* 페이지 제목 */}
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
                        판매자 권한 상태
                    </h1>

                    {/* 부제목 */}
                    <p
                        className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                        style={{
                            fontSize: isMobile ? '14px' : '16px',
                            padding: isMobile ? '0 16px' : '0',
                        }}
                    >
                        판매자 권한 신청 및 상태를 확인하고 관리할 수 있습니다.
                    </p>

                    {/* 로딩 카드 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            padding: isMobile ? '40px 20px' : isTablet ? '50px 30px' : '60px 40px',
                            textAlign: 'center',
                            maxWidth: isMobile ? '100%' : '600px',
                            margin: '0 auto',
                        }}
                    >
                        <div
                            style={{
                                width: isMobile ? '32px' : '40px',
                                height: isMobile ? '32px' : '40px',
                                border: '4px solid #374151',
                                borderTop: '4px solid #3B82F6',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite',
                                margin: '0 auto 16px',
                            }}
                        />
                        <div style={{
                            color: '#FFFFFF',
                            fontSize: isMobile ? '14px' : '18px'
                        }}>
                            판매자 상태 정보를 불러오는 중...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center text-red-500 ${isMobile ? 'py-6 px-4' : 'py-10'}`}>
                에러: {error}
            </div>
        );
    }

    if (!sellerStatus) {
        return (
            <div
                style={{
                    backgroundColor: '#111827',
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <div
                        className="rounded-xl shadow-md text-center"
                        style={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            padding: isMobile ? '32px 24px' : '40px 32px',
                            maxWidth: '500px',
                            width: '100%',
                        }}
                    >
                        <div className="text-6xl mb-6">⚠️</div>
                        <h3 className={`font-bold text-gray-300 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                            판매자 상태 정보를 불러올 수 없습니다
                        </h3>
                        <button
                            onClick={() => window.location.reload()}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all ${
                                isMobile ? 'w-full py-4 px-6 text-lg' : 'py-3 px-8 text-base'
                            }`}
                            style={{
                                minHeight: isMobile ? '52px' : 'auto',
                            }}
                        >
                            다시 시도
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const { approvalStatus, lastReason, canReapply, applicationDate, lastProcessedDate } = sellerStatus;

    // approvalStatus 값에 따른 상태 메시지 결정
    let statusMessage = '';
    let statusColorClass = 'text-gray-400';

    switch (approvalStatus) {
        case 'PENDING':
            statusMessage = '신청 대기 중';
            statusColorClass = 'text-yellow-500';
            break;
        case 'APPROVED':
            statusMessage = '승인됨';
            statusColorClass = 'text-green-500';
            break;
        case 'REJECTED':
            statusMessage = '반려됨';
            statusColorClass = 'text-red-500';
            break;
        case 'WITHDRAWN':
            statusMessage = '철회됨';
            statusColorClass = 'text-gray-500';
            break;
        case 'REVOKED':
            statusMessage = '강제 해제됨';
            statusColorClass = 'text-purple-500';
            break;
        default:
            statusMessage = '미신청';
            statusColorClass = 'text-blue-400';
            break;
    }

    const confirmationPhrasePlaceholder = `${user?.username || ''}, 권한 철회 처리에 동의합니다.`;

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
                    판매자 권한 상태
                </h1>

                {/* 부제목 - 콘서트 페이지와 동일한 스타일 */}
                <p
                    className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                    style={{
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '0 16px' : '0',
                    }}
                >
                    판매자 권한 신청 및 상태를 확인하고 관리할 수 있습니다.
                </p>

                {/* 콘텐츠 영역 - 콘서트 페이지와 동일한 간격 시스템 */}
                <div className={`space-y-${isMobile ? '4' : isTablet ? '5' : '8'}`}>
                    {/* 메인 상태 카드 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile ? '24px' : isTablet ? '28px' : '32px',
                            maxWidth: isMobile ? '100%' : '600px',
                            margin: '0 auto',
                        }}
                    >
                        {/* 현재 계정 정보 */}
                        <div className="mb-8">
                            <h3 className={`font-bold text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                                현재 계정 정보
                            </h3>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0"
                                >
                                    <span className="text-white text-lg">👤</span>
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium text-white ${isMobile ? 'text-base' : 'text-lg'}`}>
                                        {user?.username || 'Guest'}
                                    </p>
                                    <p className={`text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}>
                                        역할: {sellerStatus.role === 'ADMIN'
                                            ? '관리자'
                                            : sellerStatus.role === 'SELLER'
                                                ? `판매자 (${statusMessage})`
                                                : `일반 유저 (${statusMessage})`}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 판매자 권한 신청 현황 */}
                        <div className="mb-8">
                            <h3 className={`font-bold text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                                판매자 권한 신청 현황
                            </h3>
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"
                                >
                                    <span className="text-white text-lg">📋</span>
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium text-white mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
                                        현재 신청 상태: <span className={statusColorClass}>{statusMessage}</span>
                                    </p>
                                    <div className={`text-gray-300 space-y-1 ${isMobile ? 'text-sm' : 'text-base'}`}>
                                        <p>신청 일시: {formatDate(applicationDate)}</p>
                                        <p>최종 처리 일시: {formatDate(lastProcessedDate)}</p>
                                    </div>
                                    {lastReason && (
                                        <div className="mt-3">
                                            {approvalStatus === 'REJECTED' && (
                                                <p className="text-red-400 text-sm">
                                                    반려 사유: {lastReason}
                                                </p>
                                            )}
                                            {approvalStatus === 'REVOKED' && (
                                                <p className="text-purple-400 text-sm">
                                                    강제 해제 사유: {lastReason}
                                                </p>
                                            )}
                                            {approvalStatus === 'WITHDRAWN' && (
                                                <p className="text-gray-400 text-sm">
                                                    철회 사유: {lastReason || '본인 요청에 의해 철회됨'}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 액션 버튼 섹션 */}
                        <div className="flex justify-center">
                            <div className="flex flex-col sm:flex-row gap-3">
                                {approvalStatus === 'PENDING' && (
                                    <button
                                        className="px-6 py-3 bg-yellow-600 text-white rounded-lg opacity-50 cursor-not-allowed font-medium"
                                        disabled
                                    >
                                        대기 중
                                    </button>
                                )}

                                {(approvalStatus === null ||
                                    approvalStatus === 'REJECTED' ||
                                    approvalStatus === 'WITHDRAWN' ||
                                    approvalStatus === 'REVOKED') &&
                                    canReapply && (
                                        <button
                                            onClick={handleApplyClick}
                                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                            style={{
                                                minHeight: isMobile ? '48px' : 'auto',
                                            }}
                                        >
                                            {approvalStatus === null
                                                ? '판매자 권한 신청하기'
                                                : '재신청하기'}
                                        </button>
                                    )}

                                {approvalStatus === 'APPROVED' && (
                                    <button
                                        onClick={handleWithdrawClick}
                                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                                        style={{
                                            minHeight: isMobile ? '48px' : 'auto',
                                        }}
                                    >
                                        권한 철회 신청
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 모바일에서 하단 여백 - 콘서트 페이지와 동일 */}
                {isMobile && (
                    <div className="h-16" aria-hidden="true"></div>
                )}
            </div>

            {/* 모달들도 콘서트 페이지 스타일 적용 */}
            {showWithdrawalImpossibleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div
                        className="rounded-xl shadow-lg text-center max-w-md w-full"
                        style={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            padding: isMobile ? '24px' : '32px',
                        }}
                    >
                        <div className="text-5xl mb-4">⚠️</div>
                        <h3 className={`font-bold text-red-400 mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                            권한 철회 불가
                        </h3>
                        <p className={`text-gray-300 mb-6 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                            현재 진행 중인 또는 진행 예정 중인 콘서트가 있으므로, 권한 철회가 불가능합니다.
                        </p>
                        <button
                            onClick={() => setShowWithdrawalImpossibleModal(false)}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors ${
                                isMobile ? 'w-full py-3 px-6' : 'py-2 px-6'
                            }`}
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            {showWithdrawalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                    <div
                        className="rounded-xl shadow-lg max-w-md w-full"
                        style={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            padding: isMobile ? '24px' : '32px',
                        }}
                    >
                        <h3 className={`font-bold text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                            권한 철회 확인
                        </h3>
                        <p className={`text-gray-300 mb-4 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}>
                            판매자 권한을 철회하시겠습니까? 이 작업은 되돌릴 수 없습니다. 아래 문구를 정확히 입력하여 동의해주세요.
                        </p>
                        <p className={`text-yellow-300 font-semibold mb-3 break-words ${isMobile ? 'text-sm' : 'text-base'}`}>
                            {confirmationPhrasePlaceholder}
                        </p>
                        <input
                            type="text"
                            value={confirmationInput}
                            onChange={(e) => setConfirmationInput(e.target.value)}
                            placeholder={confirmationPhrasePlaceholder}
                            className={`w-full p-3 mb-6 rounded-lg text-white placeholder-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}
                            style={{
                                backgroundColor: '#374151',
                                border: '1px solid #4b5563',
                            }}
                        />
                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowWithdrawalModal(false);
                                    setConfirmationInput('');
                                }}
                                className={`bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors ${
                                    isMobile ? 'py-3 px-6' : 'py-2 px-6'
                                }`}
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmWithdrawal}
                                className={`font-medium rounded-lg transition-colors ${
                                    isMobile ? 'py-3 px-6' : 'py-2 px-6'
                                } ${
                                    confirmationInput === confirmationPhrasePlaceholder
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-red-800 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={confirmationInput !== confirmationPhrasePlaceholder}
                            >
                                철회 확인
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerStatusPage;