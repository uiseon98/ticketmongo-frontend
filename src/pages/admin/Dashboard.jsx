import React, { useState, useEffect, useCallback } from 'react';
import { adminSellerService } from '../../features/admin/services/adminSellerService';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import Button from '../../shared/components/ui/Button';
import Modal from '../../shared/components/ui/Modal';
import InputField from '../../shared/components/ui/InputField';
import { useNavigate } from 'react-router-dom';
import {
    formatPhoneNumber,
    formatBusinessNumber,
} from '../../shared/utils/formatters'; // 포맷팅 함수 임포트

const AdminDashboard = () => {
    const navigate = useNavigate();

    // --- 대시보드 요약 데이터 상태 ---
    const [pendingCount, setPendingCount] = useState(0);
    const [currentSellersCount, setCurrentSellersCount] = useState(0);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Quick Actions 모달 관련 상태 ---
    // 1. 다음 대기 신청 처리 모달
    const [showProcessPendingModal, setShowProcessPendingModal] =
        useState(false);
    const [pendingAppToProcess, setPendingAppToProcess] = useState(null); // 처리할 대기 신청 데이터
    const [processReason, setProcessReason] = useState('');
    const [processFormErrors, setProcessFormErrors] = useState({});
    const [processModalLoading, setProcessModalLoading] = useState(false);

    // 2. 판매자 빠른 검색 모달
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchModalLoading, setSearchModalLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    // --- 대시보드 요약 데이터 페칭 ---
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const pendingApps =
                    await adminSellerService.getPendingSellerApplications();
                setPendingCount(pendingApps.length);

                const currentSellers =
                    await adminSellerService.getCurrentSellers();
                setCurrentSellersCount(currentSellers.length);

                const historyResponse =
                    await adminSellerService.getAllSellerApprovalHistory({
                        page: 0,
                        size: 5,
                    });
                setRecentActivities(historyResponse.content);
            } catch (err) {
                console.error('관리자 대시보드 데이터 로드 실패:', err);
                setError(
                    err.response?.data?.message ||
                        '대시보드 데이터를 불러오는데 실패했습니다.',
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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

    // --- 유틸리티 함수: 이력 타입 한글명 매핑 ---
    const getHistoryTypeLabel = useCallback((type) => {
        const STATUS_LABELS = {
            REQUEST: '신청',
            SUBMITTED: '신청',
            APPROVED: '승인',
            REJECTED: '반려',
            WITHDRAWN: '철회',
            REVOKED: '강제 해제',
        };
        return STATUS_LABELS[type] || type;
    }, []);

    // --- Quick Actions: 다음 대기 신청 처리 핸들러 ---
    const handleProcessNextPending = useCallback(async () => {
        setProcessModalLoading(true);
        setProcessFormErrors({});
        try {
            const pendingApps =
                await adminSellerService.getPendingSellerApplications();

            if (pendingApps.length === 0) {
                alert('현재 대기 중인 판매자 신청이 없습니다.');
                setPendingAppToProcess(null);
                setShowProcessPendingModal(false);
            } else {
                const app = pendingApps[0]; // 가장 오래된(또는 최신) 신청 1건

                // 해당 유저의 모든 이력을 조회
                const userHistory =
                    await adminSellerService.getSellerApprovalHistoryForUser(
                        app.userId,
                    );

                // 신규/재신청 여부 판단
                // REQUEST 타입만 있다면 신규, 그 외(REJECTED, WITHDRAWN, REVOKED) 이력이 있다면 재신청
                const isReapplicant = userHistory.some(
                    (h) =>
                        h.type === 'REJECTED' ||
                        h.type === 'WITHDRAWN' ||
                        h.type === 'REVOKED',
                );
                const hasRevokedHistory = userHistory.some(
                    (h) => h.type === 'REVOKED',
                );

                // pendingAppToProcess에 이력 정보 추가
                setPendingAppToProcess({
                    ...app,
                    isReapplicant,
                    hasRevokedHistory,
                    userHistorySummary: userHistory, // 전체 이력을 요약에 전달 (UI에서 직접 슬라이스)
                });

                setShowProcessPendingModal(true);
                setProcessReason(''); // 모달 열 때 사유 초기화
            }
        } catch (err) {
            console.error('대기 신청 조회 실패:', err);
            setError(
                err.response?.data?.message ||
                    '대기 신청을 불러오는데 실패했습니다.',
            );
        } finally {
            setProcessModalLoading(false);
        }
    }, [navigate]);

    // Quick Actions: 다음 대기 신청 승인/반려 모달 내 처리 함수
    const confirmProcessPending = useCallback(
        async (approveAction) => {
            if (!pendingAppToProcess) return;

            if (!approveAction && !processReason.trim()) {
                // 반려인데 사유가 비어있을 경우
                setProcessFormErrors({ reason: '반려 시 사유는 필수입니다.' });
                return;
            }

            setProcessModalLoading(true);
            setProcessFormErrors({});
            try {
                await adminSellerService.processSellerApplication(
                    pendingAppToProcess.userId,
                    approveAction,
                    processReason,
                );
                alert(`${approveAction ? '승인' : '반려'} 처리 완료!`);
                setShowProcessPendingModal(false);
                setPendingAppToProcess(null);
                setProcessReason('');
                // 대시보드 요약 카운트 새로고침
                const updatedPendingApps =
                    await adminSellerService.getPendingSellerApplications();
                setPendingCount(updatedPendingApps.length);
                const updatedRecentActivities =
                    await adminSellerService.getAllSellerApprovalHistory({
                        page: 0,
                        size: 5,
                    });
                setRecentActivities(updatedRecentActivities.content);
            } catch (err) {
                console.error('신청 처리 실패:', err);
                setProcessFormErrors({
                    api:
                        err.response?.data?.message ||
                        '신청 처리에 실패했습니다.',
                });
            } finally {
                setProcessModalLoading(false);
            }
        },
        [pendingAppToProcess, processReason],
    );

    // --- Quick Actions: 판매자 빠른 검색 핸들러 ---
    const handleQuickSearch = useCallback(() => {
        setShowSearchModal(true);
        setSearchKeyword('');
        setSearchResults([]);
        setSearchError(null);
    }, []);

    // Quick Actions: 판매자 빠른 검색 모달 내 검색 실행 함수
    const executeQuickSearch = useCallback(async () => {
        if (!searchKeyword.trim()) {
            setSearchError('검색어를 입력해주세요.');
            return;
        }
        setSearchModalLoading(true);
        setSearchError(null);
        try {
            const searchHistoryResponse =
                await adminSellerService.getAllSellerApprovalHistory({
                    page: 0,
                    size: 10,
                    keyword: searchKeyword.trim(),
                });
            setSearchResults(searchHistoryResponse.content);
        } catch (err) {
            console.error('판매자 검색 실패:', err);
            setSearchError(
                err.response?.data?.message || '판매자 검색에 실패했습니다.',
            );
        } finally {
            setSearchModalLoading(false);
        }
    }, [searchKeyword]);

    // --- 로딩 및 에러 처리 UI ---
    if (loading) {
        return <LoadingSpinner message="대시보드 데이터를 불러오는 중..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="p-6 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            {/* Dashboard 제목 섹션 */}
            <div className="p-4 flex flex-row gap-y-3 items-start justify-between flex-wrap content-start self-stretch shrink-0 relative">
                <div className="flex flex-col gap-0 items-start justify-start shrink-0 w-72 min-w-[288px] relative">
                    <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-[32px] leading-10 font-bold relative self-stretch">
                        Dashboard{' '}
                    </div>
                </div>
            </div>

            {/* 요약 카드 섹션 */}
            <div className="p-4 flex flex-row gap-4 items-start justify-start flex-wrap content-start self-stretch shrink-0 relative">
                {/* Pending Seller Applications 카드 */}
                <div className="rounded-lg border-solid border-[#334a66] border p-6 flex flex-col gap-2 items-start justify-start flex-1 min-w-[158px] relative">
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            Pending Seller Applications{' '}
                        </div>
                        <img
                            src="/admin-vector-03.svg"
                            alt="Pending Applications Icon"
                            className="w-6 h-6 mt-2"
                        />
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-2xl leading-[30px] font-bold relative self-stretch">
                            {pendingCount}{' '}
                        </div>
                    </div>
                </div>
                {/* Current Sellers 카드 */}
                <div className="rounded-lg border-solid border-[#334a66] border p-6 flex flex-col gap-2 items-start justify-start flex-1 min-w-[158px] relative">
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            Current Sellers{' '}
                        </div>
                        <img
                            src="/admin-vector-00.svg"
                            alt="Current Sellers Icon"
                            className="w-6 h-6 mt-2"
                        />
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-2xl leading-[30px] font-bold relative self-stretch">
                            {currentSellersCount}{' '}
                        </div>
                    </div>
                </div>
                {/* Recent Activities 카드 */}
                <div className="rounded-lg border-solid border-[#334a66] border p-6 flex flex-col gap-2 items-start justify-start flex-1 min-w-[158px] relative">
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-base leading-6 font-medium relative self-stretch">
                            Recent Activities{' '}
                        </div>
                        <img
                            src="/admin-vector-01.svg"
                            alt="Recent Activities Icon"
                            className="w-6 h-6 mt-2"
                        />
                    </div>
                    <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                        <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-2xl leading-[30px] font-bold relative self-stretch">
                            {recentActivities.length > 0
                                ? recentActivities.length
                                : 0}{' '}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions 섹션 */}
            <div className="pt-5 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-[22px] leading-7 font-bold relative self-stretch">
                    Quick Actions{' '}
                </div>
            </div>
            <div className="flex flex-row items-start justify-between self-stretch shrink-0 relative">
                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-row gap-3 items-start justify-start flex-wrap content-start flex-1 relative">
                    {/* 다음 대기 신청 처리 버튼 */}
                    <Button
                        onClick={handleProcessNextPending}
                        className="bg-[#1a78e5] hover:bg-[#156cb2] text-white px-4 py-2 rounded-lg shadow-md"
                        disabled={pendingCount === 0}
                    >
                        {pendingCount > 0
                            ? `다음 대기 신청 처리 (총 ${pendingCount}건)`
                            : '대기 신청 없음'}
                    </Button>
                    {/* 판매자 빠른 검색 버튼 */}
                    <Button
                        onClick={handleQuickSearch}
                        className="bg-[#243347] hover:bg-[#3d4a5c] text-white px-4 py-2 rounded-lg shadow-md"
                    >
                        판매자 빠른 검색
                    </Button>
                </div>
            </div>

            {/* Recent Activities 테이블 섹션 */}
            <div className="pt-5 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-[22px] leading-7 font-bold relative self-stretch">
                    Recent Activities{' '}
                </div>
            </div>
            <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                <div className="bg-[#121a21] rounded-lg border-solid border-[#334a66] border flex flex-row gap-0 items-start justify-start self-stretch shrink-0 relative overflow-hidden">
                    <div className="flex flex-col gap-0 items-start justify-start flex-1 relative">
                        <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                            <div className="bg-[#1a2633] flex flex-row gap-0 items-start justify-start self-stretch flex-1 relative">
                                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 w-[286px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-sm leading-[21px] font-medium relative self-stretch">
                                        User{' '}
                                    </div>
                                </div>
                                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 w-[294px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Medium',_sans-serif] text-sm leading-[21px] font-medium relative self-stretch">
                                        Action{' '}
                                    </div>
                                </div>
                                <div className="pt-3 pr-4 pb-3 pl-4 flex flex-col gap-0 items-start justify-start self-stretch shrink-0 w-[294px] relative">
                                    <div className="text-[#ffffff] text-left font-['Inter-Bold',_sans-serif] text-sm leading-[21px] font-bold relative self-stretch">
                                        Timestamp{' '}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 실제 데이터 연동 */}
                        <div className="flex flex-col gap-0 items-start justify-start self-stretch shrink-0 relative">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity) => (
                                    <div
                                        key={activity.id}
                                        className="border-solid border-[#e5e8eb] border-t flex flex-row gap-0 items-start justify-start self-stretch shrink-0 h-[72px] relative"
                                    >
                                        <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[286px] h-[72px] relative">
                                            <div className="text-[#ffffff] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                                {activity.username} (
                                                {activity.userNickname}){' '}
                                            </div>
                                        </div>
                                        <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                            <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                                {getHistoryTypeLabel(
                                                    activity.type,
                                                )}{' '}
                                            </div>
                                        </div>
                                        <div className="pt-2 pr-4 pb-2 pl-4 flex flex-col gap-0 items-center justify-center shrink-0 w-[294px] h-[72px] relative">
                                            <div className="text-[#94abc7] text-left font-['Inter-Regular',_sans-serif] text-sm leading-[21px] font-normal relative self-stretch">
                                                {formatDate(
                                                    activity.createdAt,
                                                )}{' '}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-400 w-full">
                                    최근 활동 내역이 없습니다.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 다음 대기 신청 처리 모달 --- */}
            {showProcessPendingModal && pendingAppToProcess && (
                <Modal
                    isOpen={showProcessPendingModal}
                    onClose={() => setShowProcessPendingModal(false)}
                    modalClassName="bg-[#1a232f]" // 모달 배경색
                    title="다음 대기 신청 처리"
                >
                    <div className="text-gray-300">
                        {/* 1. 유저 이름 표시 문제 및 8. 글씨 크기 확대 */}
                        <p className="text-xl font-semibold text-white mb-2 text-center">
                            <strong className="text-white">
                                &apos;{pendingAppToProcess.username}&apos;(
                                {pendingAppToProcess.userNickname})
                            </strong>
                            님의 다음 신청을 처리하시겠습니까?
                        </p>

                        {/* 2. 라벨 (재신청 유저, 주의!) - 중앙 정렬, 독립적 위치 */}
                        <div className="flex justify-center items-center gap-2 mb-4">
                            {pendingAppToProcess.isReapplicant ? (
                                <span className="bg-blue-800 bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                    재신청 유저
                                </span>
                            ) : (
                                <span className="bg-gray-600 bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                    신규 유저
                                </span>
                            )}
                            {pendingAppToProcess.hasRevokedHistory && (
                                <span className="bg-red-800 bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                    주의! (과거 강제 해제 이력)
                                </span>
                            )}
                        </div>

                        {/* 10. 신청 정보 항목 테두리 추가 및 3. 담당자 정보 추가, 4. 포맷팅 적용 */}
                        <div className="mb-4 text-gray-200 space-y-1 p-4 border border-gray-600 rounded-lg">
                            <p>
                                <strong>업체명:</strong>{' '}
                                {pendingAppToProcess.companyName}
                            </p>
                            <p>
                                <strong>사업자번호:</strong>{' '}
                                {formatBusinessNumber(
                                    pendingAppToProcess.businessNumber,
                                )}
                            </p>
                            <p>
                                <strong>담당자 이름:</strong>{' '}
                                {pendingAppToProcess.representativeName}
                            </p>
                            <p>
                                <strong>담당자 연락처:</strong>{' '}
                                {formatPhoneNumber(
                                    pendingAppToProcess.representativePhone,
                                )}
                            </p>
                            {pendingAppToProcess.uploadedFileUrl && (
                                <p>
                                    <strong>제출 서류:</strong>{' '}
                                    <a
                                        href={
                                            pendingAppToProcess.uploadedFileUrl
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:underline"
                                    >
                                        보기
                                    </a>
                                </p>
                            )}
                            <p>
                                <strong>신청일:</strong>{' '}
                                {formatDate(pendingAppToProcess.createdAt)}
                            </p>
                        </div>

                        {/* 4. 최근 이력 요약 (표 형태로 개선 및 항목명 변경) */}
                        {/* 2. 최근 이력 요약 테이블 헤더 가운데 정렬 / 5. 상태(사유) 항목 내용 왼쪽 정렬 */}
                        {pendingAppToProcess.userHistorySummary &&
                            pendingAppToProcess.userHistorySummary.length >
                                0 && (
                                <div className="mb-4 border border-gray-600 rounded p-2">
                                    <p className="text-sm font-semibold mb-2 text-white">
                                        최근 이력 요약:
                                    </p>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-xs divide-y divide-gray-700">
                                            <thead>
                                                <tr className="bg-[#243447]">
                                                    <th className="px-2 py-1 text-center text-gray-300">
                                                        상태(사유)
                                                    </th>
                                                    <th className="px-2 py-1 text-center text-gray-300">
                                                        이력 발생 일시
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-700">
                                                {/* 최근 5개만 표시하도록 slice 적용 */}
                                                {pendingAppToProcess.userHistorySummary
                                                    .slice(0, 5)
                                                    .map((history) => (
                                                        <tr key={history.id}>
                                                            <td className="px-2 py-1 text-gray-300 text-left">
                                                                {getHistoryTypeLabel(
                                                                    history.type,
                                                                )}
                                                                {history.reason &&
                                                                    ` (${history.reason})`}
                                                            </td>
                                                            <td className="px-2 py-1 text-gray-300 text-center">
                                                                {formatDate(
                                                                    history.createdAt,
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Button
                                        onClick={() => {
                                            setShowProcessPendingModal(false);
                                            navigate(
                                                `/admin/history?userId=${pendingAppToProcess.userId}`,
                                            );
                                        }}
                                        className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 text-xs mt-2" // 버튼 색상 변경
                                    >
                                        이력 전체 보기 (총{' '}
                                        {
                                            pendingAppToProcess
                                                .userHistorySummary.length
                                        }
                                        건)
                                    </Button>
                                </div>
                            )}

                        <InputField
                            label="반려 사유 (반려 시 필수)"
                            name="processReason"
                            value={processReason}
                            onChange={(e) => {
                                setProcessReason(e.target.value);
                                setProcessFormErrors({});
                            }}
                            placeholder="반려 시 사유를 입력하세요"
                            error={processFormErrors.reason}
                            className="mb-4 text-white"
                        />
                        {processFormErrors.api && (
                            <p className="text-sm text-red-500 mb-4">
                                {processFormErrors.api}
                            </p>
                        )}
                        <div className="flex justify-end space-x-2">
                            <Button
                                onClick={() =>
                                    setShowProcessPendingModal(false)
                                }
                                className="bg-gray-600 hover:bg-gray-700 text-white"
                            >
                                닫기
                            </Button>
                            <Button
                                onClick={() => confirmProcessPending(true)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                                disabled={processModalLoading}
                            >
                                {processModalLoading ? '승인 중...' : '승인'}
                            </Button>
                            <Button
                                onClick={() => confirmProcessPending(false)}
                                className="bg-red-600 hover:bg-red-700 text-white"
                                disabled={
                                    processModalLoading ||
                                    (!processReason.trim() &&
                                        !processFormErrors.reason)
                                }
                            >
                                {processModalLoading ? '반려 중...' : '반려'}
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* --- 판매자 빠른 검색 모달 --- */}
            {showSearchModal && (
                <Modal
                    isOpen={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                    title="판매자 빠른 검색"
                    size="large"
                    modalClassName="bg-[#1a232f]" // 모달 배경색
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <InputField
                                label="검색어 (아이디, 닉네임, 사업자번호 등)"
                                name="searchKeyword"
                                value={searchKeyword}
                                onChange={(e) => {
                                    setSearchKeyword(e.target.value);
                                    setSearchError(null);
                                }}
                                placeholder="검색어를 입력하세요"
                                className="flex-1 text-white"
                            />
                            <Button
                                onClick={executeQuickSearch}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg self-end"
                                disabled={searchModalLoading}
                            >
                                {searchModalLoading ? '검색 중...' : '검색'}
                            </Button>
                        </div>
                        {searchError && (
                            <p className="text-sm text-red-500">
                                {searchError}
                            </p>
                        )}

                        {searchResults.length > 0 && (
                            <div className="mt-4 overflow-x-auto">
                                <h4 className="text-lg font-semibold mb-2 text-white">
                                    검색 결과
                                </h4>
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-[#243447]">
                                        <tr>
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
                                                타입
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                일시
                                            </th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                액션
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                        {searchResults.map((result) => (
                                            <tr key={result.id}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-white">
                                                    {result.userId}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                    {result.username}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                    {result.userNickname}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                    {getHistoryTypeLabel(
                                                        result.type,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                    {formatDate(
                                                        result.createdAt,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                                    <Button
                                                        onClick={() => {
                                                            setShowSearchModal(
                                                                false,
                                                            );
                                                            navigate(
                                                                `/admin/history?userId=${result.userId}`,
                                                            );
                                                        }}
                                                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs"
                                                    >
                                                        이력 보기
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        {!searchModalLoading &&
                            searchResults.length === 0 &&
                            searchKeyword.trim() && (
                                <p className="text-gray-400 text-center mt-4">
                                    검색 결과가 없습니다.
                                </p>
                            )}
                        {searchModalLoading && (
                            <LoadingSpinner message="검색 중..." />
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AdminDashboard;
