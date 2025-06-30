// src/pages/concert/ConcertDetailPage.jsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// 새로운 컴포넌트들 import
import ConcertDetail from '../../features/concert/components/ConcertDetail.jsx';
import AISummary from '../../features/concert/components/AISummary.jsx';
import ReviewList from '../../features/concert/components/ReviewList.jsx';
import ExpectationList from '../../features/concert/components/ExpectationList.jsx';

// 새로운 hooks import
import { useConcertDetail } from '../../features/concert/hooks/useConcertDetail.js';
import { useReviews } from '../../features/concert/hooks/useReviews.js';
import { useExpectations } from '../../features/concert/hooks/useExpectations.js';

function ConcertDetailPage() {
  const { concertId } = useParams();
  const navigate = useNavigate();

  // 콘서트 상세 정보 hook
  const {
    concert,
    aiSummary,
    loading: concertLoading,
    error: concertError,
    fetchAISummary,
    aiSummaryLoading
  } = useConcertDetail(parseInt(concertId));

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
    sortDir: reviewsSortDir
  } = useReviews(parseInt(concertId));

  // 기대평 목록 hook
  const {
    expectations,
    loading: expectationsLoading,
    error: expectationsError,
    currentPage: expectationsPage,
    totalPages: expectationsTotalPages,
    totalElements: expectationsTotal,
    goToPage: goToExpectationsPage
  } = useExpectations(parseInt(concertId));

  // 예매하기 버튼 클릭 핸들러
  const handleReserveClick = () => {
    navigate(`/concerts/${concertId}/reserve`);
  };

  // 리뷰 클릭 핸들러 (상세보기나 수정 등)
  const handleReviewClick = (review) => {
    console.log('리뷰 클릭:', review);
    // 추후 리뷰 상세 모달이나 페이지로 이동 구현
  };

  // 기대평 클릭 핸들러
  const handleExpectationClick = (expectation) => {
    console.log('기대평 클릭:', expectation);
    // 추후 기대평 상세 모달이나 수정 구현
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
            />
          </div>

          {/* 기대평 목록 컴포넌트 */}
          <div className="bg-white rounded-xl shadow-md p-6">
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
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition hover:scale-[1.02]"
            disabled={concert.status === 'SOLD_OUT' || concert.status === 'CANCELLED'}
          >
            {concert.status === 'SOLD_OUT' ? '매진' :
             concert.status === 'CANCELLED' ? '취소됨' :
             concert.status === 'SCHEDULED' ? '예매 대기' : '예매하기'}
          </button>

          {/* 콘서트 상태 표시 */}
          <div className="text-center text-sm text-gray-600 mt-2">
            현재 상태: <span className={`font-semibold ${
              concert.status === 'ON_SALE' ? 'text-green-600' :
              concert.status === 'SOLD_OUT' ? 'text-red-600' :
              concert.status === 'CANCELLED' ? 'text-gray-600' :
              'text-yellow-600'
            }`}>
              {concert.status === 'SCHEDULED' ? '예매 대기' :
               concert.status === 'ON_SALE' ? '예매 중' :
               concert.status === 'SOLD_OUT' ? '매진' :
               concert.status === 'CANCELLED' ? '취소됨' :
               concert.status === 'COMPLETED' ? '공연 완료' : concert.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConcertDetailPage;