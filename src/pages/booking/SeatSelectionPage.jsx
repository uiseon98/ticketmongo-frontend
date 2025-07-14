// src/pages/booking/SeatSelectionPage.jsx (개선된 버전)

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { concertService } from '../../features/concert/services/concertService';
import { usePayment } from '../../features/booking/hooks/usePayment';
import { useSeatReservation } from '../../features/booking/hooks/useSeatReservation';
import ConcertInfoHeader from '../../features/booking/components/ConcertInfoHeader';
import SeatMap from '../../features/booking/components/SeatMap';
import SelectionPanel from '../../features/booking/components/SelectionPanel';
import LoadingSpinner from '../../shared/components/ui/LoadingSpinner';
import ErrorMessage from '../../shared/components/ui/ErrorMessage';

export default function SeatSelectionPage() {
    const { concertId } = useParams();
    const [concertInfo, setConcertInfo] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);
    const [pageError, setPageError] = useState(null);
    const { proceedToPayment, isProcessing, paymentError } = usePayment();

    // ✅ handlePaymentSuccess 함수를 받아옴
    const {
        seatStatuses,
        selectedSeats,
        error: reservationError,
        timer,
        isPolling,
        refreshSeatStatuses,
        startPolling,
        stopPolling,
        handleSeatClick,
        handleRemoveSeat,
        handleClearSelection,
        handlePaymentSuccess, // ✅ 새로 추가
    } = useSeatReservation(concertId, { enablePolling: true });

    // 페이지 최초 로드
    useEffect(() => {
        const loadPageData = async () => {
            setPageLoading(true);
            setPageError(null);
            try {
                const concertData = await concertService.getConcertById(concertId);
                setConcertInfo(concertData.data);
                await refreshSeatStatuses();

                try {
                    await startPolling();
                } catch (error) {
                    console.log('폴링 시스템 시작 실패:', error);
                }
            } catch (err) {
                setPageError(err.message || '페이지 데이터를 불러오지 못했습니다.');
            } finally {
                setPageLoading(false);
            }
        };
        loadPageData();
    }, [concertId, refreshSeatStatuses, startPolling]);

    // 페이지 언마운트 시 폴링 정리
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    // SeatSelectionPage.jsx에 추가
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (selectedSeats.length > 0) {
                // 동기적으로 좌석 해제 요청
                navigator.sendBeacon(
                    `/api/seats/concerts/${concertId}/release-all`,
                    JSON.stringify({ seatIds: selectedSeats.map(s => s.seatId) })
                );
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [selectedSeats, concertId]);

    // ✅ 개선된 결제 핸들러
    const handleCheckout = async () => {
        // 기본 검증
        if (selectedSeats.length === 0) {
            alert('선택된 좌석이 없습니다.');
            return;
        }

        if (timer <= 0) {
            alert('좌석 선점 시간이 만료되었습니다. 다시 선택해주세요.');
            handleClearSelection();
            return;
        }

        // ✅ 결제 전 좌석 상태 재검증
        console.log('🔍 결제 전 좌석 상태 재검증 시작...');
        try {
            await refreshSeatStatuses();

            // 선택된 좌석이 여전히 유효한지 확인
            const currentSeatStatuses = seatStatuses;
            const invalidSeats = selectedSeats.filter(selectedSeat => {
                const currentSeat = currentSeatStatuses.find(s => s.seatId === selectedSeat.seatId);
                return !currentSeat || currentSeat.status !== 'RESERVED' || !currentSeat.isReservedByCurrentUser;
            });

            if (invalidSeats.length > 0) {
                alert('선택된 좌석 중 일부가 이미 다른 사용자에게 할당되었습니다. 좌석을 다시 선택해주세요.');
                await refreshSeatStatuses();
                return;
            }

        } catch (error) {
            console.error('좌석 상태 재검증 실패:', error);
            alert('좌석 상태를 확인할 수 없습니다. 잠시 후 다시 시도해주세요.');
            return;
        }

        try {
            // ✅ 결제 성공 콜백과 함께 결제 진행
            await proceedToPayment(concertId, selectedSeats, handlePaymentSuccess);

            console.log('✅ 결제 성공 처리 완료');

        } catch (error) {
            console.error('💳 결제 실패:', error);

            if (error.message.includes('사용자가 결제를 취소했습니다.')) {
                alert('결제가 취소되었습니다.');
                // 결제 취소는 좌석을 유지
                return;
            }

            // ✅ 결제 실패 시 더 구체적인 에러 처리
            if (error.message.includes('좌석에 이미 티켓이 할당됨')) {
                alert('선택하신 좌석이 이미 다른 사용자에게 판매되었습니다. 좌석을 다시 선택해주세요.');
                await handleClearSelection();
                await refreshSeatStatuses();
            } else if (error.message.includes('재고 부족') || error.message.includes('SOLD_OUT')) {
                alert('선택하신 좌석이 매진되었습니다. 다른 좌석을 선택해주세요.');
                await refreshSeatStatuses();
            } else {
                alert(`결제에 실패했습니다: ${error.message}`);

                // 일반적인 결제 실패 시 좌석 해제
                if (selectedSeats.length > 0) {
                    try {
                        await handleClearSelection();
                    } catch (releaseError) {
                        console.error('좌석 해제 실패:', releaseError);
                        await refreshSeatStatuses();
                    }
                }
            }
        }
    };

    if (pageLoading)
        return <LoadingSpinner message="콘서트 정보를 불러오는 중..." />;
    if (pageError) return <ErrorMessage message={pageError} />;

    return (
        <div className="bg-[#111922] min-h-screen text-white p-4 sm:p-6 lg:p-8">
            <div className="max-w-screen-2xl mx-auto">
                <ConcertInfoHeader concertInfo={concertInfo} />

                {/* ✅ 에러 메시지 개선 */}
                {(reservationError || paymentError) && (
                    <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                        <p className="text-red-200">
                            {reservationError || paymentError}
                        </p>
                        <button
                            onClick={() => refreshSeatStatuses()}
                            className="mt-2 text-sm text-blue-300 hover:text-blue-100 underline"
                        >
                            좌석 상태 새로고침
                        </button>
                    </div>
                )}

                {/* ✅ 연결 상태 표시 개선 */}
                <div className="mb-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                            isPolling ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
                        }`}></div>
                        <span className="text-sm text-gray-400">
                            {isPolling ? '실시간 동기화 중' : '동기화 중단'}
                        </span>
                    </div>

                    <button
                        onClick={refreshSeatStatuses}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        disabled={pageLoading}
                    >
                        {pageLoading ? '새로고침 중...' : '수동 새로고침'}
                    </button>
                </div>

                <div className="mt-8 flex flex-col lg:flex-row gap-8">
                    <div className="flex-grow lg:w-2/3">
                        <SeatMap
                            seatStatuses={seatStatuses}
                            selectedSeats={selectedSeats}
                            onSeatClick={handleSeatClick}
                        />
                    </div>
                    <div className="lg:w-1/3 lg:max-w-sm">
                        <SelectionPanel
                            selectedSeats={selectedSeats}
                            timer={timer}
                            onClear={handleClearSelection}
                            onRemove={handleRemoveSeat}
                            onCheckout={handleCheckout}
                            isProcessing={isProcessing} // ✅ 결제 중 상태 전달
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}