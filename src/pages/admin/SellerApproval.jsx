// src/pages/admin/SellerApproval.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { adminSellerService } from '../../features/admin/services/adminSellerService';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import Button from '../../shared/components/ui/Button';
import Modal from '../../shared/components/ui/Modal';
import InputField from '../../shared/components/ui/InputField';

// 상태 한글명 매핑 (AdminSellerManagement.jsx에서 가져옴)
const STATUS_LABELS = {
    ALL: '전체',
    SUBMITTED: '신청됨',
    REQUEST: '신청됨', // REQUEST도 신청됨으로 표시
    APPROVED: '승인됨',
    REJECTED: '반려됨',
    WITHDRAWN: '자발적 철회',
    REVOKED: '강제 해제',
};

const SellerApproval = () => {
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
            // 여기서는 SellerApproval 페이지에만 집중하므로 다른 목록은 새로고침하지 않습니다.
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    `판매자 신청 ${selectedUser.approveAction ? '승인' : '반려'} 실패.`,
            );
        } finally {
            setLoading(false); // API 호출 완료 시 로딩 종료
        }
    };

    // --- 로딩 및 에러 처리 UI ---
    if (loading) {
        return <LoadingSpinner message="판매자 신청 목록을 불러오는 중..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="p-6 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold mb-6">
                판매자 신청 승인/반려 관리
            </h2>

            {/* --- 대기 중인 판매자 신청 목록 (API-04-01) --- */}
            <section className="mb-10 bg-[#1a232f] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                    🔔 대기 중인 판매자 신청 ({pendingApplications.length}건)
                </h3>
                {pendingApplications.length === 0 ? (
                    <p className="text-gray-400">
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
                                                    href={app.uploadedFileUrl}
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
                                            {new Date(
                                                app.createdAt,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex space-x-2">
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
                                                {/* SellerApproval 에서는 이력 버튼은 제거합니다. */}
                                                {/* <Button
                                                    onClick={() =>
                                                        handleViewUserHistory(
                                                            app,
                                                        )
                                                    }
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                                                >
                                                    이력
                                                </Button> */}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

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
                >
                    <p className="mb-4 text-gray-300">
                        {/* ESLint 오류 수정: 작은따옴표 이스케이프 */}
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
                            className="mb-4"
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
                            onClick={confirmProcessApplication}
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
