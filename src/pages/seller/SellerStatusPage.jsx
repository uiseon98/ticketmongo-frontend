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

    // 판매자 상태 API 호출
    useEffect(() => {
        // console.log('SellerStatusPage: User in context:', user);

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
                // 수정: response.data.data 에서 response.data 로 변경
                setSellerStatus(response.data); // SuccessResponse.of("message", data) 형태이므로 response.data 자체가 실제 데이터 객체
                console.log('API 응답 데이터 (sellerStatus):', response.data); // 디버깅용
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

    // 권한 철회 버튼 클릭 핸들러
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
        // 1. 확인 문구 일치 여부 검사 (프론트엔드 유효성 검사)
        const requiredPhrase = `${user?.username || ''}, 권한 철회 처리에 동의합니다.`; // 사용자 이름 포함
        if (confirmationInput !== requiredPhrase) {
            alert('입력 문구가 일치하지 않습니다. 정확히 입력해주세요.');
            return; // 일치하지 않으면 함수 종료
        }

        try {
            // 2. 백엔드 API 호출: 판매자 권한 철회 요청
            await apiClient.delete('/users/me/role'); // API-03-07: DELETE /api/users/me/role
            // 3. API 호출 성공 시 사용자에게 성공 메시지 알림
            alert(
                '판매자 권한 철회 요청이 성공적으로 처리되었습니다. 이용해 주셔서 감사합니다.',
            );
            // 4. 모달 닫기 및 입력값 초기화
            setShowWithdrawalModal(false); // 권한 철회 확인 모달 닫기
            setConfirmationInput(''); // 입력 필드 초기화

            // 5. 철회 성공 후 UI 상태 업데이트
            // user 객체는 AuthContext에서 오고, approvalStatus는 sellerStatus에서 오는 점을 고려
            // 서버에서 role과 approvalStatus가 USER, WITHDRAWN으로 변경된 후 다시 fetch하여 반영
            // 여기서는 페이지를 새로고침하여 AuthContext와 SellerStatus API를 모두 다시 불러오도록 하는 것이 가장 간단하고 확실
            window.location.reload(); // 페이지 전체를 새로고침하여 모든 상태 최신화
        } catch (err) {
            // 6. API 호출 실패 시 에러 처리
            console.error('판매자 권한 철회 실패:', err.response?.data);
            alert(err.response?.data?.message || '권한 철회에 실패했습니다.');
        } finally {
            // 7. 로딩 상태 처리 (만약 로딩 스피너를 띄웠다면 여기서 false로 설정)
            // 지금은 alert가 뜨고 reload되므로 로딩 상태는 별도 처리하지 않음 (사용자가 로딩 상태를 볼 틈이 없음)
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
        return <LoadingSpinner message="판매자 상태 정보를 불러오는 중..." />; // 로딩 중 스피너 표시
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

    // API로부터 받은 실제 데이터에서 속성들을 구조 분해 할당
    // processedDate 대신 lastProcessedDate 사용
    const {
        approvalStatus,
        lastReason,
        canReapply,
        // canWithdraw, // handleWithdrawClick 함수 내에서 sellerStatus.canWithdraw 형태로 직접 사용 중
        applicationDate,
        lastProcessedDate,
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
        default:
            statusMessage = '미신청';
            statusColorClass = 'text-blue-400'; // 파란색
            break;
    }

    const confirmationPhrasePlaceholder = `${user?.username || ''}, 권한 철회 처리에 동의합니다.`;

    return (
        <div className="flex flex-col px-6 py-5 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            {/* 판매자 권한 상태 - 화면 가운데 정렬 */}
            <div className="flex flex-col items-center justify-center gap-3 p-4 text-center">
                <p className="text-white tracking-light text-[32px] font-bold leading-tight">
                    판매자 권한 상태
                </p>
                <p className="text-[#93acc8] text-sm font-normal leading-normal max-w-lg">
                    판매자 권한 신청 및 상태를 확인하고 관리할 수 있습니다.
                </p>
            </div>

            {/* 모든 섹션과 버튼을 포함하는 하나의 큰 네모 박스 */}
            {/* max-w-xs: 화면 너비의 1/3 정도, mx-auto: 가운데 정렬 */}
            <section className="bg-[#1a232f] p-6 rounded-lg shadow-md border border-[#243447] max-w-xl mx-auto w-full">
                {/* 현재 계정 정보 */}
                <h3 className="text-white text-left text-xl font-bold mb-4">
                    현재 계정 정보
                </h3>
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-[#243347] rounded-lg flex items-center justify-center w-12 h-12 flex-shrink-0">
                        <img
                            className="w-6 h-6"
                            src="/vector-03.svg"
                            alt="User Icon"
                        />
                    </div>
                    <div className="flex flex-col items-start">
                        <p className="text-[#ffffff] text-left text-base font-medium">
                            {user?.username || 'Guest'}
                        </p>
                        <p className="text-[#94abc7] text-left text-sm">
                            역할:{' '}
                            {sellerStatus.role === 'ADMIN'
                                ? '관리자'
                                : sellerStatus.role === 'SELLER'
                                  ? `판매자 (${statusMessage})`
                                  : `일반 유저 (${statusMessage})`}
                        </p>
                    </div>
                </div>

                {/* 판매자 권한 신청 현황 */}
                <h3 className="text-white text-left text-xl font-bold mb-4">
                    판매자 권한 신청 현황
                </h3>
                <div className="flex items-start gap-4 mb-6">
                    <div className="bg-[#243347] rounded-lg flex items-center justify-center w-12 h-12 flex-shrink-0">
                        <img
                            className="w-6 h-6"
                            src="/vector-04.svg"
                            alt="Status Icon"
                        />
                    </div>
                    <div className="flex flex-col items-start flex-1">
                        <p className="text-[#ffffff] text-left text-base font-medium">
                            현재 신청 상태:{' '}
                            <span className={statusColorClass}>
                                {statusMessage}
                            </span>
                        </p>
                        <p className="text-[#94abc7] text-left text-sm">
                            신청 일시: {formatDate(applicationDate)}
                            <br />
                            최종 처리 일시: {formatDate(lastProcessedDate)}
                        </p>
                        {lastReason && approvalStatus === 'REJECTED' && (
                            <p className="text-red-400 text-left text-sm mt-1">
                                반려 사유: {lastReason}
                            </p>
                        )}
                        {lastReason && approvalStatus === 'REVOKED' && (
                            <p className="text-purple-400 text-left text-sm mt-1">
                                강제 해제 사유: {lastReason}
                            </p>
                        )}
                        {lastReason && approvalStatus === 'WITHDRAWN' && (
                            <p className="text-gray-400 text-left text-sm mt-1">
                                철회 사유:{' '}
                                {lastReason || '본인 요청에 의해 철회됨'}
                            </p>
                        )}
                    </div>
                </div>

                {/* 버튼 섹션 */}
                {/* 이 flex 컨테이너는 이제 부모 section 내에서 가운데 정렬됨 */}
                <div className="flex justify-left mt-6">
                    <div className="pt-3 pr-4 pb-3 pl-4 flex flex-row gap-3 items-start justify-center flex-wrap content-start relative">
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

                        {approvalStatus === 'APPROVED' && (
                            <button
                                onClick={handleWithdrawClick}
                                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition duration-300"
                            >
                                권한 철회 신청
                            </button>
                        )}
                    </div>
                </div>
            </section>

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

export default SellerStatusPage;
