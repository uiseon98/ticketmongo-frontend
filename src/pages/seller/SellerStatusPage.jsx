import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import apiClient from '../../shared/utils/apiClient';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';

const SellerStatusPage = () => {
    // 이름 변경
    const { user } = useContext(AuthContext); // user 정보 가져오기
    const navigate = useNavigate();

    const [sellerStatus, setSellerStatus] = useState(null); // 판매자 상태 데이터
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    // 모달(팝업) 관련 상태
    const [showWithdrawalModal, setShowWithdrawalModal] = useState(false); // 철회 확인 모달 표시 여부
    const [showWithdrawalImpossibleModal, setShowWithdrawalImpossibleModal] =
        useState(false); // 철회 불가 모달 표시 여부
    const [confirmationInput, setConfirmationInput] = useState(''); // 확인 문구 입력 값

    // 사용자 권한 확인 (AuthContext의 user.role 사용)
    const isSellerApproved =
        user &&
        user.role === 'ROLE_SELLER' &&
        user.approvalStatus === 'APPROVED'; // user.role이 ROLE_SELLER이고 approvalStatus가 APPROVED인 경우

    // 판매자 상태 API 호출
    useEffect(() => {
        const fetchSellerStatus = async () => {
            if (!user) {
                // 유저 정보 없으면 호출할 필요 없음 (로그인 안 된 경우 App.jsx에서 Unauthorized로 리다이렉트되지만, 혹시 모를 상황 대비)
                setLoading(false);
                setError('로그인 정보가 없습니다.');
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get('/users/me/seller-status');
                setSellerStatus(response.data.data); // SuccessResponse.of("message", data) 형태이므로 data.data
            } catch (err) {
                console.error('판매자 상태 조회 실패:', err);
                setError(
                    err.response?.data?.message ||
                        '판매자 상태를 불러오는데 실패했습니다.',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchSellerStatus();
    }, [user]); // user 객체가 변경될 때마다 재호출 (로그인/로그아웃 등)

    // 판매자 권한 신청/재신청 페이지로 이동
    const handleApplyClick = () => {
        navigate('/seller/apply');
    };

    // 권한 철회 버튼 클릭 로직
    const handleWithdrawClick = () => {
        if (!sellerStatus) return;

        if (sellerStatus.canWithdraw) {
            // 철회 가능한 경우, 확인 입력 모달 표시
            setShowWithdrawalModal(true);
        } else {
            // 철회 불가능한 경우, 경고 모달 표시
            setShowWithdrawalImpossibleModal(true);
        }
    };

    // 실제 권한 철회 처리 함수
    const confirmWithdrawal = async () => {
        const requiredPhrase = `${user?.username || ''}, 권한 철회 처리에 동의합니다.`; // 사용자 이름 포함
        if (confirmationInput !== requiredPhrase) {
            alert('입력 문구가 일치하지 않습니다. 정확히 입력해주세요.');
            return;
        }

        try {
            // TODO: 백엔드 API 연동 필요 (DELETE 요청)
            // await apiClient.delete('/users/me/seller-role'); // 실제 API 호출
            alert(
                '판매자 권한 철회 요청이 성공적으로 처리되었습니다. (실제 API 호출은 미구현)',
            );
            setShowWithdrawalModal(false);
            setConfirmationInput('');
            // 상태를 다시 불러와 UI 업데이트
            // fetchSellerStatus(); // 실제 API 호출 후 이 함수를 다시 호출하여 상태 업데이트
        } catch (err) {
            console.error('판매자 권한 철회 실패:', err);
            alert(err.response?.data?.message || '권한 철회에 실패했습니다.');
        }
    };

    // 날짜 포맷터
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

    if (loading) {
        return <LoadingSpinner />; // 로딩 중 스피너 표시
    }

    if (error) {
        return <ErrorMessage message={error} />; // 에러 발생 시 에러 메시지 표시
    }

    // sellerStatus 객체가 제대로 로드되지 않았을 경우 (예: 초기값 null) 처리
    if (!sellerStatus) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] bg-[#111922] text-white p-4">
                <p className="text-lg text-gray-400">
                    판매자 상태 정보를 불러올 수 없습니다.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-4 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg"
                >
                    다시 시도
                </button>
            </div>
        );
    }

    const {
        approvalStatus,
        lastReason,
        canReapply,
        // canWithdraw, // handleWithdrawClick 함수 내에서 sellerStatus.canWithdraw 형태로 직접 사용 중
        applicationDate,
        processedDate,
    } = sellerStatus;

    // approvalStatus 값에 따른 상태 메시지 결정
    let statusMessage = '';
    let statusColorClass = 'text-gray-400'; // 기본 색상

    switch (approvalStatus) {
        case 'PENDING':
            statusMessage = '신청 대기 중';
            statusColorClass = 'text-yellow-500'; // 노란색
            break;
        case 'APPROVED':
            statusMessage = '승인됨';
            statusColorClass = 'text-green-500'; // 초록색
            break;
        case 'REJECTED':
            statusMessage = '반려됨';
            statusColorClass = 'text-red-500'; // 빨간색
            break;
        case 'WITHDRAWN':
            statusMessage = '철회됨';
            statusColorClass = 'text-gray-500'; // 회색
            break;
        case 'REVOKED':
            statusMessage = '강제 해제됨';
            statusColorClass = 'text-purple-500'; // 보라색
            break;
        case null: // 판매자 신청을 하지 않은 초기 상태
        default:
            statusMessage = '미신청';
            statusColorClass = 'text-blue-400'; // 파란색
            break;
    }

    const confirmationPhrasePlaceholder = `${user?.username || ''}, 권한 철회 처리에 동의합니다.`;

    return (
        <div className="flex flex-col px-6 py-5 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            <div className="flex flex-wrap justify-between gap-3 p-4">
                <div className="flex min-w-72 flex-col gap-3">
                    <p className="text-white tracking-light text-[32px] font-bold leading-tight">
                        판매자 권한 상태
                    </p>
                    <p className="text-[#93acc8] text-sm font-normal leading-normal">
                        판매자 권한 신청 및 상태를 확인하고 관리할 수 있습니다.
                    </p>
                </div>
            </div>

            <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
                현재 계정 정보
            </h3>
            <div className="bg-[#121a21] pt-2 pr-4 pb-2 pl-4 flex flex-row gap-4 items-center justify-start self-stretch shrink-0 h-[72px] min-h-[72px] relative">
                <div className="bg-[#243347] rounded-lg flex flex-row gap-0 items-center justify-center shrink-0 w-12 h-12 relative">
                    <div className="shrink-0 w-6 h-6 relative overflow-hidden">
                        <img
                            className="w-6 h-6 absolute left-0 top-0 overflow-visible"
                            src="/vector-03.svg"
                            alt="User Icon"
                        />
                        <div className="flex flex-col gap-0 items-start justify-start w-5 h-[19px] absolute left-0 top-0"></div>
                    </div>
                </div>
                <div className="flex flex-col gap-0 items-start justify-center shrink-0 relative">
                    <div className="flex flex-col gap-0 items-start justify-start shrink-0 w-[77px] relative overflow-hidden">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            {user?.username || 'Guest'}
                        </div>
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start shrink-0 relative overflow-hidden">
                        <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                            역할:{' '}
                            {user?.role === 'ROLE_ADMIN'
                                ? '관리자'
                                : isSellerApproved
                                  ? '판매자 (승인됨)'
                                  : '일반 유저'}
                        </div>
                    </div>
                </div>
            </div>
            <div className="pt-4 pr-4 pb-2 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-lg leading-[23px] font-bold relative self-stretch">
                    판매자 권한 신청 현황
                </div>
            </div>
            <div className="bg-[#121a21] pt-3 pr-4 pb-3 pl-4 flex flex-row gap-4 items-start justify-start self-stretch shrink-0 relative">
                <div className="bg-[#243347] rounded-lg flex flex-row gap-0 items-center justify-center shrink-0 w-12 h-12 relative">
                    <div className="shrink-0 w-6 h-6 relative overflow-hidden">
                        <img
                            className="w-6 h-6 absolute left-0 top-0 overflow-visible"
                            src="/vector-04.svg"
                            alt="Status Icon"
                        />
                        <div className="flex flex-col gap-0 items-start justify-start w-5 h-5 absolute left-0 top-0"></div>
                    </div>
                </div>
                <div className="flex flex-col gap-0 items-start justify-center flex-1 relative">
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            현재 신청 상태:{' '}
                            <span className={statusColorClass}>
                                {statusMessage}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                            신청 일시: {formatDate(applicationDate)}
                            <br />
                            최종 처리 일시: {formatDate(processedDate)}
                        </div>
                    </div>
                    {lastReason && approvalStatus === 'REJECTED' && (
                        <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative mt-1">
                            <div className="text-red-400 text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                반려 사유: {lastReason}
                            </div>
                        </div>
                    )}
                    {lastReason && approvalStatus === 'REVOKED' && (
                        <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative mt-1">
                            <div className="text-purple-400 text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                강제 해제 사유: {lastReason}
                            </div>
                        </div>
                    )}
                    {lastReason && approvalStatus === 'WITHDRAWN' && (
                        <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative mt-1">
                            <div className="text-gray-400 text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                철회 사유:{' '}
                                {lastReason || '본인 요청에 의해 철회됨'}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-row items-start justify-between self-stretch shrink-0 relative mt-4">
                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-row gap-3 items-start justify-start flex-wrap content-start flex-1 relative">
                    {/* 상태에 따른 버튼 렌더링 */}
                    {approvalStatus === 'PENDING' && (
                        <button
                            className="px-6 py-3 bg-yellow-600 text-white rounded-lg shadow-md opacity-50 cursor-not-allowed"
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
                                className="px-6 py-3 bg-[#1a78e5] hover:bg-[#156cb2] text-white rounded-lg shadow-md transition duration-300"
                            >
                                {approvalStatus === null
                                    ? '판매자 권한 신청하기'
                                    : '재신청하기'}
                            </button>
                        )}

                    {approvalStatus === 'APPROVED' && ( // APPROVED 상태일 때만 철회 버튼 표시
                        <button
                            onClick={handleWithdrawClick}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition duration-300"
                        >
                            권한 철회 신청
                        </button>
                    )}
                </div>
            </div>

            {/* 철회 불가 경고 모달 */}
            {showWithdrawalImpossibleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-[#1e2a3a] p-8 rounded-lg shadow-xl max-w-md w-full text-center">
                        <h3 className="text-xl font-bold text-red-400 mb-4">
                            권한 철회 불가
                        </h3>
                        <p className="text-gray-300 mb-6">
                            현재 진행 중인 또는 진행 예정 중인 콘서트가
                            있으므로, 권한 철회가 불가능합니다.
                        </p>
                        <button
                            onClick={() =>
                                setShowWithdrawalImpossibleModal(false)
                            }
                            className="px-6 py-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}

            {/* 권한 철회 확인 입력 모달 */}
            {showWithdrawalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-[#1e2a3a] p-8 rounded-lg shadow-xl max-w-md w-full">
                        <h3 className="text-xl font-bold text-white mb-4">
                            권한 철회 확인
                        </h3>
                        <p className="text-gray-300 mb-4">
                            판매자 권한을 철회하시겠습니까? 이 작업은 되돌릴 수
                            없습니다. 아래 문구를 정확히 입력하여 동의해주세요.
                        </p>
                        <p className="text-yellow-300 font-semibold mb-3 break-words">
                            {confirmationPhrasePlaceholder}
                        </p>
                        <input
                            type="text"
                            value={confirmationInput}
                            onChange={(e) =>
                                setConfirmationInput(e.target.value)
                            }
                            placeholder={confirmationPhrasePlaceholder}
                            className="w-full p-3 mb-6 bg-[#0A0D11] border border-[#243447] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowWithdrawalModal(false);
                                    setConfirmationInput('');
                                }}
                                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                            >
                                취소
                            </button>
                            <button
                                onClick={confirmWithdrawal}
                                className={`px-6 py-2 rounded-lg ${
                                    confirmationInput ===
                                    confirmationPhrasePlaceholder
                                        ? 'bg-red-600 hover:bg-red-700 text-white'
                                        : 'bg-red-800 text-gray-400 cursor-not-allowed'
                                }`}
                                disabled={
                                    confirmationInput !==
                                    confirmationPhrasePlaceholder
                                }
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

export default SellerStatusPage; // 이름 변경
