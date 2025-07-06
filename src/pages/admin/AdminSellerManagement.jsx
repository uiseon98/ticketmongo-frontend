import React, { useState, useEffect, useCallback } from 'react';
import { adminSellerService } from '../../features/admin/services/adminSellerService';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import Button from '../../shared/components/ui/Button';
import Modal from '../../shared/components/ui/Modal'; // 모달 컴포넌트
import InputField from '../../shared/components/ui/InputField'; // 입력 필드
import { useNavigate } from 'react-router-dom'; // useNavigate 임포트 추가

const AdminSellerManagement = () => {
    const navigate = useNavigate(); // useNavigate 훅 초기화

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
        return (
            <LoadingSpinner message="관리자 페이지 데이터를 불러오는 중..." />
        );
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    // --- 렌더링 ---
    return (
        <div className="p-6 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold mb-6">
                관리자: 현재 판매자 관리
            </h2>

            {/* --- 현재 판매자 목록 (API-04-05) --- */}
            <section className="mb-10 bg-[#1a232f] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                    👥 현재 판매자 목록 ({currentSellers.length}명)
                </h3>
                {currentSellers.length === 0 ? (
                    <p className="text-gray-400">
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
                                                {/* 이력 버튼 클릭 시 이력 페이지로 이동 */}
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
            </section>

            {/* --- 판매자 강제 권한 해제 모달 --- */}
            {showRevokeModal && selectedUser && (
                <Modal
                    isOpen={showRevokeModal}
                    onClose={() => setShowRevokeModal(false)}
                    title="판매자 권한 강제 해제"
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
                        className="mb-4"
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
