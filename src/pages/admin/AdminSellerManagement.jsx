import React, { useState, useEffect, useCallback } from 'react';
import { adminSellerService } from '../../features/admin/services/adminSellerService';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import Button from '../../shared/components/ui/Button';
import Modal from '../../shared/components/ui/Modal'; // 모달 컴포넌트
import InputField from '../../shared/components/ui/InputField'; // 입력 필드
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트 추가

// 반응형 Hook
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

const AdminSellerManagement = () => {
    const navigate = useNavigate(); // useNavigate 훅 초기화
    const { isMobile, isTablet } = useResponsive(); // 반응형 훅 사용

    // --- 상태 관리 ---
    const [currentSellers, setCurrentSellers] = useState([]); // 현재 판매자 목록 (API-04-05)

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // showRevokeModal, selectedUser, revokeReason, formErrors 상태 유지
    const [showRevokeModal, setShowRevokeModal] = useState(false); // 강제 해제 모달
    const [selectedUser, setSelectedUser] = useState(null); // 모달에 표시할 유저 정보
    const [revokeReason, setRevokeReason] = useState(''); // 강제 해제 사유
    const [formErrors, setFormErrors] = useState({}); // 모달 폼 에러 (강제 해제 모달용)

    // --- 데이터 페칭 함수 ---

    // 현재 판매자 목록 조회 (API-04-05)
    const fetchCurrentSellers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminSellerService.getCurrentSellers();
            setCurrentSellers(data);
        } catch (err) {
            setError(err.message || '현재 판매자 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, []);

    // --- 초기 로드 효과 ---
    useEffect(() => {
        fetchCurrentSellers(); // 현재 판매자 목록만 로드
    }, [fetchCurrentSellers]);

    // --- 이벤트 핸들러: 강제 권한 해제 ---
    const handleRevokeClick = (user) => {
        setSelectedUser(user);
        setShowRevokeModal(true);
        setRevokeReason('');
        setFormErrors({});
    };

    const confirmRevokeRole = async () => {
        if (!revokeReason.trim()) {
            setFormErrors({ reason: '강제 권한 해제 사유는 필수입니다.' });
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await adminSellerService.revokeSellerRole(
                selectedUser.userId,
                revokeReason,
            );
            alert('판매자 권한 강제 해제 완료!');
            setShowRevokeModal(false);
            fetchCurrentSellers(); // 판매자 목록 새로고침 (역할 변경 반영)
        } catch (err) {
            setError(err.message || '판매자 권한 강제 해제 실패.');
        } finally {
            setLoading(false);
        }
    };

    // --- 이벤트 핸들러: 이력 페이지로 이동 ---
    const handleViewHistoryClick = useCallback(
        (seller) => {
            // ApplicationHistoryPage로 이동하며 userId를 URL 파라미터로 전달
            navigate(`/admin/history?userId=${seller.userId}`);
        },
        [navigate],
    );

    // --- 로딩 및 에러 처리 UI ---
    if (loading) {
        // 로딩 스피너를 중앙에 배치하고 배경색 설정
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
                    {/* 페이지 제목 */}
                    <h1
                        className={
                            isMobile
                                ? 'text-xl font-bold mb-4 text-center break-words animate-shimmer-text'
                                : isTablet
                                  ? 'text-2xl font-bold mb-5 text-center break-words animate-shimmer-text'
                                  : 'text-4xl font-bold mb-6 text-center break-words animate-shimmer-text'
                        }
                        style={{
                            color: '#FFFFFF',
                            padding: isMobile ? '0 8px' : '0',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                    >
                        현재 판매자 관리로 이동 중...
                    </h1>

                    {/* 부제목 */}
                    <p
                        className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                        style={{
                            fontSize: isMobile ? '14px' : '16px',
                            padding: isMobile ? '0 16px' : '0',
                        }}
                    >
                        현재 활동 중인 판매자 목록을 확인하고 관리합니다.
                    </p>

                    {/* 로딩 카드 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937',
                            border: '1px solid #374151',
                            padding: isMobile
                                ? '40px 20px'
                                : isTablet
                                  ? '50px 30px'
                                  : '60px 40px',
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
                        <div
                            style={{
                                color: '#FFFFFF',
                                fontSize: isMobile ? '14px' : '18px',
                            }}
                        >
                            판매자 목록을 불러오는 중...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        // 에러 메시지를 중앙에 배치하고 배경색 설정
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
                        <h3
                            className={`font-bold text-red-400 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}
                        >
                            오류가 발생했습니다
                        </h3>
                        <p
                            className={`text-gray-300 mb-6 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}
                        >
                            {error}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all ${
                                isMobile
                                    ? 'w-full py-4 px-6 text-lg'
                                    : 'py-3 px-8 text-base'
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

    // --- 렌더링 ---
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
                {/* 페이지 제목 */}
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
                    현재 판매자 관리
                </h1>

                {/* 부제목 */}
                <p
                    className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                    style={{
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '0 16px' : '0',
                    }}
                >
                    현재 활동 중인 판매자 목록을 확인하고 관리합니다.
                </p>

                {/* 대시보드로 돌아가기 버튼 추가 */}
                <div className={`mb-6 text-left ${isMobile ? 'mt-4' : 'mt-8'}`}>
                    <Button
                        onClick={() => navigate('/admin')}
                        className={`bg-gray-700 hover:bg-gray-600 text-white ${isMobile ? 'w-full py-3 text-base' : 'px-6 py-2 text-sm'}`}
                    >
                        ← 관리자 대시보드로 돌아가기
                    </Button>
                </div>

                {/* 콘텐츠 영역 */}
                <div
                    className={`space-y-${isMobile ? '4' : isTablet ? '5' : '8'}`}
                >
                    {/* --- 현재 판매자 목록 (API-04-05) --- */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            overflow: 'hidden', // 테이블 둥근 모서리를 위해
                        }}
                    >
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4 text-white">
                                👥 현재 판매자 목록 ({currentSellers.length}명)
                            </h3>
                            {currentSellers.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">
                                    현재 활동 중인 판매자가 없습니다.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-[#243447]">
                                            <tr>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    유저 ID
                                                </th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    아이디
                                                </th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    닉네임
                                                </th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    작업
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                            {currentSellers.map((seller) => (
                                                <tr key={seller.userId}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                                        {seller.userId}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                        {seller.username}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                        {seller.userNickname}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex justify-center space-x-2">
                                                            <Button
                                                                onClick={() =>
                                                                    handleRevokeClick(
                                                                        seller,
                                                                    )
                                                                }
                                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                                                            >
                                                                권한 해제
                                                            </Button>
                                                            <Button
                                                                onClick={() =>
                                                                    handleViewHistoryClick(
                                                                        seller,
                                                                    )
                                                                }
                                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                                                            >
                                                                이력
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 모바일에서 하단 여백 */}
                {isMobile && <div className="h-16" aria-hidden="true"></div>}
            </div>

            {/* --- 판매자 강제 권한 해제 모달 --- */}
            {showRevokeModal && selectedUser && (
                <Modal
                    isOpen={showRevokeModal}
                    onClose={() => setShowRevokeModal(false)}
                    title="판매자 권한 강제 해제"
                    modalClassName="bg-[#1a232f]" // 모달 배경색
                >
                    <p className="mb-4 text-gray-300">
                        &apos;{selectedUser.username}&apos;(
                        {selectedUser.userNickname}) 님의 판매자 권한을 강제로
                        해제하시겠습니까? 이 작업은 되돌릴 수 없으며, 활성
                        콘서트가 있는 판매자는 해제할 수 없습니다.
                    </p>
                    <InputField
                        label="해제 사유"
                        name="revokeReason"
                        value={revokeReason}
                        onChange={(e) => {
                            setRevokeReason(e.target.value);
                            setFormErrors({});
                        }}
                        placeholder="강제 해제 사유를 입력하세요"
                        error={formErrors.reason}
                        required={true}
                        className="mb-4 text-white"
                    />
                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => setShowRevokeModal(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                            취소
                        </Button>
                        <Button
                            onClick={confirmRevokeRole}
                            className="bg-red-600 hover:bg-red-700"
                            disabled={!revokeReason.trim()}
                        >
                            권한 해제하기
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminSellerManagement;
