import React, { useState, useEffect, useCallback } from 'react';
import { adminSellerService } from '../../features/admin/services/adminSellerService';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner'; // LoadingSpinner 컴포넌트
import ErrorMessage from '../../shared/components/ui/ErrorMessage'; // ErrorMessage 컴포넌트
import Button from '../../shared/components/ui/Button'; // Button 컴포넌트
import Modal from '../../shared/components/ui/Modal'; // Modal 컴포넌트
import InputField from '../../shared/components/ui/InputField'; // InputField 컴포넌트
import { useNavigate } from 'react-router-dom';
import {
    formatPhoneNumber,
    formatBusinessNumber,
} from '../../shared/utils/formatters';

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

const AdminDashboard = () => {
    const navigate = useNavigate();
    // useResponsive 훅에서 isDesktop을 구조 분해하여 가져오도록 수정
    const { isMobile, isTablet, isDesktop } = useResponsive(); // 반응형 훅 사용

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
        if (!dateString) return '-';
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
            REQUEST: '승인 대기 중',
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

    // quickActions
    const adminQuickActions = [
        {
            title: '판매자 신청 처리',
            description: '대기 중인 판매자 신청을 승인/반려합니다',
            icon: '📄', // 아이콘은 이모지로 대체
            path: '/admin/seller-approvals',
            color: '#10b981', // green-600
            isComingSoon: false,
        },
        {
            title: '판매자 목록 관리',
            description: '현재 판매자 목록을 조회하고 관리합니다',
            icon: '👥',
            path: '/admin/sellers',
            color: '#3b82f6', // blue-600
            isComingSoon: false,
        },
        {
            title: '이력 조회',
            description: '모든 판매자 신청/처리 이력을 확인합니다',
            icon: '📜',
            path: '/admin/history',
            color: '#8b5cf7', // purple-600
            isComingSoon: false,
        },
        // --- 세 개의 커밍순 카드를 하나로 대체 ---
        {
            title: 'Coming Soon..', // 큰 제목
            description: '더 많은 관리 기능이 곧 추가될 예정입니다.', // 간결한 설명
            icon: '🚀', // 대표 이모지 (로켓)
            path: '#', // 클릭 시 이동할 경로가 없으므로 #
            color: '#94a3b8', // gray-400 (차분한 회색 계열)
            isComingSoon: true, // 커밍순 카드임을 나타냄
            // 이 카드는 3열을 모두 차지해야 하므로 별도의 span 속성을 추가
            colSpan: 3, // 데스크톱에서 3열을 차지하도록
        },
    ];

    // --- 로딩 및 에러 처리 UI ---
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
                    {/* 페이지 제목 - `animate-shimmer-text` 클래스 추가 */}
                    <h1
                        className={
                            isMobile
                                ? 'text-xl font-bold mb-4 text-center break-words animate-shimmer-text'
                                : isTablet
                                  ? 'text-2xl font-bold mb-5 text-center break-words animate-shimmer-text'
                                  : 'text-4xl font-bold mb-6 text-center break-words animate-shimmer-text'
                        }
                        style={{
                            color: '#FFFFFF', // 이 색상은 text-transparent로 오버라이드될 것임
                            padding: isMobile ? '0 8px' : '0',
                            wordBreak: 'keep-all',
                            overflowWrap: 'break-word',
                        }}
                    >
                        관리자 대시보드로 이동 중...
                    </h1>

                    {/* 부제목 */}
                    <p
                        className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                        style={{
                            fontSize: isMobile ? '14px' : '16px',
                            padding: isMobile ? '0 16px' : '0',
                        }}
                    >
                        시스템 관리 및 판매자 관리를 수행하세요
                    </p>

                    {/* 로딩 카드 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
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
                        {/*/!* LoadingSpinner 컴포넌트 사용 *!/*/}
                        {/*<LoadingSpinner message="대시보드 데이터를 불러오는 중..." />*/}
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
                            대시보드 데이터를 불러오는 중...
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
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {/* 에러 카드 */}
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
                // 반응형 `max-w` 및 `padding` 클래스 적용
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
                    관리자 대시보드
                </h1>

                {/* 부제목 - `마우스 hover 시 툴팁 추가` */}
                <p
                    className={`text-center mb-${isMobile ? '6' : isTablet ? '8' : '10'} text-gray-400`}
                    style={{
                        fontSize: isMobile ? '14px' : '16px',
                        padding: isMobile ? '0 16px' : '0',
                    }}
                >
                    <span className="relative inline-block group">
                        시스템 관리
                        {/* 툴팁 위치를 아래로, 충분히 내리고 화살표 위치 조정 */}
                        <span className="absolute left-1/2 -translate-x-1/2 top-[calc(100%+8px)] px-3 py-1 bg-blue-200 text-blue-900 text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                            추후 기능 확장 예정입니다.
                            {/* 툴팁 화살표 위치도 변경: -top-2, border-b-4, border-b-gray-700 */}
                            <span className="absolute left-1/2 -translate-x-1/2 -top-2 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-gray-300"></span>
                        </span>
                    </span>
                    {' 및 판매자 관리를 수행하세요'}
                </p>

                {/* 콘텐츠 영역 */}
                <div
                    className={`space-y-${isMobile ? '4' : isTablet ? '5' : '8'}`}
                >
                    {/* 요약 카드 섹션 */}
                    <div
                        className="rounded-xl shadow-md text-center"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile
                                ? '24px'
                                : isTablet
                                  ? '28px'
                                  : '32px',
                        }}
                    >
                        <div className="text-6xl mb-4">👑</div>
                        <h2
                            className={`font-bold text-white mb-3 ${isMobile ? 'text-lg' : 'text-xl'}`}
                        >
                            관리자님 환영합니다!
                        </h2>
                        <p
                            className={`text-gray-300 leading-relaxed ${isMobile ? 'text-sm' : 'text-base'}`}
                        >
                            총 <strong>{pendingCount}건</strong>의 대기 중인
                            판매자 신청이 있습니다.
                            <br />
                            현재 <strong>{currentSellersCount}명</strong>의
                            판매자가 활동 중입니다.
                        </p>
                    </div>

                    {/* 빠른 액션 카드들 */}
                    <div>
                        <h3
                            className={`font-bold text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}
                        >
                            빠른 액션
                        </h3>
                        <div
                            className={`grid gap-4 ${
                                isMobile
                                    ? 'grid-cols-1'
                                    : isTablet
                                      ? 'grid-cols-2'
                                      : 'grid-cols-3'
                            }`}
                        >
                            {/* adminQuickActions 배열을 map하여 카드 렌더링 */}
                            {adminQuickActions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (action.action) {
                                            action.action();
                                        } else if (
                                            action.path &&
                                            action.path !== '#'
                                        ) {
                                            navigate(action.path);
                                        }
                                    }}
                                    // isComingSoon 값과 colSpan에 따라 클래스 및 스타일 조건부 적용
                                    className={`
                                        text-left rounded-xl shadow-md transition-all 
                                        ${action.isComingSoon ? 'cursor-default' : 'hover:scale-105'}
                                        ${action.colSpan === 3 && isDesktop ? 'col-span-3' : ''} /* 데스크톱 3열 차지 */
                                        ${action.colSpan === 3 && isTablet ? 'col-span-2' : ''} /* 태블릿 2열 차지 (남은 1칸은 빈 칸) */
                                        ${action.colSpan === 3 && isMobile ? 'col-span-1' : ''} /* 모바일 1열 차지 */
                                    `}
                                    style={{
                                        // 배경색 변경: isComingSoon이면 #243447, 아니면 #1f2937
                                        backgroundColor: action.isComingSoon
                                            ? '#243447'
                                            : '#1f2937',
                                        border: '1px solid #374151', // 기본 테두리색 (gray-700)
                                        minHeight: action.isComingSoon
                                            ? '100px'
                                            : isMobile
                                              ? '120px'
                                              : '140px',
                                        // isComingSoon이면 그림자/변형 제거 (hover 효과와 맞춤)
                                        boxShadow: action.isComingSoon
                                            ? 'none'
                                            : '0 4px 6px rgba(0, 0, 0, 0.1)',
                                        transform: action.isComingSoon
                                            ? 'none'
                                            : 'translateY(0)',
                                        // 중앙 정렬을 위한 flexbox (colSpan이 3일 때)
                                        display:
                                            action.colSpan === 3
                                                ? 'flex'
                                                : 'block',
                                        flexDirection:
                                            action.colSpan === 3
                                                ? 'column'
                                                : 'row',
                                        alignItems:
                                            action.colSpan === 3
                                                ? 'center'
                                                : 'flex-start',
                                        justifyContent:
                                            action.colSpan === 3
                                                ? 'center'
                                                : 'flex-start',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!action.isComingSoon && !isMobile) {
                                            e.currentTarget.style.borderColor =
                                                action.color;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!action.isComingSoon && !isMobile) {
                                            e.currentTarget.style.borderColor =
                                                '#374151';
                                        }
                                    }}
                                    disabled={action.isComingSoon} // 커밍순 카드는 클릭 불가하도록 비활성화
                                >
                                    {action.isComingSoon ? (
                                        <>
                                            {/* 큰 아이콘과 텍스트 중앙 배치 */}
                                            <span
                                                className="text-5xl mb-2"
                                                style={{ color: action.color }}
                                            >
                                                {action.icon}
                                            </span>
                                            <h4
                                                className="font-bold text-white mb-1 text-2xl text-center"
                                                style={{ opacity: 0.8 }}
                                            >
                                                {action.title}
                                            </h4>
                                            <p
                                                className="text-gray-300 text-base text-center"
                                                style={{ opacity: 0.8 }}
                                            >
                                                {action.description}
                                            </p>
                                        </>
                                    ) : (
                                        <div className="flex items-start gap-4 p-6 w-full h-full">
                                            {/* 아이콘 컨테이너 */}
                                            <div
                                                className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                                                style={{
                                                    backgroundColor:
                                                        action.color,
                                                }}
                                            >
                                                <span className="text-xl">
                                                    {action.icon}
                                                </span>
                                            </div>
                                            {/* 텍스트 컨테이너 */}
                                            <div className="flex-1 text-left">
                                                <h4
                                                    className={`font-semibold text-white mb-1 ${isMobile ? 'text-base' : 'text-lg'}`}
                                                >
                                                    {action.title}
                                                </h4>
                                                <p
                                                    className={`text-gray-300 ${isMobile ? 'text-sm' : 'text-base'}`}
                                                >
                                                    {action.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        {/* 빠른 액션 내 기존 버튼 배치 유지 (판매자 권한 신청 처리, 판매자 빠른 검색) */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-4">
                            <Button
                                onClick={handleProcessNextPending}
                                className={`flex-1 ${
                                    pendingCount === 0
                                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                                disabled={pendingCount === 0}
                            >
                                {pendingCount > 0
                                    ? `다음 대기 신청 처리 (총 ${pendingCount}건)`
                                    : '대기 신청 없음'}
                            </Button>
                            <Button
                                onClick={handleQuickSearch}
                                className="flex-1 bg-blue-600 hover:bg-gray-700 text-white"
                            >
                                판매자 빠른 검색
                            </Button>
                        </div>
                    </div>

                    {/* Recent Activities 테이블 섹션 */}
                    <div
                        className="rounded-xl shadow-md"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile ? '20px' : '24px',
                        }}
                    >
                        <h3
                            className={`font-bold text-white mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}
                        >
                            🕒 최근 활동 내역
                        </h3>
                        {recentActivities.length === 0 ? (
                            <p className="text-gray-400 text-center">
                                최근 활동 내역이 없습니다.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-[#243447]">
                                        <tr>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                유저
                                            </th>
                                            {/* 기존 '액션' 컬럼을 '타입'으로 변경 */}
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[80px]">
                                                타입
                                            </th>
                                            {/* '사유' 컬럼 새로 추가 및 최소 너비 설정 */}
                                            <th className="px-6 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[120px]">
                                                사유
                                            </th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                일시
                                            </th>
                                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                상세
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                        {recentActivities.map((activity) => (
                                            <tr key={activity.id}>
                                                <td className="px-3 py-3 text-center whitespace-nowrap text-sm text-white">
                                                    {activity.username} (
                                                    {activity.userNickname})
                                                </td>
                                                {/* '타입' 내용 표시 */}
                                                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-300">
                                                    {getHistoryTypeLabel(
                                                        activity.type,
                                                    )}
                                                </td>
                                                {/* '사유' 내용 표시 및 툴팁 적용 */}
                                                <td className="px-6 py-3 text-center text-sm text-gray-300 relative">
                                                    <span className="inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[15ch] group">
                                                        {activity.reason || '-'}
                                                        {/* 툴팁: 사유가 존재하고, 15글자 초과할 때만 표시 */}
                                                        {activity.reason &&
                                                            activity.reason
                                                                .length >
                                                                15 && (
                                                                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-gray-700 text-white text-xs rounded-md whitespace-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 w-max max-w-xs">
                                                                    {
                                                                        activity.reason
                                                                    }
                                                                    {/* 툴팁 화살표 */}
                                                                    <span className="absolute left-1/2 -translate-x-1/2 -top-1 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-gray-700"></span>
                                                                </span>
                                                            )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-300">
                                                    {formatDate(
                                                        activity.createdAt,
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap text-center text-sm">
                                                    <Button
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/history?userId=${activity.userId}`,
                                                            )
                                                        }
                                                        className="bg-purple-600 hover:bg-purple-800 text-white px-3 py-1 text-xs"
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
                    </div>
                </div>

                {/* 모바일에서 하단 여백 */}
                {isMobile && <div className="h-16" aria-hidden="true"></div>}
            </div>

            {/* --- 다음 대기 신청 처리 모달 --- */}
            {showProcessPendingModal && pendingAppToProcess && (
                <Modal
                    isOpen={showProcessPendingModal}
                    onClose={() => setShowProcessPendingModal(false)}
                    modalClassName="bg-[#1a232f]"
                    title="다음 대기 신청 처리"
                >
                    <div className="text-gray-300">
                        <p className="text-xl font-semibold text-white mb-2 text-center">
                            <strong className="text-white">
                                &apos;
                                {pendingAppToProcess.username || '알 수 없음'}
                                &apos;(
                                {pendingAppToProcess.userNickname ||
                                    '닉네임 없음'}
                                )
                            </strong>
                            님의 다음 신청을 처리하시겠습니까?
                        </p>

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

                        <div className="mb-4 text-center text-s text-gray-200 space-y-1 p-4 border border-gray-600 rounded-lg">
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

                        {pendingAppToProcess.userHistorySummary &&
                            pendingAppToProcess.userHistorySummary.length >
                                0 && (
                                <div className="mb-4 border border-gray-600 rounded p-2">
                                    <p className="text-sm mt-1 text-center font-semibold mb-2 text-white">
                                        <u>&nbsp;최근 이력 요약&nbsp;</u>
                                    </p>
                                    <div className="overflow-x-auto mx-1.5 my-3 ">
                                        <table className="min-w-full text-xs divide-y border border-gray-700 divide-gray-700">
                                            <thead>
                                                <tr className="bg-[#243447]">
                                                    <th className="px-6 py-1 border-r-2 border-dashed border-gray-600 border-opacity-60 text-center text-gray-300">
                                                        상태
                                                    </th>
                                                    <th className="px-8 py-1 border-r-2 border-dashed border-gray-600 border-opacity-60 text-center text-gray-300 min-w-[120px]">
                                                        사유{' '}
                                                        {/* 헤더를 '사유'로 유지 */}
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
                                                            <td className="px-6 py-1 border-r-2 border-dashed border-gray-600 border-opacity-60 text-center text-gray-300 text-left">
                                                                {getHistoryTypeLabel(
                                                                    history.type,
                                                                )}
                                                            </td>
                                                            {/* '사유' 내용 표시 및 툴팁 적용 */}
                                                            {/* max-w-[15ch] 추가하여 15글자 이상일 때 말줄임표 적용 */}
                                                            <td className="px-8 py-1 border-r-2 border-dashed border-gray-600 border-opacity-60 text-center text-gray-300 text-left relative">
                                                                <span className="inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[15ch] group">
                                                                    {' '}
                                                                    {/* max-w-[15ch] 추가 */}
                                                                    {history.reason ||
                                                                        '-'}
                                                                    {/* 툴팁: 사유가 존재하고, 15글자 초과할 때만 표시 */}
                                                                    {history.reason &&
                                                                        history
                                                                            .reason
                                                                            .length >
                                                                            15 && (
                                                                            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-gray-700 text-white text-xs rounded-md whitespace-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 w-max max-w-xs">
                                                                                {
                                                                                    history.reason
                                                                                }
                                                                                {/* 툴팁 화살표 */}
                                                                                <span className="absolute left-1/2 -translate-x-1/2 -top-1 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-gray-700"></span>
                                                                            </span>
                                                                        )}
                                                                </span>
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
                                    <div className="text-center">
                                        <Button
                                            onClick={() => {
                                                setShowProcessPendingModal(
                                                    false,
                                                );
                                                navigate(
                                                    `/admin/history?userId=${pendingAppToProcess.userId}`,
                                                );
                                            }}
                                            className="bg-gray-700 hover:bg-gray-600 text-center text-white px-3 py-0.5 text-xs mt-1 mb-2.5"
                                        >
                                            이력 전체 보기 (총{' '}
                                            {
                                                pendingAppToProcess
                                                    .userHistorySummary.length
                                            }
                                            건)
                                        </Button>
                                    </div>
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
                                className="bg-blue-700 hover:bg-blue-900 text-white px-4 py-2 rounded-lg self-end"
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
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="text-lg font-semibold text-white">
                                        검색 결과
                                    </h4>
                                    {/* 새로운 "이력 보기" 버튼 추가 */}
                                    <Button
                                        onClick={() => {
                                            setShowSearchModal(false); // 모달 닫기
                                            // 검색 키워드를 그대로 이력 페이지로 전달
                                            navigate(
                                                `/admin/history?keyword=${encodeURIComponent(searchKeyword)}`,
                                            );
                                        }}
                                        className="bg-gray-700 hover:bg-blue-400 text-white px-3 py-1 text-xs"
                                    >
                                        이력 보기
                                    </Button>
                                </div>
                                <table className="min-w-full divide-y divide-gray-700">
                                    <thead className="bg-[#243447]">
                                        <tr>
                                            <th className="px-5 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                유저 ID
                                            </th>
                                            <th className="px-5 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                아이디
                                            </th>
                                            <th className="px-5 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                닉네임
                                            </th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                타입
                                            </th>
                                            {/* '사유' 컬럼 헤더 추가 및 최소 너비 설정 */}
                                            <th className="px-6 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider min-w-[120px]">
                                                사유
                                            </th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                                일시
                                            </th>
                                            {/* 기존 '액션' 컬럼 제거 */}
                                        </tr>
                                    </thead>
                                    <tbody className="bg-[#1a232f] divide-y divide-gray-700">
                                        {searchResults.map((result) => (
                                            <tr key={result.id}>
                                                <td className="px-3 py-3 text-center whitespace-nowrap text-sm text-white">
                                                    {result.userId}
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap text-sm text-gray-300">
                                                    {result.username}
                                                </td>
                                                <td className="px-3 py-3 text-center whitespace-nowrap text-sm text-gray-300">
                                                    {result.userNickname}
                                                </td>
                                                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-300">
                                                    {getHistoryTypeLabel(
                                                        result.type,
                                                    )}
                                                </td>
                                                {/* '사유' 내용 표시 및 툴팁 적용 */}
                                                <td className="px-6 py-3 text-center text-sm text-gray-300 relative">
                                                    {/* max-w-[15ch]로 너비를 제한하여 말줄임표 작동 보장 */}
                                                    <span className="inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[30ch] group">
                                                        {result.reason || '-'}
                                                        {/* 툴팁: 사유가 존재하고, 15글자 초과할 때만 표시 */}
                                                        {result.reason &&
                                                            result.reason
                                                                .length >
                                                                10 && (
                                                                <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-3 py-1 bg-gray-700 text-white text-xs rounded-md whitespace-normal opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 w-max max-w-xs">
                                                                    {
                                                                        result.reason
                                                                    }
                                                                    {/* 툴팁 화살표 */}
                                                                    <span className="absolute left-1/2 -translate-x-1/2 -top-1 w-0 h-0 border-x-4 border-x-transparent border-b-4 border-b-gray-700"></span>
                                                                </span>
                                                            )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-300">
                                                    {formatDate(
                                                        result.createdAt,
                                                    )}
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
