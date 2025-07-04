// src/pages/admin/ApplicationHistoryPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { adminSellerService } from '../../features/admin/services/adminSellerService';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import Button from '../../shared/components/ui/Button';
import Modal from '../../shared/components/ui/Modal';
import InputField from '../../shared/components/ui/InputField';

// 판매자 승인 이력 타입 (백엔드 SellerApprovalHistory.ActionType과 일치)
const SELLER_HISTORY_TYPES = [
    'ALL', // 전체 (프론트엔드에서 추가)
    'SUBMITTED', // 신청됨
    'REQUEST', // (기존 명칭으로, SUBMITTED와 동일)
    'APPROVED', // 승인됨
    'REJECTED', // 반려됨
    'WITHDRAWN', // 자발적 철회됨
    'REVOKED', // 강제 해제됨
];

// 상태 한글명 매핑
const STATUS_LABELS = {
    ALL: '전체',
    SUBMITTED: '신청됨',
    REQUEST: '신청됨', // REQUEST도 신청됨으로 표시
    PENDING: '처리 대기', // 백엔드 DTO에 PENDING이 있지만, 주로 SUBMITTED를 사용
    APPROVED: '승인됨',
    REJECTED: '반려됨',
    WITHDRAWN: '자발적 철회',
    REVOKED: '강제 해제',
};

const ApplicationHistoryPage = () => {
    // --- 상태 관리 ---
    const [allHistory, setAllHistory] = useState([]); // 전체 이력 목록 (API-04-06)
    const [loading, setLoading] = useState(true); // 페이지 로딩
    const [error, setError] = useState(null); // 페이지 에러

    // 페이징 및 필터링 상태 (전체 이력 조회용)
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0); // totalElements 사용
    const [pageSize, setPageSize] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL'); // 기본값 'ALL'

    // 모달 관련 상태
    const [showHistoryModal, setShowHistoryModal] = useState(false); // 특정 유저 이력 모달
    const [selectedUser, setSelectedUser] = useState(null); // 모달에 표시할 유저 정보
    const [userHistory, setUserHistory] = useState([]); // 특정 유저의 이력

    // --- 데이터 페칭 함수 ---
    const fetchAllSellerHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {
                page: currentPage,
                size: pageSize,
                typeFilter: typeFilter === 'ALL' ? undefined : typeFilter,
                keyword: searchKeyword || undefined,
                sort: 'createdAt,desc',
            };
            const response =
                await adminSellerService.getAllSellerApprovalHistory(params);
            setAllHistory(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements); // totalElements 설정
            setCurrentPage(response.number);
            setPageSize(response.size);
        } catch (err) {
            setError(
                err.message || '전체 판매자 이력 목록을 불러오지 못했습니다.',
            );
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchKeyword, typeFilter]);

    // --- 초기 로드 효과 및 페이징/검색/필터 변경 시 재로드 ---
    useEffect(() => {
        fetchAllSellerHistory();
    }, [
        currentPage,
        pageSize,
        searchKeyword,
        typeFilter,
        fetchAllSellerHistory,
    ]);

    // --- 이벤트 핸들러: 특정 유저 이력 상세 조회 ---
    const handleViewUserHistory = async (user) => {
        setSelectedUser(user);
        setLoading(true); // 이력 모달 로딩
        setError(null);
        try {
            const history =
                await adminSellerService.getSellerApprovalHistoryForUser(
                    user.userId,
                );
            setUserHistory(history);
            setShowHistoryModal(true);
        } catch (err) {
            setError(err.message || '유저 이력을 불러오지 못했습니다.');
        } finally {
            setLoading(false); // 이력 모달 로딩 종료
        }
    };

    // --- 페이징 및 검색/필터 핸들러 ---
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const handlePageSizeChange = (e) => {
        setPageSize(Number(e.target.value));
        setCurrentPage(0);
    };

    const handleKeywordChange = (e) => {
        setSearchKeyword(e.target.value);
        setCurrentPage(0);
    };

    const handleTypeFilterChange = (e) => {
        setTypeFilter(e.target.value);
        setCurrentPage(0);
    };

    // --- 로딩 및 에러 처리 UI ---
    if (loading) {
        return <LoadingSpinner message="판매자 이력 데이터를 불러오는 중..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="p-6 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold mb-6">판매자 권한 이력 조회</h2>

            {/* --- 전체 판매자 이력 목록 (API-04-06) --- */}
            <section className="bg-[#1a232f] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                    📜 전체 판매자 권한 이력 (총 {totalElements}건)
                </h3>

                {/* 필터 및 검색 */}
                <div className="flex flex-wrap gap-4 mb-4">
                    <InputField
                        label="검색 (유저 ID, 닉네임 등)"
                        name="searchKeyword"
                        value={searchKeyword}
                        onChange={handleKeywordChange}
                        placeholder="검색어를 입력하세요"
                        className="flex-1 min-w-[200px]"
                    />
                    <div className="flex-1 min-w-[150px]">
                        <label
                            htmlFor="typeFilter"
                            className="block text-sm font-medium text-gray-300 mb-2"
                        >
                            이력 타입 필터
                        </label>
                        <select
                            id="typeFilter"
                            value={typeFilter}
                            onChange={handleTypeFilterChange}
                            className="w-full p-3 bg-[#0A0D11] border border-[#243447] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                        >
                            {SELLER_HISTORY_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {STATUS_LABELS[type] || type}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {allHistory.length === 0 ? (
                    <p className="text-gray-400">표시할 이력이 없습니다.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-[#243447]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        이력 ID
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
                                        타입
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        사유
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        일시
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        작업
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                {allHistory.map((history) => (
                                    <tr key={history.id}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                            {history.id}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {history.userId}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {history.username}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {history.userNickname}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {STATUS_LABELS[history.type] ||
                                                history.type}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {history.reason || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {new Date(
                                                history.createdAt,
                                            ).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                            <Button
                                                onClick={() =>
                                                    handleViewUserHistory(
                                                        history,
                                                    )
                                                }
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                                            >
                                                상세
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {/* 페이지네이션 */}
                        <div className="flex justify-center items-center space-x-2 mt-4">
                            <Button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 0}
                                className="px-3 py-1 text-xs"
                            >
                                이전
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <Button
                                    key={i}
                                    onClick={() => handlePageChange(i)}
                                    className={`px-3 py-1 text-xs ${currentPage === i ? 'bg-blue-500' : 'bg-gray-700'}`}
                                >
                                    {i + 1}
                                </Button>
                            ))}
                            <Button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage >= totalPages - 1}
                                className="px-3 py-1 text-xs"
                            >
                                다음
                            </Button>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="p-1 text-xs bg-[#0A0D11] border border-[#243447] rounded-lg text-white"
                            >
                                <option value={5}>5개</option>
                                <option value={10}>10개</option>
                                <option value={20}>20개</option>
                            </select>
                        </div>
                    </div>
                )}
            </section>

            {/* --- 특정 유저 이력 상세 모달 (API-04-04) --- */}
            {showHistoryModal && selectedUser && (
                <Modal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    title={`'${selectedUser.username}'(${selectedUser.userNickname}) 님의 권한 이력`}
                    size="large"
                >
                    {userHistory.length === 0 ? (
                        <p className="text-gray-400">
                            해당 유저의 이력이 없습니다.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-[#243447]">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            이력 ID
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            타입
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            사유
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                            일시
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                    {userHistory.map((history) => (
                                        <tr key={history.id}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                                {history.id}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                {STATUS_LABELS[history.type] ||
                                                    history.type}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                {history.reason || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                                                {new Date(
                                                    history.createdAt,
                                                ).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Modal>
            )}
        </div>
    );
};

export default ApplicationHistoryPage;
