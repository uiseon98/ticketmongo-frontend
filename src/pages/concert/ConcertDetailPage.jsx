// src/pages/concert/ConcertDetailPage.jsx
import React, { useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// 새로운 컴포넌트들 import
import ConcertDetail from '../../features/concert/components/ConcertDetail.jsx';
import AISummary from '../../features/concert/components/AISummary.jsx';
import ReviewList from '../../features/concert/components/ReviewList.jsx';
import ExpectationList from '../../features/concert/components/ExpectationList.jsx';
import Modal from '../../shared/components/ui/Modal.jsx';
import ReviewForm from '../../features/concert/components/ReviewForm.jsx';
import ExpectationForm from '../../features/concert/components/ExpectationForm.jsx';
import { AuthContext } from '../../context/AuthContext.jsx';

// 새로운 hooks import
import { useConcertDetail } from '../../features/concert/hooks/useConcertDetail.js';
import { useReviews } from '../../features/concert/hooks/useReviews.js';
import { useExpectations } from '../../features/concert/hooks/useExpectations.js';
import { useBookingQueue } from '../../features/booking/hooks/useBookingQueue';

function ConcertDetailPage() {
    const { concertId } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, isAuthenticated } = useContext(AuthContext);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showExpectationForm, setShowExpectationForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [editingExpectation, setEditingExpectation] = useState(null);
    const [expandedReviews, setExpandedReviews] = useState(new Set());
    const [expandedExpectations, setExpandedExpectations] = useState(new Set());

    // 콘서트 상태별 설정 (함수 상단으로 이동)
    const statusConfig = {
        SOLD_OUT: {
            buttonText: '매진',
            statusText: '매진',
            color: 'text-red-600',
        },
        CANCELLED: {
            buttonText: '취소됨',
            statusText: '취소됨',
            color: 'text-gray-600',
        },
        SCHEDULED: {
            buttonText: '예매 대기',
            statusText: '예매 대기',
            color: 'text-yellow-600',
        },
        ON_SALE: {
            buttonText: '예매하기',
            statusText: '예매 중',
            color: 'text-green-600',
        },
        COMPLETED: {
            buttonText: '공연 완료',
            statusText: '공연 완료',
            color: 'text-gray-600',
        },
    };

    // 콘서트 상세 정보 hook
    const parsedConcertId = parseInt(concertId);
    if (isNaN(parsedConcertId)) {
        return (
            <div className="text-center text-red-500 py-10">
                잘못된 콘서트 ID 입니다.
            </div>
        );
    }

    const {
        concert,
        aiSummary,
        loading: concertLoading,
        error: concertError,
        fetchAISummary,
        aiSummaryLoading,
    } = useConcertDetail(parsedConcertId);

    // 리뷰 목록 hook
    const {
        reviews,
        loading: reviewsLoading,
        error: reviewsError,
        currentPage: reviewsPage,
        totalPages: reviewsTotalPages,
        totalElements: reviewsTotal,
        goToPage: goToReviewsPage,
        changeSorting: changeReviewsSorting,
        sortBy: reviewsSortBy,
        sortDir: reviewsSortDir,
        createReview,
        updateReview,
        deleteReview,
        actionLoading,
    } = useReviews(parsedConcertId);

    // 기대평 목록 hook
    const {
        expectations,
        loading: expectationsLoading,
        error: expectationsError,
        currentPage: expectationsPage,
        totalPages: expectationsTotalPages,
        totalElements: expectationsTotal,
        goToPage: goToExpectationsPage,
        createExpectation,
        updateExpectation,
        deleteExpectation,
        actionLoading: expectationActionLoading,
    } = useExpectations(parsedConcertId);

    const { enterQueue, isEntering } = useBookingQueue(concertId);

    // 리뷰 클릭 핸들러 (상세보기나 수정 등)
    const handleReviewClick = (review) => {
        setExpandedReviews((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(review.id)) {
                newSet.delete(review.id); // 이미 펼쳐져 있으면 접기
            } else {
                newSet.add(review.id); // 접혀있으면 펼치기
            }
            return newSet;
        });
    };

    // 기대평 클릭 핸들러
    const handleExpectationClick = (expectation) => {
        setExpandedExpectations((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(expectation.id)) {
                newSet.delete(expectation.id);
            } else {
                newSet.add(expectation.id);
            }
            return newSet;
        });
    };

    // 리뷰 작성/수정/삭제 핸들러들
    const handleCreateReview = () => {
        if (!currentUser || !currentUser.userId) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        setShowReviewForm(true);
    };
    const handleEditReview = (review) => {
        setEditingReview(review);
        setShowReviewForm(true);
    };
    const handleDeleteReview = async (reviewId) => {
        if (window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
            try {
                await deleteReview(reviewId);
                alert('리뷰가 삭제되었습니다.');
            } catch (error) {
                alert('리뷰 삭제에 실패했습니다.');
            }
        }
    };

    // 기대평 작성/수정/삭제 핸들러들
    const handleCreateExpectation = () => {
        if (!currentUser || !currentUser.userId) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }
        setShowExpectationForm(true);
    };
    const handleEditExpectation = (expectation) => {
        setEditingExpectation(expectation);
        setShowExpectationForm(true);
    };
    const handleDeleteExpectation = async (expectationId) => {
        if (window.confirm('정말로 이 기대평을 삭제하시겠습니까?')) {
            try {
                await deleteExpectation(expectationId);
                alert('기대평이 삭제되었습니다.');
            } catch (error) {
                console.error('기대평 삭제 실패:', error); // ✅ 에러 로깅 추가
                alert('기대평 삭제에 실패했습니다.');
            }
        }
    };

    // 콘서트 정보 로딩 중이면 로딩 표시
    if (concertLoading) {
        return (
            <div
                style={{
                    backgroundColor: '#0F172A',
                    minHeight: '100vh',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#FFFFFF',
                }}
            >
                <div
                    style={{
                        textAlign: 'center',
                        backgroundColor: '#1E293B',
                        padding: '40px',
                        borderRadius: '12px',
                        border: '1px solid #374151',
                    }}
                >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #374151',
                            borderTop: '4px solid #3B82F6',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px',
                        }}
                    />
                    <div style={{ color: '#FFFFFF', fontSize: '18px' }}>
                        콘서트 상세 정보 로딩 중...
                    </div>

                    <style>{`
                        @keyframes spin {
                            from {
                                transform: rotate(0deg);
                            }
                            to {
                                transform: rotate(360deg);
                            }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    // 콘서트 정보 에러 시 에러 표시
    if (concertError) {
        return (
            <div className="text-center text-red-500 py-10">
                에러: {concertError}
            </div>
        );
    }

    // 콘서트 정보가 없으면 안내 메시지
    if (!concert) {
        return (
            <div className="text-center text-gray-500 py-10">
                콘서트 정보를 찾을 수 없습니다.
            </div>
        );
    }

    // 현재 콘서트 상태 확인
    const currentStatus = statusConfig[concert.status] || statusConfig.ON_SALE;

    return (
        <div
            style={{
                backgroundColor: '#0F172A',
                minHeight: '100vh',
                width: '100vw',
                margin: 0,
                padding: 0,
            }}
        >
            <div
                className="max-w-6xl mx-auto p-6 overflow-x-hidden"
                style={{
                    backgroundColor: '#0F172A',
                    minHeight: '100vh',
                    color: '#FFFFFF', // 전체 텍스트 흰색
                }}
            >
                <h1
                    className="text-4xl font-bold mb-6 text-center break-words"
                    style={{ color: '#FFFFFF' }}
                >
                    {' '}
                    {/* 흰색 제목 */}
                    {concert.title}
                </h1>

                {/* 기존 grid는 유지하되, 카드들 배경 수정 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 좌측 상세 콘텐츠 */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* 각 섹션 배경 수정 */}
                        <div
                            className="rounded-xl shadow-md"
                            style={{
                                backgroundColor: '#1E293B',
                                border: '1px solid #374151',
                            }}
                        >
                            <ConcertDetail
                                concert={concert}
                                loading={concertLoading}
                                error={concertError}
                                onBookingClick={enterQueue}
                                isBooking={isEntering}
                                showBookingButton={true}
                                compact={false}
                            />
                        </div>

                        {/* AI 요약 컴포넌트 */}
                        {(aiSummary || aiSummaryLoading) && (
                            <div
                                className="rounded-xl shadow-md p-6"
                                style={{
                                    backgroundColor: '#1E293B',
                                    border: '1px solid #374151',
                                }}
                            >
                                <AISummary
                                    summary={aiSummary}
                                    loading={aiSummaryLoading}
                                    onRefresh={fetchAISummary}
                                    showRefreshButton={false}
                                    compact={false}
                                />
                            </div>
                        )}

                        {/* 리뷰 목록 컴포넌트 */}
                        <div className="rounded-xl shadow-md p-6">
                            <ReviewList
                                reviews={reviews}
                                loading={reviewsLoading}
                                error={reviewsError}
                                currentPage={reviewsPage}
                                totalPages={reviewsTotalPages}
                                totalElements={reviewsTotal}
                                sortBy={reviewsSortBy}
                                sortDir={reviewsSortDir}
                                onReviewClick={handleReviewClick}
                                onSortChange={changeReviewsSorting}
                                onPageChange={goToReviewsPage}
                                showSortOptions={true}
                                showPagination={true}
                                compact={false}
                                expandedItems={expandedReviews}
                                currentUserId={currentUser?.userId}
                                onCreateReview={handleCreateReview}
                                onEditReview={handleEditReview}
                                onDeleteReview={handleDeleteReview}
                            />
                        </div>

                        {/* 기대평 목록 컴포넌트 */}
                        <div className="rounded-xl shadow-md p-6">
                            <ExpectationList
                                expectations={expectations}
                                loading={expectationsLoading}
                                error={expectationsError}
                                currentPage={expectationsPage}
                                totalPages={expectationsTotalPages}
                                totalElements={expectationsTotal}
                                onExpectationClick={handleExpectationClick}
                                onPageChange={goToExpectationsPage}
                                showPagination={true}
                                compact={false}
                                expandedItems={expandedExpectations}
                                currentUserId={currentUser?.userId}
                                onCreateExpectation={handleCreateExpectation}
                                onEditExpectation={handleEditExpectation}
                                onDeleteExpectation={handleDeleteExpectation}
                            />
                        </div>
                    </div>

                    {/* 우측 티켓 정보 사이드바 */}
                    <div
                        className="lg:sticky lg:top-24 lg:self-start p-6 rounded-xl shadow-md space-y-4 h-fit"
                        style={{
                            backgroundColor: '#1E293B',
                            border: '1px solid #374151',
                        }}
                    >
                        <h2
                            className="text-xl font-bold"
                            style={{ color: '#3B82F6' }}
                        >
                            {' '}
                            {/* 블루 제목 */}
                            티켓 등급 및 가격
                        </h2>
                        {[
                            { type: '일반석', price: 50000 },
                            { type: 'VIP', price: 100000 },
                            { type: '프리미엄', price: 150000 },
                        ].map((ticket) => (
                            <div
                                key={ticket.type}
                                className="flex justify-between bg-white px-4 py-3 rounded-lg shadow-sm"
                                style={{
                                    backgroundColor: '#374151', // 다크 배경
                                    border: '1px solid #4B5563', // 어두운 테두리
                                }}
                            >
                                <span
                                    className="text-sm font-semibold"
                                    style={{ color: '#FFFFFF' }}
                                >
                                    {ticket.type}
                                </span>
                                <span
                                    className="font-bold"
                                    style={{ color: '#3B82F6' }}
                                >
                                    {ticket.price.toLocaleString()}원
                                </span>
                            </div>
                        ))}

                        <button
                            onClick={enterQueue}
                            className="w-full mt-2 font-bold py-3 px-6 rounded-lg text-lg transition hover:scale-[1.02] disabled:cursor-not-allowed"
                            style={{
                                backgroundColor:
                                    concert.status === 'ON_SALE' && !isEntering
                                        ? '#3B82F6'
                                        : '#6B7280',
                                color: '#FFFFFF',
                                border: 'none',
                            }}
                            onMouseEnter={(e) => {
                                if (
                                    concert.status === 'ON_SALE' &&
                                    !isEntering
                                ) {
                                    e.target.style.backgroundColor = '#2563EB';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (
                                    concert.status === 'ON_SALE' &&
                                    !isEntering
                                ) {
                                    e.target.style.backgroundColor = '#3B82F6';
                                }
                            }}
                            disabled={
                                concert.status === 'SOLD_OUT' ||
                                concert.status === 'CANCELLED' ||
                                concert.status === 'COMPLETED' ||
                                isEntering
                            }
                        >
                            {isEntering
                                ? '처리 중...'
                                : currentStatus.buttonText}
                        </button>

                        {/* 콘서트 상태 표시 */}
                        <div
                            className="text-center text-sm mt-2"
                            style={{ color: '#9CA3AF' }}
                        >
                            현재 상태:{' '}
                            <span
                                className="font-semibold"
                                style={{ color: '#3B82F6' }}
                            >
                                {currentStatus.statusText}
                            </span>
                        </div>
                    </div>
                </div>
                {showReviewForm && (
                    <Modal
                        isOpen={showReviewForm}
                        onClose={() => {
                            setShowReviewForm(false);
                            setEditingReview(null);
                        }}
                        title={editingReview ? '리뷰 수정' : '리뷰 작성'}
                    >
                        <ReviewForm
                            mode={editingReview ? 'edit' : 'create'}
                            initialData={editingReview}
                            concertId={parsedConcertId}
                            userId={currentUser?.userId}
                            userNickname={
                                currentUser?.nickname || currentUser?.username
                            }
                            onSubmit={async (reviewData) => {
                                try {
                                    if (editingReview) {
                                        await updateReview(
                                            editingReview.id,
                                            reviewData,
                                        );
                                    } else {
                                        await createReview(reviewData);
                                    }
                                    // 모달 닫기
                                    setShowReviewForm(false);
                                    setEditingReview(null);
                                    alert('리뷰가 저장되었습니다.');
                                } catch (error) {
                                    console.error('리뷰 저장 실패:', error);
                                    alert('리뷰 저장에 실패했습니다.');
                                }
                            }}
                            onCancel={() => {
                                setShowReviewForm(false);
                                setEditingReview(null);
                            }}
                            loading={actionLoading}
                        />
                    </Modal>
                )}

                {showExpectationForm && (
                    <Modal
                        isOpen={showExpectationForm}
                        onClose={() => {
                            setShowExpectationForm(false);
                            setEditingExpectation(null);
                        }}
                        title={
                            editingExpectation ? '기대평 수정' : '기대평 작성'
                        }
                    >
                        <ExpectationForm
                            mode={editingExpectation ? 'edit' : 'create'}
                            initialData={editingExpectation}
                            concertId={parsedConcertId}
                            userId={currentUser?.userId}
                            userNickname={
                                currentUser?.nickname || currentUser?.username
                            }
                            onSubmit={async (expectationData) => {
                                try {
                                    if (editingExpectation) {
                                        await updateExpectation(
                                            editingExpectation.id,
                                            expectationData,
                                        );
                                    } else {
                                        await createExpectation(
                                            expectationData,
                                        );
                                    }
                                    // 모달 닫기
                                    setShowExpectationForm(false);
                                    setEditingExpectation(null);
                                    alert('기대평이 저장되었습니다.');
                                } catch (error) {
                                    console.error('기대평 저장 실패:', error);
                                    alert('기대평 저장에 실패했습니다.');
                                }
                            }}
                            onCancel={() => {
                                setShowExpectationForm(false);
                                setEditingExpectation(null);
                            }}
                            loading={expectationActionLoading}
                        />
                    </Modal>
                )}
            </div>
        </div>
    );
}

export default ConcertDetailPage;
