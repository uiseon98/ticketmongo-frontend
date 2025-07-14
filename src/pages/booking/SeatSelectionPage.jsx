// src/pages/booking/SeatSelectionPage.jsx

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

    // 1. 훅을 호출하여 좌석 관련 모든 상태와 함수를 가져옵니다.
    const {
        seatStatuses,
        selectedSeats,
        error: reservationError, // 페이지 에러와 구분하기 위해 이름 변경
        timer,
        isPolling,
        refreshSeatStatuses,
        startPolling,
        stopPolling,
        handleSeatClick,
        handleRemoveSeat,
        handleClearSelection,
    } = useSeatReservation(concertId, { enablePolling: true }); // 폴링 활성화 (JWT 토큰 실제 만료 시간 확인을 위해)

    // 2. 페이지 최초 로드 시, 콘서트 정보와 좌석 정보를 모두 로드합니다.
    useEffect(() => {
        const loadPageData = async () => {
            setPageLoading(true);
            setPageError(null);
            try {
                const concertData =
                    await concertService.getConcertById(concertId);
                setConcertInfo(concertData.data);
                await refreshSeatStatuses(); // 훅 내부의 함수를 호출해 좌석 정보 로드

                // 폴링 시스템 시작 (JWT 토큰 만료 시간 확인을 위해)
                try {
                    await startPolling();
                } catch (error) {
                    console.log('폴링 시스템 시작 실패:', error);
                }
            } catch (err) {
                setPageError(
                    err.message || '페이지 데이터를 불러오지 못했습니다.',
                );
            } finally {
                setPageLoading(false);
            }
        };
        loadPageData();
    }, [concertId, refreshSeatStatuses, startPolling]);

    // 3. 페이지 언마운트 시 폴링 정리
    useEffect(() => {
        return () => {
            stopPolling();
        };
    }, [stopPolling]);

    const handleCheckout = async () => {
        // 결제 전 좌석 선점 상태 확인
        if (selectedSeats.length === 0) {
            alert('선택된 좌석이 없습니다.');
            return;
        }

        // 타이머 확인 - 선점 시간이 만료되었는지 체크
        if (timer <= 0) {
            alert('좌석 선점 시간이 만료되었습니다. 다시 선택해주세요.');
            handleClearSelection();
            return;
        }

        try {
            await proceedToPayment(concertId, selectedSeats);
            alert('결제가 성공적으로 완료되었습니다.');
            // 결제 성공 시 성공 페이지로 이동하는 로직 (필요 시)
        } catch (error) {
            // 결제 훅에서 에러가 발생하면, 여기서 좌석 복구 로직을 실행
            console.error('결제 실패:', error);
            if (error.message.includes('사용자가 결제를 취소했습니다.')) {
                alert('결제가 취소되었습니다.');
            } else {
                alert(`결제에 실패했습니다: ${error.message}`);
            }

            // 현재 선택된 좌석이 있는 경우 좌석 해제 API 호출
            if (selectedSeats.length > 0) {
                try {
                    // 좌석 해제 API 호출
                    await handleClearSelection();
                    console.log('좌석 해제 API 호출 성공');
                } catch (error) {
                    console.error('좌석 해제 실패:', error);
                    // 좌석 해제 실패 시에도 상태 새로고침
                    await refreshSeatStatuses();
                }
            } else {
                // 선택된 좌석이 없는 경우 단순히 상태만 새로고침
                console.log('선택된 좌석이 없어 상태만 새로고침합니다.');
                await refreshSeatStatuses();
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
                {reservationError && (
                    <ErrorMessage message={reservationError} />
                )}

                {/* 수동 새로고침 버튼 */}
                <div className="mb-4 flex justify-end">
                    <button
                        onClick={refreshSeatStatuses}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        disabled={pageLoading}
                    >
                        {pageLoading ? '새로고침 중...' : '좌석 상태 새로고침'}
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
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
