import React, { useState, useEffect, useCallback } from 'react';
import { adminSellerService } from '../../features/admin/services/adminSellerService';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import Button from '../../shared/components/ui/Button';
import Modal from '../../shared/components/ui/Modal';
import InputField from '../../shared/components/ui/InputField';
import { useNavigate } from 'react-router-dom';

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

// 상태 한글명 매핑
const STATUS_LABELS = {
    ALL: '전체',
    REQUEST: '신청 대기 중',
    APPROVED: '승인됨',
    REJECTED: '반려됨',
    WITHDRAWN: '자발적 철회',
    REVOKED: '강제 해제',
};

const SellerApproval = () => {
    const { isMobile, isTablet } = useResponsive(); // 반응형 훅 사용
    const navigate = useNavigate(); // useNavigate 훅 사용

    // --- 상태 관리 ---
    const [pendingApplications, setPendingApplications] = useState([]); // 대기 중인 신청 목록
    const [loading, setLoading] = useState(true); // 페이지 로딩
    const [error, setError] = useState(null); // 페이지 에러

    // 모달 관련 상태
    const [showProcessModal, setShowProcessModal] = useState(false); // 승인/반려 모달
    const [selectedUser, setSelectedUser] = useState(null); // 모달에 표시할 유저 정보
    const [processReason, setProcessReason] = useState(''); // 반려 사유
    const [formErrors, setFormErrors] = useState({}); // 모달 폼 에러

    // --- 데이터 페칭 함수 ---
    const fetchPendingApplications = useCallback(async () => {
        setLoading(true); // 이 함수 호출 시 로딩 시작
        setError(null);
        try {
            const data =
                await adminSellerService.getPendingSellerApplications();
            setPendingApplications(data);
        } catch (err) {
            setError(
                err.message || '대기 중인 판매자 신청을 불러오지 못했습니다.',
            );
        } finally {
            setLoading(false); // 이 함수 완료 시 로딩 종료
        }
    }, []);

    // --- 초기 로드 효과 ---
    useEffect(() => {
        fetchPendingApplications();
    }, [fetchPendingApplications]); // 의존성 배열에 fetchPendingApplications 추가

    // --- 이벤트 핸들러: 승인/반려 ---
    const handleProcessClick = (user, approve) => {
        setSelectedUser({ ...user, approveAction: approve }); // 유저 정보와 어떤 액션인지 저장
        setShowProcessModal(true);
        setProcessReason(''); // 모달 열 때마다 사유 초기화
        setFormErrors({}); // 모달 열 때마다 에러 초기화
    };

    const confirmProcessApplication = async () => {
        if (selectedUser.approveAction === false && !processReason.trim()) {
            setFormErrors({ reason: '반려 시 사유는 필수입니다.' });
            return;
        }
        setLoading(true); // API 호출 시 로딩 시작
        setError(null);
        try {
            await adminSellerService.processSellerApplication(
                selectedUser.userId,
                selectedUser.approveAction,
                processReason,
            );
            alert(`${selectedUser.approveAction ? '승인' : '반려'} 처리 완료!`);
            setShowProcessModal(false);
            fetchPendingApplications(); // 대기 목록 새로고침
            // 여기서는 SellerApproval 페이지에만 집중하므로 다른 목록은 새로고침하지 않음
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    `판매자 신청 ${selectedUser.approveAction ? '승인' : '반려'} 실패.`,
            );
        } finally {
            setLoading(false); // API 호출 완료 시 로딩 종료
        }
    };

    // --- 유틸리티 함수: 날짜 포맷팅 ---
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
                        판매자 신청 승인/반려 관리로 이동 중...
                    </h1>

                    {/* 부제목 */}
                    <p
                        className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                        style={{
                            fontSize: isMobile ? '14px' : '16px',
                            padding: isMobile ? '0 16px' : '0',
                        }}
                    >
                        대기 중인 판매자 신청을 검토하고 처리합니다.
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
                            판매자 신청 목록을 불러오는 중...
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
                    판매자 신청 승인/반려 관리
                </h1>

                {/* 부제목 */}
                <p
                    className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                    style={{
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '0 16px' : '0',
                    }}
                >
                    대기 중인 판매자 신청을 검토하고 처리합니다.
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
                    {/* --- 대기 중인 판매자 신청 목록 (API-04-01) --- */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            overflow: 'hidden', // 테이블의 둥근 모서리를 위해
                        }}
                    >
                        <div className="p-6">
                            <h3 className="text-xl font-semibold mb-4 text-white">
                                🔔 대기 중인 판매자 신청 (
                                {pendingApplications.length}건)
                            </h3>
                            {pendingApplications.length === 0 ? (
                                <p className="text-gray-400 text-center py-4">
                                    새로운 판매자 신청이 없습니다.
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-700">
                                        <thead className="bg-[#243447]">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    신청 ID
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    유저 ID
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    아이디
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    닉네임
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    업체명
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    사업자번호
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    제출 서류
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    신청일
                                                </th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                    작업
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                            {pendingApplications.map((app) => (
                                                <tr key={app.applicationId}>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                                        {app.applicationId}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                        {app.userId}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                        {app.username}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                        {app.userNickname}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                        {app.companyName}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                        {app.businessNumber}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                        {app.uploadedFileUrl ? (
                                                            <a
                                                                href={
                                                                    app.uploadedFileUrl
                                                                }
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-400 hover:underline"
                                                            >
                                                                보기
                                                            </a>
                                                        ) : (
                                                            '없음'
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                        {formatDate(
                                                            app.createdAt,
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex space-x-2 justify-end">
                                                            <Button
                                                                onClick={() =>
                                                                    handleProcessClick(
                                                                        app,
                                                                        true,
                                                                    )
                                                                }
                                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                                                            >
                                                                승인
                                                            </Button>
                                                            <Button
                                                                onClick={() =>
                                                                    handleProcessClick(
                                                                        app,
                                                                        false,
                                                                    )
                                                                }
                                                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                                                            >
                                                                반려
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

            {/* --- 판매자 신청 승인/반려 모달 --- */}
            {showProcessModal && selectedUser && (
                <Modal
                    isOpen={showProcessModal}
                    onClose={() => setShowProcessModal(false)}
                    title={
                        selectedUser.approveAction
                            ? '판매자 신청 승인'
                            : '판매자 신청 반려'
                    }
                    modalClassName="bg-[#1a232f]" // 모달 배경색
                >
                    <p className="mb-4 text-gray-300">
                        &apos;{selectedUser.username}&apos;(
                        {selectedUser.userNickname}) 님의 판매자 신청을{' '}
                        {selectedUser.approveAction ? '승인' : '반려'}
                        하시겠습니까?
                    </p>
                    {!selectedUser.approveAction && ( // 반려 시에만 사유 입력 필드
                        <InputField
                            label="반려 사유"
                            name="processReason"
                            value={processReason}
                            onChange={(e) => {
                                setProcessReason(e.target.value);
                                setFormErrors({}); // 입력 시 에러 메시지 초기화
                            }}
                            placeholder="반려 사유를 입력하세요"
                            error={formErrors.reason}
                            required={true}
                            className="mb-4 text-white" // text-white 추가
                        />
                    )}
                    <div className="flex justify-end space-x-2">
                        <Button
                            onClick={() => setShowProcessModal(false)}
                            className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                            취소
                        </Button>
                        <Button
                            onClick={() => confirmProcessApplication()}
                            className={
                                selectedUser.approveAction
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                            }
                            disabled={
                                !selectedUser.approveAction &&
                                !processReason.trim()
                            }
                        >
                            {selectedUser.approveAction
                                ? '승인하기'
                                : '반려하기'}
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default SellerApproval;
