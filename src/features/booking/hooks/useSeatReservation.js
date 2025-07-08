// src/features/booking/hooks/useSeatReservation.js

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    reserveSeat,
    releaseSeat,
    fetchAllSeatStatus,
} from '../services/bookingService';

export const useSeatReservation = (concertId) => {
    // 1. 모든 관련 상태는 훅 내에서만 관리합니다.
    const [seatStatuses, setSeatStatuses] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [isReserving, setIsReserving] = useState(false);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(0);

    const selectedSeatsRef = useRef(selectedSeats);
    useEffect(() => {
        selectedSeatsRef.current = selectedSeats;
    }, [selectedSeats]);

    const MAX_SEATS_SELECTABLE = 2;

    // 2. 데이터 새로고침 함수를 훅 내부에 정의합니다.
    const refreshSeatStatuses = useCallback(async () => {
        try {
            const data = await fetchAllSeatStatus(concertId);
            setSeatStatuses(data);
            const myReservedSeats = data.filter(
                (s) => s.isReservedByCurrentUser,
            );
            setSelectedSeats(myReservedSeats);
        } catch (err) {
            setError(err.message || '좌석 정보를 새로고침하지 못했습니다.');
        }
    }, [concertId]);

    // 타이머 로직 (이전과 동일)
    useEffect(() => {
        if (selectedSeats.length > 0 && timer === 0) {
            const minSeconds = Math.min(
                ...selectedSeats.map((s) => s.remainingSeconds),
            );
            setTimer(minSeconds > 0 ? minSeconds : 0);
        } else if (selectedSeats.length === 0) {
            setTimer(0);
        }
    }, [selectedSeats]);

    useEffect(() => {
        if (timer <= 0) {
            if (selectedSeatsRef.current.length > 0) {
                alert('선점 시간이 만료되었습니다.');
                handleClearSelection().catch(console.error);
            }
            return;
        }
        const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // 언마운트 시 좌석 해제
    useEffect(() => {
        return () => {
            if (selectedSeatsRef.current.length > 0) {
                selectedSeatsRef.current.forEach((seat) => {
                    releaseSeat(concertId, seat.seatId).catch(console.error);
                });
            }
        };
    }, [concertId]);

    // 3. 모든 핸들러 함수를 훅 내부에 정의합니다.
    const handleSeatClick = useCallback(
        async (seat) => {
            setIsReserving(true);
            setError(null);
            try {
                const isSelected = selectedSeats.some(
                    (s) => s.seatId === seat.seatId,
                );
                if (isSelected) {
                    await releaseSeat(concertId, seat.seatId);
                } else {
                    if (seat.status !== 'AVAILABLE')
                        throw new Error('선택 불가 좌석');
                    if (selectedSeats.length >= MAX_SEATS_SELECTABLE)
                        throw new Error(
                            `최대 ${MAX_SEATS_SELECTABLE}석 선택 가능`,
                        );
                    await reserveSeat(concertId, seat.seatId);
                }
                await refreshSeatStatuses(); // 상태 동기화
            } catch (err) {
                setError(err.message);
            } finally {
                setIsReserving(false);
            }
        },
        [concertId, selectedSeats, refreshSeatStatuses],
    );

    const handleClearSelection = useCallback(async () => {
        setIsReserving(true);
        try {
            await Promise.all(
                selectedSeats.map((seat) =>
                    releaseSeat(concertId, seat.seatId),
                ),
            );
            await refreshSeatStatuses();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsReserving(false);
        }
    }, [concertId, selectedSeats, refreshSeatStatuses]);

    const handleRemoveSeat = useCallback(
        (seatId) => {
            const seatToRemove = selectedSeats.find((s) => s.seatId === seatId);
            if (seatToRemove)
                handleSeatClick(seatToRemove).catch(console.error);
        },
        [selectedSeats, handleSeatClick],
    );

    // 4. 페이지에서 필요한 모든 것을 반환합니다.
    return {
        seatStatuses,
        selectedSeats,
        isReserving,
        error,
        timer,
        refreshSeatStatuses, // 페이지가 최초 로드 시 호출할 함수
        handleSeatClick,
        handleRemoveSeat,
        handleClearSelection,
    };
};
