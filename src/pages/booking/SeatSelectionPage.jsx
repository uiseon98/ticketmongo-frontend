// src\pages\booking\SeatSelection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  fetchAllSeatStatus,
  reserveSeat,
  releaseSeat,
  createBookingAndPreparePayment
} from '../../features/booking/services/bookingService';

import SeatMap from '../../features/booking/components/SeatMap';
import SeatLegend from '../../features/booking/components/SeatLegend';
import { loadTossPayments } from '@tosspayments/payment-sdk';

function SeatSelectionPage() {
  const { concertId } = useParams();
  const [seatStatuses, setSeatStatuses] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReserving, setIsReserving] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [releaseTimer, setReleaseTimer] = useState(null);
  const SEAT_RESERVE_TIMEOUT_MINUTES = 5;

  const getSeatStatuses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAllSeatStatus(concertId);
      console.log('fetchAllSeatStatus');
      console.log(response);
      setSeatStatuses(response);
    } catch (err) {
      console.error('좌석 상태를 가져오는 데 실패했습니다:', err);
      setError(err.message || '좌석 상태를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [concertId]);

  useEffect(() => {
    getSeatStatuses();
    return () => {
      if (selectedSeat) {
        releaseSeat(concertId, selectedSeat.seatId);
        if (releaseTimer) clearTimeout(releaseTimer);
      }
    };
  }, [concertId, selectedSeat, releaseTimer, getSeatStatuses]);

  const handleSeatClick = async (seat) => {
    if (seat.status === 'AVAILABLE') {
      if (selectedSeat) {
        setIsReserving(true);
        try {
          await releaseSeat(concertId, selectedSeat.seatId);
          await reserveNewSeat(seat);
        } catch {
          setSelectedSeat(null);
          getSeatStatuses();
        } finally {
          setIsReserving(false);
        }
      } else {
        await reserveNewSeat(seat);
      }
    } else if (
      seat.status === 'RESERVED' &&
      selectedSeat?.seatId === seat.seatId
    ) {
      setIsReserving(true);
      try {
        await releaseSeat(concertId, seat.seatId);
        setSelectedSeat(null);
        if (releaseTimer) clearTimeout(releaseTimer);
        getSeatStatuses();
      } catch {
        setBookingError('좌석 해제 중 오류가 발생했습니다.');
      } finally {
        setIsReserving(false);
      }
    }
  };

  const reserveNewSeat = async (seatToReserve) => {
    setIsReserving(true);
    setBookingError(null);
    try {
      const response = await reserveSeat(concertId, seatToReserve.seatId);
      setSelectedSeat(response);
      if (releaseTimer) clearTimeout(releaseTimer);
      const timer = setTimeout(() => {
        setSelectedSeat(null);
        alert('선점 시간이 만료되었습니다. 좌석을 다시 선택해주세요.');
        getSeatStatuses();
      }, SEAT_RESERVE_TIMEOUT_MINUTES * 60 * 1000);
      setReleaseTimer(timer);
      getSeatStatuses();
    } catch (err) {
      setSelectedSeat(null);
      setBookingError('좌석 선점에 실패했습니다.');
      getSeatStatuses();
    } finally {
      setIsReserving(false);
    }
  };

  const handleProceedToPayment = async () => {
    if (!selectedSeat) return setBookingError('좌석을 먼저 선택해주세요.');
    if (isReserving) return setBookingError('좌석 선점 처리 중입니다.');
    const currentSeat = seatStatuses.find(
      (s) => s.seatId === selectedSeat.seatId
    );
    if (!currentSeat || currentSeat.status !== 'RESERVED') {
      setSelectedSeat(null);
      return setBookingError('좌석 상태가 유효하지 않습니다.');
    }
    try {
      setBookingError(null);
      setIsReserving(true);
      const bookingCreateRequest = {
        concertId: parseInt(concertId),
        concertSeatIds: [selectedSeat.seatId]
      };
      const response = await createBookingAndPreparePayment(
        bookingCreateRequest
      );

      const tossPayments = await loadTossPayments(response.clientKey);
      await tossPayments.requestPayment('카드', {
        orderId: response.orderId,
        bookingNumber: response.bookingNumber,
        orderName: response.orderName,
        amount: response.amount,
        customerName: response.customerName,
        successUrl: response.successUrl,
        failUrl: response.failUrl
      });
    } catch (err) {
      setBookingError('결제 요청 실패: ' + (err.message || '알 수 없는 오류'));
      await releaseSeat(concertId, selectedSeat.seatId);
      setSelectedSeat(null);
      getSeatStatuses();
    } finally {
      setIsReserving(false);
    }
  };

  if (loading)
    return <div className="text-center py-10">좌석 정보 로딩 중...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">에러: {error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-[20px] shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        좌석 선택: 콘서트 ID {concertId}
      </h1>

      {bookingError && (
        <div className="bg-red-100 text-red-800 border border-red-400 rounded p-4 mb-4 text-sm">
          {bookingError}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* 좌석 맵 */}
        <div className="md:w-3/4 bg-gray-50 p-6 rounded-lg shadow-inner">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            좌석 배치도
          </h2>
          <SeatMap
            seatStatuses={seatStatuses}
            selectedSeat={selectedSeat}
            onSeatClick={handleSeatClick}
            isReserving={isReserving}
          />
          <div className="mt-6">
            <SeatLegend />
          </div>
        </div>

        {/* 정보 패널 */}
        <div className="md:w-1/4 bg-blue-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            선택 좌석 정보
          </h2>
          {selectedSeat ? (
            <>
              <p className="mb-2">
                <strong>좌석 ID:</strong> {selectedSeat.seatId}
              </p>
              <p className="mb-2">
                <strong>좌석 정보:</strong> {selectedSeat.seatInfo}
              </p>
              <p className="mb-2">
                <strong>상태:</strong>{' '}
                <span className="text-green-600">{selectedSeat.status}</span>
              </p>
              <p className="text-lg font-bold text-gray-900 mb-6">
                가격: 50,000원(가짜: api응답에 포함되지 않음)
              </p>
              <button
                onClick={handleProceedToPayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-[12px] text-lg transition hover:scale-[1.02]"
                disabled={isReserving}
              >
                {isReserving ? '결제 준비 중...' : '결제하기'}
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                {SEAT_RESERVE_TIMEOUT_MINUTES}분 이내에 결제해야 합니다.
              </p>
            </>
          ) : (
            <p className="text-gray-600">좌석을 선택해주세요.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SeatSelectionPage;
