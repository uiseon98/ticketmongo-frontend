import React, { useState, useEffect, useCallback } from 'react';
import { adminSellerService } from '../../features/admin/services/adminSellerService';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import Button from '../../shared/components/ui/Button';
import Modal from '../../shared/components/ui/Modal';
import InputField from '../../shared/components/ui/InputField';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

// 판매자 승인 이력 타입 (백엔드 SellerApprovalHistory.ActionType과 일치)
const SELLER_HISTORY_TYPES = [
    'ALL', // 전체 (프론트엔드에서 추가)
    'REQUEST', // (기존 명칭으로, SUBMITTED와 동일)
    'APPROVED', // 승인됨
    'REJECTED', // 반려됨
    'WITHDRAWN', // 자발적 철회됨
    'REVOKED', // 강제 해제됨
];

// 상태 한글명 매핑
const STATUS_LABELS = {
    ALL: '전체',
    REQUEST: '신청 대기 중',
    APPROVED: '승인됨',
    REJECTED: '반려됨',
    WITHDRAWN: '자발적 철회',
    REVOKED: '강제 해제',
};

const ApplicationHistoryPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const userIdFromUrl = searchParams.get('userId');
    const userNicknameFromUrl = searchParams.get('userNickname');
    const urlKeyword = searchParams.get('keyword');

    const initialSearchKeyword = userNicknameFromUrl
        ? userNicknameFromUrl
        : userIdFromUrl
          ? userIdFromUrl
          : urlKeyword || '';

    const [allHistory, setAllHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [searchKeyword, setSearchKeyword] = useState(initialSearchKeyword);
    const [typeFilter, setTypeFilter] = useState('ALL');

    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userHistory, setUserHistory] = useState([]);

    const navigate = useNavigate();
    const [sellerRequestList, setSellerRequestList] = useState([]);

    const fetchAllSellerHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let response;
            if (userIdFromUrl && searchKeyword === userIdFromUrl) {
                const historyList =
                    await adminSellerService.getSellerApprovalHistoryForUser(
                        userIdFromUrl,
                    );

                const calculatedTotalPages = Math.max(
                    1,
                    Math.ceil(historyList.length / pageSize),
                );
                const calculatedCurrentPage = Math.min(
                    currentPage,
                    calculatedTotalPages - 1,
                );

                response = {
                    content: historyList.slice(
                        calculatedCurrentPage * pageSize,
                        (calculatedCurrentPage + 1) * pageSize,
                    ),
                    totalElements: historyList.length,
                    totalPages: calculatedTotalPages,
                    number: calculatedCurrentPage,
                    size: pageSize,
                    first: calculatedCurrentPage === 0,
                    last: calculatedCurrentPage === calculatedTotalPages - 1,
                };
            } else {
                const params = {
                    page: currentPage,
                    size: pageSize,
                    typeFilter: typeFilter === 'ALL' ? undefined : typeFilter,
                    keyword: searchKeyword || undefined,
                    sort: 'createdAt,desc',
                };
                response =
                    await adminSellerService.getAllSellerApprovalHistory(
                        params,
                    );
            }

            setAllHistory(response.content);
            setTotalPages(response.totalPages);
            setTotalElements(response.totalElements);
            setCurrentPage(response.number);
            setPageSize(response.size);
        } catch (err) {
            setError(err.message || '판매자 이력 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, searchKeyword, typeFilter, userIdFromUrl]);

    useEffect(() => {
        const currentUrlUserId = searchParams.get('userId');
        const currentUrlKeyword = searchParams.get('keyword');
        const currentUrlNickname = searchParams.get('userNickname');

        const newSearchValFromUrl = currentUrlNickname
            ? currentUrlNickname
            : currentUrlUserId
              ? currentUrlUserId
              : currentUrlKeyword || '';

        if (searchKeyword !== newSearchValFromUrl) {
            setSearchKeyword(newSearchValFromUrl);
            setCurrentPage(0);
        } else {
            fetchAllSellerHistory();
        }

        const fetchSellerRequests = async () => {
            try {
                const response =
                    await adminSellerService.getAllSellerApplications();
                setSellerRequestList(response.content);
            } catch (err) {
                console.error(
                    '판매자 신청서 데이터를 불러오는 데 실패했습니다:',
                    err,
                );
            }
        };

        fetchSellerRequests();
    }, [
        currentPage,
        pageSize,
        searchKeyword,
        typeFilter,
        fetchAllSellerHistory,
        searchParams,
        userIdFromUrl,
        userNicknameFromUrl,
        urlKeyword,
    ]);

    const handleViewUserHistory = async (user) => {
        setSelectedUser(user);
        setLoading(true);
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
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('page', newPage.toString());
        setSearchParams(newSearchParams);
    };

    const handlePageSizeChange = (e) => {
        const newSize = Number(e.target.value);
        setPageSize(newSize);
        setCurrentPage(0);
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('size', newSize.toString());
        newSearchParams.set('page', '0');
        setSearchParams(newSearchParams);
    };

    const handleKeywordChange = (e) => {
        const newKeyword = e.target.value;
        setSearchKeyword(newKeyword);
        setCurrentPage(0);
        const newSearchParams = new URLSearchParams(searchParams);
        if (newKeyword.trim()) {
            newSearchParams.set('keyword', newKeyword.trim());
            newSearchParams.delete('userId');
            newSearchParams.delete('userNickname');
        } else {
            newSearchParams.delete('keyword');
        }
        newSearchParams.set('page', '0');
        setSearchParams(newSearchParams);
    };

    const handleClearSearch = useCallback(() => {
        setSearchKeyword('');
        setCurrentPage(0);
        const newSearchParams = new URLSearchParams();
        newSearchParams.set('page', '0');
        newSearchParams.set('size', pageSize.toString());
        newSearchParams.set('typeFilter', typeFilter);
        setSearchParams(newSearchParams);
    }, [pageSize, setSearchParams, typeFilter]);

    const handleTypeFilterChange = (e) => {
        const newTypeFilter = e.target.value;
        setTypeFilter(newTypeFilter);
        setCurrentPage(0);
        const newSearchParams = new URLSearchParams(searchParams);
        if (newTypeFilter !== 'ALL') {
            newSearchParams.set('typeFilter', newTypeFilter);
        } else {
            newSearchParams.delete('typeFilter');
        }
        newSearchParams.set('page', '0');
        setSearchParams(newSearchParams);
    };

    // --- 페이지네이션 UI를 위한 헬퍼 함수 ---
    const getVisiblePageNumbers = useCallback(() => {
        const visiblePages = [];
        const maxPageNumbersToShow = 5; // 항상 5개의 페이지 번호를 보여줍니다.
        const half = Math.floor(maxPageNumbersToShow / 2); // 현재 페이지 좌우로 표시될 개수 (2개)

        let startPage, endPage;

        if (totalPages <= maxPageNumbersToShow) {
            // 전체 페이지 수가 5개 이하면 모든 페이지를 보여줍니다.
            startPage = 0;
            endPage = totalPages - 1;
        } else {
            // 현재 페이지를 기준으로 5개의 페이지 번호를 계산합니다.
            startPage = Math.max(0, currentPage - half);
            endPage = Math.min(totalPages - 1, currentPage + half);

            // 범위가 총 5개가 안 될 경우 조정합니다.
            if (endPage - startPage + 1 < maxPageNumbersToShow) {
                if (startPage === 0) {
                    endPage = maxPageNumbersToShow - 1;
                } else if (endPage === totalPages - 1) {
                    startPage = totalPages - maxPageNumbersToShow;
                }
            }
        }

        // '...' 추가 로직
        // 시작 부분 '...'
        if (startPage > 0) {
            visiblePages.push('...');
        }

        // 중앙 페이지 번호들 추가
        for (let i = startPage; i <= endPage; i++) {
            visiblePages.push(i);
        }

        // 끝 부분 '...'
        if (endPage < totalPages - 1) {
            visiblePages.push('...');
        }

        return visiblePages;
    }, [currentPage, totalPages]);

    // --- 동적 제목 생성 ---
    const getDynamicTitle = useCallback(() => {
        if (userIdFromUrl && searchKeyword === userIdFromUrl) {
            if (userNicknameFromUrl) {
                return `${userNicknameFromUrl} 님의 판매자 권한 이력 (총 ${totalElements}건)`;
            }
            return `ID: ${userIdFromUrl} 님의 판매자 권한 이력 (총 ${totalElements}건)`;
        }

        if (searchKeyword.trim()) {
            let prefix = '';
            if (userNicknameFromUrl && searchKeyword === userNicknameFromUrl) {
                prefix = `${userNicknameFromUrl} 님의`;
            } else if (!isNaN(searchKeyword) && searchKeyword.length > 0) {
                prefix = `ID: ${searchKeyword} 님의`;
            } else if (
                searchKeyword.includes('회사') ||
                searchKeyword.includes('기업') ||
                searchKeyword.includes('(주)')
            ) {
                prefix = `업체명: ${searchKeyword} 의`;
            } else {
                prefix = `${searchKeyword} 님의`;
            }
            return `${prefix} 판매자 권한 이력 (총 ${totalElements}건)`;
        }
        return `📜 전체 판매자 권한 이력 (총 ${totalElements}건)`;
    }, [userIdFromUrl, userNicknameFromUrl, searchKeyword, totalElements]);

    if (loading) {
        return <LoadingSpinner message="판매자 이력 데이터를 불러오는 중..." />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="pt-12 px-8 pb-8 bg-[#111922] text-white min-h-[calc(100vh-64px)]">
            <h2 className="text-3xl font-bold mb-8">판매자 권한 이력 조회</h2>

            <section className="bg-[#1a232f] p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-10">
                    {getDynamicTitle()}
                </h3>

                {/* 🔧 상단 컨트롤 바 (pageSize 왼쪽 정렬, 검색창 & 필터 오른쪽 정렬) */}
                <div className="flex justify-between items-center gap-4 mb-3 flex-wrap">
                    {/* 왼쪽: 표시 개수 선택 */}
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                        <span>표시</span>
                        <select
                            id="pageSize"
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            className="px-2 py-1.5 bg-[#0A0D11] border border-[#243447] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                        >
                            <option value={5}>5개</option>
                            <option value={10}>10개</option>
                            <option value={20}>20개</option>
                        </select>
                    </div>

                    {/* 오른쪽: 검색창 + 이력 타입 필터 */}
                    <div className="flex flex-wrap gap-3 items-center justify-end">
                        {/* 검색창 */}
                        <div className="min-w-[300px]">
                            <InputField
                                name="searchKeyword"
                                value={searchKeyword}
                                onChange={handleKeywordChange}
                                placeholder="유저 ID, 닉네임, 업체명 등"
                                clearable={true}
                                onClear={handleClearSearch}
                                paddingClassName="py-1 px-2"
                            />
                        </div>

                        {/* 이력 타입 필터 */}
                        <div className="w-[140px]">
                            <select
                                id="typeFilter"
                                value={typeFilter}
                                onChange={handleTypeFilterChange}
                                className="w-full px-2 py-1.5 bg-[#0A0D11] border border-[#243447] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
                            >
                                {SELLER_HISTORY_TYPES.map((type) => (
                                    <option key={type} value={type}>
                                        {STATUS_LABELS[type] || type}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {allHistory.length === 0 ? (
                    <p className="text-gray-400">표시할 이력이 없습니다.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-[#243447]">
                                <tr>
                                    <th className="px-2 py-2 w-16 text-center text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[40px]">
                                        이력
                                        <br />
                                        ID
                                    </th>
                                    <th className="px-2 py-2 w-16 text-center text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[40px]">
                                        유저
                                        <br />
                                        ID
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        닉네임 (아이디)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        상태(사유)
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        일시
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                        상세보기
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                {allHistory.map((history) => (
                                    <tr key={history.id}>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-white">
                                            {history.id}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-300">
                                            {history.userId}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-left">
                                            {history.userNickname}
                                            <br />({history.username})
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-left text-gray-300">
                                            {history.type === 'REJECTED' ||
                                            history.type === 'REVOKED'
                                                ? `${STATUS_LABELS[history.type]} (${history.reason || '사유 없음'})`
                                                : STATUS_LABELS[history.type] ||
                                                  history.type}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300 text-left">
                                            {new Date(
                                                history.createdAt,
                                            ).toLocaleDateString()}{' '}
                                            <br />(
                                            {new Date(
                                                history.createdAt,
                                            ).toLocaleTimeString()}
                                            )
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
                            {/* 처음으로 버튼 */}
                            {totalPages > 0 && (
                                <Button
                                    onClick={() => handlePageChange(0)}
                                    disabled={currentPage === 0}
                                    className="px-3 py-1 text-xs bg-transparent hover:bg-[#243447] text-white border border-transparent"
                                >
                                    처음으로
                                </Button>
                            )}
                            {/* 이전 버튼 (개별) */}
                            <Button
                                onClick={() =>
                                    handlePageChange(currentPage - 1)
                                }
                                disabled={currentPage === 0}
                                className="px-3 py-1 text-xs bg-transparent hover:bg-[#243447] text-white border border-transparent"
                            >
                                이전
                            </Button>
                            {/* 동적으로 페이지 번호 생성 */}
                            {getVisiblePageNumbers().map((pageNum, index) =>
                                pageNum === '...' ? (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="px-3 py-1 text-xs text-gray-400"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <Button
                                        key={pageNum}
                                        onClick={() =>
                                            handlePageChange(pageNum)
                                        }
                                        className={`px-3 py-1 text-xs ${
                                            currentPage === pageNum
                                                ? 'bg-[#6366F1] text-white rounded-lg'
                                                : 'bg-transparent text-gray-300 hover:bg-[#243447]'
                                        } border-none`}
                                    >
                                        {pageNum + 1}
                                    </Button>
                                ),
                            )}
                            {/* 다음 버튼 (개별) */}
                            <Button
                                onClick={() =>
                                    handlePageChange(currentPage + 1)
                                }
                                disabled={currentPage >= totalPages - 1}
                                className="px-3 py-1 text-xs bg-transparent hover:bg-[#243447] text-white border border-transparent"
                            >
                                다음
                            </Button>
                            {/* 마지막으로 버튼 */}
                            {totalPages > 0 && (
                                <Button
                                    onClick={() =>
                                        handlePageChange(totalPages - 1)
                                    }
                                    disabled={currentPage === totalPages - 1}
                                    className="px-3 py-1 text-xs bg-transparent hover:bg-[#243447] text-white border border-transparent"
                                >
                                    마지막으로
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {showHistoryModal && selectedUser && (
                <Modal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    title={`'${selectedUser.username}' (${selectedUser.userNickname}) 님의 이력 상세`}
                    size="large"
                    modalClassName="bg-[#1a232f]"
                >
                    {/* ✅ 1. 신청서 상세 정보 */}
                    <div className="mb-6">
                        <h3 className="text-white font-semibold mb-2">
                            신청서 상세 정보
                        </h3>

                        {(() => {
                            const application = selectedUser?.applicationId
                                ? sellerRequestList.find(
                                      (r) =>
                                          r.id === selectedUser.applicationId,
                                  )
                                : null;

                            // 🛠 포맷팅 유틸
                            const formatBusinessNumber = (num) => {
                                return (
                                    num?.replace(
                                        /(\d{3})(\d{2})(\d{5})/,
                                        '$1-$2-$3',
                                    ) || '-'
                                );
                            };

                            const formatPhoneNumber = (phone) => {
                                return (
                                    phone?.replace(
                                        /(\d{2,3})(\d{3,4})(\d{4})/,
                                        '$1-$2-$3',
                                    ) || '-'
                                );
                            };

                            const formatDate = (dateStr) => {
                                return new Date(dateStr).toLocaleString();
                            };

                            return application ? (
                                <div className="text-gray-300 text-sm space-y-1 border border-gray-600 rounded p-4 bg-[#1a232f]">
                                    <p>
                                        <strong>신청서 ID:</strong>{' '}
                                        {application.id}
                                    </p>
                                    <p>
                                        <strong>사업자명:</strong>{' '}
                                        {application.businessName}
                                    </p>
                                    <p>
                                        <strong>대표자명:</strong>{' '}
                                        {application.ceoName}
                                    </p>
                                    <p>
                                        <strong>사업자번호:</strong>{' '}
                                        {formatBusinessNumber(
                                            application.businessNumber,
                                        )}
                                    </p>
                                    <p>
                                        <strong>연락처:</strong>{' '}
                                        {formatPhoneNumber(
                                            application.phoneNumber,
                                        )}
                                    </p>
                                    <p>
                                        <strong>사업장 주소:</strong>{' '}
                                        {application.businessAddress}
                                    </p>
                                    <p>
                                        <strong>신청 일시:</strong>{' '}
                                        {formatDate(application.createdAt)}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-gray-400">
                                    신청서 정보를 찾을 수 없습니다.
                                </p>
                            );
                        })()}
                    </div>

                    {/* ✅ 2. 최근 이력 5건 */}
                    <div className="overflow-x-auto mb-4">
                        <h4 className="text-white font-semibold mb-2">
                            최근 이력 5건
                        </h4>
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-[#243447]">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">
                                        이력 ID
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">
                                        상태
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">
                                        사유
                                    </th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300">
                                        일시
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                {userHistory.slice(0, 5).map((h) => (
                                    <tr
                                        key={h.id}
                                        className="cursor-pointer hover:bg-gray-800"
                                        onClick={() => setSelectedUser(h)}
                                    >
                                        <td className="px-4 py-3 text-sm text-white">
                                            {h.id}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            {STATUS_LABELS[h.type] || h.type}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            {h.reason || 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-300">
                                            {new Date(
                                                h.createdAt,
                                            ).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ 3. 전체 이력 보기 버튼 */}
                    <div className="mt-4 text-right">
                        <button
                            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => {
                                navigate(
                                    `/admin/applications?userId=${selectedUser.userId}`,
                                );
                                setShowHistoryModal(false);
                            }}
                        >
                            전체 이력 보기 →
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ApplicationHistoryPage;
