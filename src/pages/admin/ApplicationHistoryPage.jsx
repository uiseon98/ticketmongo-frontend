import React, { useState, useEffect, useCallback } from 'react';
import { adminSellerService } from '../../features/admin/services/adminSellerService';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';
import Button from '../../shared/components/ui/Button';
import Modal from '../../shared/components/ui/Modal';
import InputField from '../../shared/components/ui/InputField';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
// import useDebounce from '../../shared/hooks/useDebounce'; // 임시로 주석 처리

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

// 판매자 승인 이력 타입 (백엔드 SellerApprovalHistory.ActionType과 일치)
const SELLER_HISTORY_TYPES = [
    'ALL', // 전체 (프론트엔드에서 추가)
    'REQUEST', // 신청 대기 중
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
    const navigate = useNavigate(); // useNavigate 훅 사용

    const { isMobile, isTablet } = useResponsive(); // 반응형 훅 사용

    const userIdFromUrl = searchParams.get('userId');
    const userNicknameFromUrl = searchParams.get('userNickname');
    const urlKeyword = searchParams.get('keyword');

    // initialSearchKeyword는 컴포넌트 마운트 시 한 번만 계산
    // 이후 InputField의 값은 searchTerm 상태가 관리
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

    // 검색어 상태: searchTerm만 유지하고, debouncedSearchKeyword는 제거
    const [searchTerm, setSearchTerm] = useState(initialSearchKeyword);
    // const debouncedSearchKeyword = useDebounce(searchTerm, 500); // 0.5초 디바운스

    const [typeFilter, setTypeFilter] = useState('ALL');

    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedUserHistory, setSelectedUserHistory] = useState(null); // 모달에 표시할 선택된 이력 항목
    const [detailedApplication, setDetailedApplication] = useState(null); // 추가: 상세 조회된 판매자 신청 정보

    // 검색을 실제로 트리거할 키워드 (엔터 키 누르거나 필터 변경 시 업데이트)
    const [currentSearchKeyword, setCurrentSearchKeyword] =
        useState(initialSearchKeyword);

    const fetchAllSellerHistory = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let responseContent; // API 응답의 content 부분
            let totalElementsCount;
            let totalPagesCount;

            if (userIdFromUrl && currentSearchKeyword === userIdFromUrl) {
                // 특정 유저의 이력을 가져옴 (typeFilter가 백엔드에 전달되지 않음)
                const historyList =
                    await adminSellerService.getSellerApprovalHistoryForUser(
                        userIdFromUrl,
                    );

                // 프론트엔드에서 typeFilter를 적용
                let filteredList = historyList;
                if (typeFilter !== 'ALL') {
                    filteredList = historyList.filter(
                        (item) => item.type === typeFilter,
                    );
                }

                // 필터링된 목록을 기반으로 페이지네이션 다시 계산
                totalElementsCount = filteredList.length;
                totalPagesCount = Math.max(
                    1,
                    Math.ceil(filteredList.length / pageSize),
                );
                const calculatedCurrentPage = Math.min(
                    currentPage,
                    totalPagesCount - 1,
                );

                responseContent = filteredList.slice(
                    calculatedCurrentPage * pageSize,
                    (calculatedCurrentPage + 1) * pageSize,
                );

                setCurrentPage(calculatedCurrentPage); // 페이지를 다시 설정하여 UI와 동기화
            } else {
                // 일반 검색 및 필터링
                const params = {
                    page: currentPage,
                    size: pageSize,
                    typeFilter: typeFilter === 'ALL' ? undefined : typeFilter,
                    keyword: currentSearchKeyword || undefined,
                    sort: 'createdAt,desc',
                };
                const response =
                    await adminSellerService.getAllSellerApprovalHistory(
                        params,
                    );
                responseContent = response.content;
                totalElementsCount = response.totalElements;
                totalPagesCount = response.totalPages;
                setCurrentPage(response.number); // 백엔드에서 받은 현재 페이지 사용
            }

            setAllHistory(responseContent);
            setTotalPages(totalPagesCount);
            setTotalElements(totalElementsCount);
            setPageSize(pageSize); // pageSize는 항상 동일하게 유지 (사용자 선택에 따름)
        } catch (err) {
            setError(err.message || '판매자 이력 목록을 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, [
        currentPage,
        pageSize,
        currentSearchKeyword,
        typeFilter,
        userIdFromUrl,
    ]);

    // URL 파라미터에서 키워드 변경 시 searchTerm을 업데이트하는 useEffect (초기 로드 및 URL 변경에만 반응)
    useEffect(() => {
        const currentUrlUserId = searchParams.get('userId');
        const currentUrlKeyword = searchParams.get('keyword');
        const currentUrlNickname = searchParams.get('userNickname');

        const newSearchValFromUrl = currentUrlNickname
            ? currentUrlNickname
            : currentUrlUserId
              ? currentUrlUserId
              : currentUrlKeyword || '';

        if (searchTerm !== newSearchValFromUrl) {
            setSearchTerm(newSearchValFromUrl);
            setCurrentSearchKeyword(newSearchValFromUrl); // URL 변경 시 즉시 currentSearchKeyword도 업데이트
            setCurrentPage(0); // URL 키워드가 변경되면 페이지도 초기화
        }
    }, [searchParams, urlKeyword, userIdFromUrl, userNicknameFromUrl]); // searchTerm은 의존성에서 제거

    // currentSearchKeyword, 페이지, 필터가 변경될 때 데이터를 가져오도록 useEffect 수정
    useEffect(() => {
        fetchAllSellerHistory();
    }, [
        currentSearchKeyword, // debouncedSearchKeyword 대신 currentSearchKeyword 의존
        currentPage,
        pageSize,
        typeFilter,
        fetchAllSellerHistory,
    ]);

    // handleViewUserHistory 함수 수정: 신청서 상세 정보 추가 조회
    const handleViewUserHistory = async (historyItem) => {
        setSelectedUserHistory(historyItem);
        setDetailedApplication(null);

        if (historyItem.sellerApplicationId) {
            setLoading(true);
            try {
                const appDetail =
                    await adminSellerService.getSellerApplicationDetail(
                        historyItem.sellerApplicationId,
                    );
                setDetailedApplication(appDetail);
            } catch (err) {
                setError(
                    err.message || '신청서 상세 정보를 불러오지 못했습니다.',
                );
                setDetailedApplication(null);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
        setShowHistoryModal(true);
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

    // 검색어 입력 핸들러: searchTerm만 업데이트
    const handleKeywordChange = (e) => {
        const newKeyword = e.target.value;
        setSearchTerm(newKeyword);
    };

    // 엔터 키 입력 시 검색 실행 핸들러 수정
    const handleSearchOnEnter = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const newSearchParams = new URLSearchParams();
            newSearchParams.set('page', '0');
            newSearchParams.set('size', pageSize.toString());
            if (typeFilter !== 'ALL') {
                newSearchParams.set('typeFilter', typeFilter);
            }

            // 검색어가 숫자인지 확인하여 userId로 처리할지 keyword로 처리할지 결정
            const numericValue = Number(searchTerm);
            if (
                searchTerm &&
                !isNaN(searchTerm) &&
                numericValue > 0 &&
                numericValue <= Number.MAX_SAFE_INTEGER
            ) {
                // 숫자로만 이루어진 검색어이고 0보다 큰 경우 userId로 간주
                newSearchParams.set('userId', searchTerm);
                // 기존 keyword 파라미터는 제거 (혹시 남아있을 경우)
                newSearchParams.delete('keyword');
            } else if (searchTerm) {
                // 숫자가 아니거나 0인 경우 일반 keyword로 간주
                newSearchParams.set('keyword', searchTerm);
                // 기존 userId 파라미터는 제거 (혹시 남아있을 경우)
                newSearchParams.delete('userId');
            } else {
                // 검색어가 비어있을 경우 keyword와 userId 모두 제거
                newSearchParams.delete('keyword');
                newSearchParams.delete('userId');
            }

            // URL을 변경하여 useEffect가 트리거되도록 함
            // navigate를 사용하여 URL 변경 시 전체 컴포넌트 라이프사이클을 다시 시작하지 않고
            // searchParams만 변경되도록 유도 (setSearchParams와 유사)
            // 하지만 searchParams를 직접 변경하는 것이 더 일관적임.
            setSearchParams(newSearchParams);

            // currentSearchKeyword와 currentPage를 직접 업데이트하여 즉시 fetchAllSellerHistory 호출을 유도
            // (setSearchParams가 변경되면 useEffect가 반응하므로 이 부분은 선택적)
            setCurrentSearchKeyword(searchTerm);
            setCurrentPage(0);
        }
    };

    const handleClearSearch = useCallback(() => {
        setSearchTerm('');
        setCurrentSearchKeyword(''); // 검색어 초기화 시 실제 검색 키워드도 초기화
        setCurrentPage(0);
        const newSearchParams = new URLSearchParams();
        newSearchParams.set('page', '0');
        newSearchParams.set('size', pageSize.toString());
        newSearchParams.set('typeFilter', typeFilter);
        newSearchParams.delete('keyword');
        newSearchParams.delete('userId'); // userId 파라미터도 제거
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
        const maxPageNumbersToShow = 5; // 항상 5개의 페이지 번호를 보여줌
        const half = Math.floor(maxPageNumbersToShow / 2); // 현재 페이지 좌우로 표시될 개수 (2개)

        let startPage, endPage;

        if (totalPages <= maxPageNumbersToShow) {
            // 전체 페이지 수가 5개 이하면 모든 페이지를 보여줌
            startPage = 0;
            endPage = totalPages - 1;
        } else {
            // 현재 페이지를 기준으로 5개의 페이지 번호를 계산
            startPage = Math.max(0, currentPage - half);
            endPage = Math.min(totalPages - 1, currentPage + half);

            // 범위가 총 5개가 안 될 경우 조정
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
            if (endPage < totalPages - 2) {
                visiblePages.push('...');
            }
        }

        return visiblePages;
    }, [currentPage, totalPages]);

    // --- 동적 제목 생성 ---
    const getDynamicTitle = useCallback(() => {
        if (userIdFromUrl && currentSearchKeyword === userIdFromUrl) {
            // debouncedSearchKeyword 대신 currentSearchKeyword 사용
            if (userNicknameFromUrl) {
                return `${userNicknameFromUrl} 님의 판매자 권한 이력 (총 ${totalElements}건)`;
            }
            return `ID: ${userIdFromUrl} 님의 판매자 권한 이력 (총 ${totalElements}건)`;
        }

        if (currentSearchKeyword.trim()) {
            // debouncedSearchKeyword 대신 currentSearchKeyword 사용
            let prefix = '';
            if (
                userNicknameFromUrl &&
                currentSearchKeyword === userNicknameFromUrl // debouncedSearchKeyword 대신 currentSearchKeyword 사용
            ) {
                prefix = `${userNicknameFromUrl} 님의`;
            } else if (
                !isNaN(currentSearchKeyword) && // debouncedSearchKeyword 대신 currentSearchKeyword 사용
                currentSearchKeyword.length > 0
            ) {
                prefix = `ID: ${currentSearchKeyword} 님의`; // debouncedSearchKeyword 대신 currentSearchKeyword 사용
            } else if (
                currentSearchKeyword.includes('회사') || // debouncedSearchKeyword 대신 currentSearchKeyword 사용
                currentSearchKeyword.includes('기업') ||
                currentSearchKeyword.includes('(주)')
            ) {
                prefix = `업체명: ${currentSearchKeyword} 의`; // debouncedSearchKeyword 대신 currentSearchKeyword 사용
            } else {
                prefix = `${currentSearchKeyword} 님의`; // debouncedSearchKeyword 대신 currentSearchKeyword 사용
            }
            return `${prefix} 판매자 권한 이력 (총 ${totalElements}건)`;
        }
        return `📜 전체 판매자 권한 이력 (총 ${totalElements}건)`;
    }, [
        userIdFromUrl,
        userNicknameFromUrl,
        currentSearchKeyword, // debouncedSearchKeyword 대신 currentSearchKeyword 의존
        totalElements,
    ]);

    // 날짜 포맷터 추가
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

    // 사업자등록번호 포맷터
    const formatBusinessNumber = (num) => {
        return num ? num.replace(/(\d{3})(\d{2})(\d{5})/, '$1-$2-$3') : 'N/A';
    };

    // 전화번호 포맷터
    const formatPhoneNumber = (phone) => {
        return phone
            ? phone.replace(/(\d{2,3})(\d{3,4})(\d{4})/, '$1-$2-$3')
            : 'N/A';
    };

    if (loading) {
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
                        판매자 권한 이력 조회로 이동 중...
                    </h1>

                    {/* 부제목 */}
                    <p
                        className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                        style={{
                            fontSize: isMobile ? '14px' : '16px',
                            padding: isMobile ? '0 16px' : '0',
                        }}
                    >
                        모든 판매자 신청 및 처리 이력을 확인합니다.
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
                            판매자 이력 데이터를 불러오는 중...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
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
                    판매자 권한 이력 조회
                </h1>

                {/* 부제목 */}
                <p
                    className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                    style={{
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '0 16px' : '0',
                    }}
                >
                    모든 판매자 신청 및 처리 이력을 확인합니다.
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
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                        }}
                    >
                        {/* 🔧 상단 컨트롤 바 (pageSize 왼쪽 정렬, 검색창 & 필터 오른쪽 정렬) */}
                        <div className="p-6 flex justify-between items-center gap-4 mb-3 flex-wrap">
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
                                        value={searchTerm}
                                        onChange={handleKeywordChange}
                                        onKeyDown={handleSearchOnEnter}
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
                            <p className="text-gray-400 text-center py-6">
                                표시할 이력이 없습니다.
                            </p>
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
                                                    {history.type ===
                                                        'REJECTED' ||
                                                    history.type === 'REVOKED'
                                                        ? `${STATUS_LABELS[history.type]} (${history.reason || '사유 없음'})`
                                                        : STATUS_LABELS[
                                                              history.type
                                                          ] || history.type}
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
                                <div className="flex justify-center items-center space-x-2 mt-4 p-4">
                                    {totalPages > 0 && (
                                        <Button
                                            onClick={() => handlePageChange(0)}
                                            disabled={currentPage === 0}
                                            className="px-3 py-1 text-xs bg-transparent hover:bg-[#243447] text-white border border-transparent"
                                        >
                                            처음으로
                                        </Button>
                                    )}
                                    <Button
                                        onClick={() =>
                                            handlePageChange(currentPage - 1)
                                        }
                                        disabled={currentPage === 0}
                                        className="px-3 py-1 text-xs bg-transparent hover:bg-[#243447] text-white border border-transparent"
                                    >
                                        이전
                                    </Button>
                                    {getVisiblePageNumbers().map(
                                        (pageNum, index) =>
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
                                                        handlePageChange(
                                                            pageNum,
                                                        )
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
                                    <Button
                                        onClick={() =>
                                            handlePageChange(currentPage + 1)
                                        }
                                        disabled={currentPage >= totalPages - 1}
                                        className="px-3 py-1 text-xs bg-transparent hover:bg-[#243447] text-white border border-transparent"
                                    >
                                        다음
                                    </Button>
                                    {totalPages > 0 && (
                                        <Button
                                            onClick={() =>
                                                handlePageChange(totalPages - 1)
                                            }
                                            disabled={
                                                currentPage === totalPages - 1
                                            }
                                            className="px-3 py-1 text-xs bg-transparent hover:bg-[#243447] text-white border border-transparent"
                                        >
                                            마지막으로
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 모바일에서 하단 여백 */}
                {isMobile && <div className="h-16" aria-hidden="true"></div>}
            </div>

            {/* 판매자 이력 상세 모달 */}
            {showHistoryModal && selectedUserHistory && (
                <Modal
                    isOpen={showHistoryModal}
                    onClose={() => setShowHistoryModal(false)}
                    title={`'${selectedUserHistory.username}' (${selectedUserHistory.userNickname}) 님의 이력 상세`}
                    size="large"
                    modalClassName="bg-[#1a232f]" // 모달 배경색
                >
                    {/* 신청서 상세 정보 (API-04-07로 가져온 데이터) */}
                    <div className="mb-6">
                        <h3 className="text-white font-semibold mb-2">
                            신청서 상세 정보
                        </h3>
                        {detailedApplication ? (
                            <div className="text-gray-300 text-sm space-y-1 border border-gray-600 rounded p-4 bg-[#1a232f]">
                                <p>
                                    <strong>신청서 ID:</strong>{' '}
                                    {detailedApplication.applicationId}
                                </p>
                                <p>
                                    <strong>업체명:</strong>{' '}
                                    {detailedApplication.companyName}
                                </p>
                                <p>
                                    <strong>사업자번호:</strong>{' '}
                                    {formatBusinessNumber(
                                        detailedApplication.businessNumber,
                                    )}
                                </p>
                                <p>
                                    <strong>대표자명:</strong>{' '}
                                    {detailedApplication.representativeName}
                                </p>
                                <p>
                                    <strong>담당자 연락처:</strong>{' '}
                                    {formatPhoneNumber(
                                        detailedApplication.representativePhone,
                                    )}
                                </p>
                                {detailedApplication.uploadedFileUrl && (
                                    <p>
                                        <strong>제출 서류:</strong>{' '}
                                        <a
                                            href={
                                                detailedApplication.uploadedFileUrl
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
                                    <strong>신청 일시:</strong>{' '}
                                    {formatDate(detailedApplication.createdAt)}
                                </p>
                                <p>
                                    <strong>최종 수정 일시:</strong>{' '}
                                    {formatDate(detailedApplication.updatedAt)}
                                </p>
                                <p>
                                    <strong>현재 상태:</strong>{' '}
                                    {STATUS_LABELS[
                                        detailedApplication.status
                                    ] || detailedApplication.status}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-400">
                                이력 항목에 연결된 상세 신청서 정보가 없거나,
                                불러오는데 실패했습니다.
                            </p>
                        )}
                    </div>

                    {/* 선택된 이력 항목 */}
                    <div className="overflow-x-auto mb-4">
                        <h4 className="text-white font-semibold mb-2">
                            선택된 이력 항목
                        </h4>
                        <table className="min-w-full divide-y divide-gray-700 text-left">
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
                                <tr className="cursor-pointer hover:bg-gray-800">
                                    <td className="px-4 py-3 text-sm text-white">
                                        {selectedUserHistory.id}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                        {STATUS_LABELS[
                                            selectedUserHistory.type
                                        ] || selectedUserHistory.type}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                        {selectedUserHistory.reason || 'N/A'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-300">
                                        {new Date(
                                            selectedUserHistory.createdAt,
                                        ).toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-4 text-right">
                        <button
                            className="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
                            onClick={() => setShowHistoryModal(false)}
                        >
                            닫기
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default ApplicationHistoryPage;
