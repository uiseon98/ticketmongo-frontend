// src/pages/concert/ConcertDetailPage.jsx
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

// 새로운 컴포넌트들 import
import ConcertDetail from '../../features/concert/components/ConcertDetail.jsx';
import AISummary from '../../features/concert/components/AISummary.jsx';
import ReviewList from '../../features/concert/components/ReviewList.jsx';
import ExpectationList from '../../features/concert/components/ExpectationList.jsx';
import Modal from '../../shared/components/ui/Modal.jsx';
import ReviewForm from '../../features/concert/components/ReviewForm.jsx';
import ExpectationForm from '../../features/concert/components/ExpectationForm.jsx';

// 새로운 hooks import
import { useConcertDetail } from '../../features/concert/hooks/useConcertDetail.js';
import { useReviews } from '../../features/concert/hooks/useReviews.js';
import { useExpectations } from '../../features/concert/hooks/useExpectations.js';

function ConcertDetailPage() {
  const { concertId } = useParams();
  const navigate = useNavigate();
  const [expandedReviewId, setExpandedReviewId] = useState(null);
    // 모달 상태들
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [showExpectationForm, setShowExpectationForm] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // 현재 사용자 정보 (임시)
    const currentUser = { id: 2003, nickname: 'seoul_concert' };
    const [editingExpectation, setEditingExpectation] = useState(null);

  // 콘서트 상태별 설정 (함수 상단으로 이동)
  const statusConfig = {
    SOLD_OUT: {
      buttonText: '매진',
      statusText: '매진',
      color: 'text-red-600'
    },
    CANCELLED: {
      buttonText: '취소됨',
      statusText: '취소됨',
      color: 'text-gray-600'
    },
    SCHEDULED: {
      buttonText: '예매 대기',
      statusText: '예매 대기',
      color: 'text-yellow-600'
    },
    ON_SALE: {
      buttonText: '예매하기',
      statusText: '예매 중',
      color: 'text-green-600'
    },
    COMPLETED: {
      buttonText: '공연 완료',
      statusText: '공연 완료',
      color: 'text-gray-600'
    }
  };

  // 콘서트 상세 정보 hook
  const parsedConcertId = parseInt(concertId);
  if (isNaN(parsedConcertId)) {
    return <div className="text-center text-red-500 py-10">잘못된 콘서트 ID 입니다.</div>;
  }

const {
  concert,
  aiSummary,
  loading: concertLoading,
  error: concertError,
  fetchAISummary,
  aiSummaryLoading
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
  actionLoading: reviewActionLoading
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
  actionLoading: expectationActionLoading
} = useExpectations(parsedConcertId);

  // 예매하기 버튼 클릭 핸들러
  const handleReserveClick = () => {
    navigate(`/concerts/${concertId}/reserve`);
  };

  // 리뷰 클릭 핸들러 (상세보기나 수정 등)
  const handleReviewClick = (review) => {
    console.log('리뷰 클릭:', review);
    setExpandedReviewId(expandedReviewId === review.id ? null : review.id);
  };

  // 기대평 클릭 핸들러
  const handleExpectationClick = (expectation) => {
    console.log('기대평 클릭:', expectation);
    // 추후 기대평 상세 모달이나 수정 구현
  };

    // ===== 리뷰 관련 핸들러들 =====
    const handleCreateReview = () => {
      setEditingReview(null);
      setShowReviewForm(true);
    };

    const handleEditReview = (review) => {
      setEditingReview(review);
      setShowReviewForm(true);
    };

    const handleDeleteReview = (review) => {
      setDeleteConfirm({
        type: 'review',
        id: review.id,
        title: review.title
      });
    };

    // ===== 기대평 관련 핸들러들 =====
    const handleCreateExpectation = () => {
      setEditingExpectation(null);
      setShowExpectationForm(true);
    };

    const handleEditExpectation = (expectation) => {
      setEditingExpectation(expectation);
      setShowExpectationForm(true);
    };

    const handleDeleteExpectation = (expectation) => {
      setDeleteConfirm({
        type: 'expectation',
        id: expectation.id,
        title: expectation.comment.substring(0, 50) + '...'
      });
    };

  // 콘서트 정보 로딩 중이면 로딩 표시
  if (concertLoading) {
    return <div className="text-center py-10">콘서트 상세 정보 로딩 중...</div>;
  }

  // 콘서트 정보 에러 시 에러 표시
  if (concertError) {
    return <div className="text-center text-red-500 py-10">에러: {concertError}</div>;
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
    <div className="max-w-6xl mx-auto p-6 overflow-x-hidden">
      <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center break-words">
        {concert.title}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 좌측 상세 콘텐츠 */}
        <div className="lg:col-span-2 space-y-8">
          {/* 콘서트 상세 정보 컴포넌트 */}
          <div className="bg-white rounded-xl shadow-md">
            <ConcertDetail
              concert={concert}
              loading={concertLoading}
              error={concertError}
              onBookingClick={handleReserveClick}
              showBookingButton={true}
              compact={false}
            />
          </div>

          {/* AI 요약 컴포넌트 */}
          {(aiSummary || aiSummaryLoading) && (
            <div className="bg-white rounded-xl shadow-md p-6">
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
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">관람 후기</h3>
              <button
                onClick={handleCreateReview}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                📝 리뷰 작성하기
              </button>
            </div>
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
              expandedReviewId={expandedReviewId}
              currentUserId={currentUser.id}
              onEditClick={handleEditReview}
              onDeleteClick={handleDeleteReview}
            />
          </div>

          {/* 기대평 목록 컴포넌트 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">관람 기대평</h3>
              <button
                onClick={handleCreateExpectation}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                ✨ 기대평 작성하기
              </button>
            </div>

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
              currentUserId={currentUser.id}
              onEditClick={handleEditExpectation}
              onDeleteClick={handleDeleteExpectation}
            />
          </div>
        </div>

        {/* 우측 티켓 정보 사이드바 */}
        <div className="lg:sticky lg:top-24 lg:self-start bg-blue-50 p-6 rounded-xl shadow-md space-y-4 h-fit">
          <h2 className="text-xl font-bold text-blue-900">티켓 등급 및 가격</h2>
          {[
            { type: '일반석', price: 50000 },
            { type: 'VIP', price: 100000 },
            { type: '프리미엄', price: 150000 }
          ].map((ticket) => (
            <div
              key={ticket.type}
              className="flex justify-between bg-white px-4 py-3 rounded-lg shadow-sm"
            >
              <span className="text-sm font-semibold text-gray-700">
                {ticket.type}
              </span>
              <span className="text-blue-600 font-bold">
                {ticket.price.toLocaleString()}원
              </span>
            </div>
          ))}

          <button
            onClick={handleReserveClick}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition hover:scale-[1.02] disabled:bg-gray-400 disabled:cursor-not-allowed"
            disabled={concert.status === 'SOLD_OUT' || concert.status === 'CANCELLED' || concert.status === 'COMPLETED'}
          >
            {currentStatus.buttonText}
          </button>

            {/* 콘서트 상태 표시 */}
                    <div className="text-center text-sm text-gray-600 mt-2">
                      현재 상태: <span className={`font-semibold ${currentStatus.color}`}>
                        {currentStatus.statusText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ===== 모달들 ===== */}

                {/* 리뷰 작성/수정 모달 */}
                <Modal
                  isOpen={showReviewForm}
                  onClose={() => setShowReviewForm(false)}
                  title={editingReview ? "리뷰 수정" : "리뷰 작성"}
                >
                  <ReviewForm
                    mode={editingReview ? 'edit' : 'create'}
                    initialData={editingReview}
                    concertId={parsedConcertId}
                    userId={currentUser.id}
                    userNickname={currentUser.nickname}
                    onSubmit={async (formData) => {
                      if (editingReview) {
                        await updateReview(editingReview.id, formData);
                      } else {
                        await createReview(formData);
                      }
                      setShowReviewForm(false);
                      setEditingReview(null);
                    }}
                    loading={reviewActionLoading}
                  />
                </Modal>

                {/* 기대평 작성/수정 모달 */}
                <Modal
                  isOpen={showExpectationForm}
                  onClose={() => setShowExpectationForm(false)}
                  title={editingExpectation ? "기대평 수정" : "기대평 작성"}
                >
                  <ExpectationForm
                    mode={editingExpectation ? 'edit' : 'create'}
                    initialData={editingExpectation}
                    concertId={parsedConcertId}
                    userId={currentUser.id}
                    userNickname={currentUser.nickname}
                    onSubmit={async (formData) => {
                      if (editingExpectation) {
                        await updateExpectation(editingExpectation.id, formData);
                      } else {
                        await createExpectation(formData);
                      }
                      setShowExpectationForm(false);
                      setEditingExpectation(null);
                    }}
                    loading={expectationActionLoading}
                  />
                </Modal>

                {/* 삭제 확인 모달 */}
                <Modal
                  isOpen={!!deleteConfirm}
                  onClose={() => setDeleteConfirm(null)}
                  title="삭제 확인"
                >
                  {deleteConfirm && (
                    <div className="text-center">
                      <div className="text-6xl mb-4">🗑️</div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {deleteConfirm.type === 'review' ? '리뷰를' : '기대평을'} 삭제하시겠습니까?
                      </h3>
                      <p className="text-gray-600 mb-6">
                        "{deleteConfirm.title}"
                      </p>
                      <p className="text-sm text-red-600 mb-6">
                        삭제된 내용은 복구할 수 없습니다.
                      </p>

                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                        >
                          취소
                        </button>
                        <button
                          onClick={async () => {
                            if (deleteConfirm.type === 'review') {
                              await deleteReview(deleteConfirm.id);
                            } else {
                              await deleteExpectation(deleteConfirm.id);
                            }
                            setDeleteConfirm(null);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                          disabled={reviewActionLoading || expectationActionLoading}
                        >
                          {(reviewActionLoading || expectationActionLoading) ? '삭제 중...' : '삭제'}
                        </button>
                      </div>
                    </div>
              )}
            </Modal>
          </div>
        );
      }

      export default ConcertDetailPage;