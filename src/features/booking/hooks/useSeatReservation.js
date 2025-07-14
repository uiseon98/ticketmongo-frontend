// src/features/booking/hooks/useSeatReservation.js (수정된 완전 버전)

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    reserveSeat,
    releaseSeat,
    fetchAllSeatStatus,
} from '../services/bookingService';
import {
    getPollingInterval,
    isBackendPollingSupported,
    createStablePollingManager,
} from '../services/seatService';

export const useSeatReservation = (concertId, options = {}) => {
    const { enablePolling = true } = options;

    // 기존 상태들
    const [seatStatuses, setSeatStatuses] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [isReserving, setIsReserving] = useState(false);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(0);
    const [isPolling, setIsPolling] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected');

    // ✅ 새로운 상태: 로컬에서 임시로 BOOKED 처리된 좌석들
    const [localBookedSeats, setLocalBookedSeats] = useState(new Set());

    const selectedSeatsRef = useRef(selectedSeats);
    const stablePollingManagerRef = useRef(null);
    const pollingManagerRef = useRef(null); // ✅ 추가: 누락된 ref 정의
    const isStartingPollingRef = useRef(false);

    useEffect(() => {
        selectedSeatsRef.current = selectedSeats;
    }, [selectedSeats]);

    const MAX_SEATS_SELECTABLE = 2;

    // ✅ 좌석 상태 조회 시 로컬 BOOKED 상태 반영
    const getEffectiveSeatStatus = useCallback((seat) => {
        if (localBookedSeats.has(seat.seatId)) {
            return { ...seat, status: 'BOOKED' };
        }
        return seat;
    }, [localBookedSeats]);

    // 데이터 새로고침 함수 (로컬 상태 반영)
    const refreshSeatStatuses = useCallback(async () => {
        try {
            const data = await fetchAllSeatStatus(concertId);

            // ✅ 서버에서 받은 데이터에 로컬 BOOKED 상태 적용
            const effectiveData = data.map(seat => getEffectiveSeatStatus(seat));
            setSeatStatuses(effectiveData);

            const myReservedSeats = effectiveData.filter(
                (s) => s.isReservedByCurrentUser,
            );
            setSelectedSeats(myReservedSeats);

            // ✅ 서버에서 실제로 BOOKED된 좌석은 로컬 BOOKED에서 제거
            const serverBookedSeatIds = data
                .filter(seat => seat.status === 'BOOKED')
                .map(seat => seat.seatId);

            setLocalBookedSeats(prev => {
                const newSet = new Set(prev);
                serverBookedSeatIds.forEach(seatId => newSet.delete(seatId));
                return newSet;
            });

        } catch (err) {
            setError(err.message || '좌석 정보를 새로고침하지 못했습니다.');
        }
    }, [concertId, getEffectiveSeatStatus]);

    // ✅ 결제 성공 시 호출되는 함수
    const handlePaymentSuccess = useCallback((paidSeats) => {
        console.log('🎉 결제 성공 - 좌석을 로컬에서 BOOKED 처리:', paidSeats);

        const paidSeatIds = paidSeats.map(seat => seat.seatId);

        // 로컬에서 즉시 BOOKED 처리
        setLocalBookedSeats(prev => {
            const newSet = new Set(prev);
            paidSeatIds.forEach(seatId => newSet.add(seatId));
            return newSet;
        });

        // 좌석 상태 즉시 업데이트
        setSeatStatuses(prev =>
            prev.map(seat =>
                paidSeatIds.includes(seat.seatId)
                    ? { ...seat, status: 'BOOKED', isReservedByCurrentUser: false }
                    : seat
            )
        );

        // 선택된 좌석 초기화
        setSelectedSeats([]);
        setTimer(0);

        // 백그라운드에서 서버 상태 동기화 (에러가 발생해도 UI에는 영향 없음)
        setTimeout(() => {
            refreshSeatStatuses().catch(console.error);
        }, 1000);

    }, [refreshSeatStatuses]);

    // ✅ 좌석 해제 함수들 (먼저 정의)
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

    // ✅ 좌석 클릭 핸들러 (개선된 버전 - 로컬 BOOKED 상태 체크 포함)
    const handleSeatClick = useCallback(
        async (seat) => {
            // 로컬에서 BOOKED 처리된 좌석은 클릭 불가
            if (localBookedSeats.has(seat.seatId)) {
                setError('이미 예매 완료된 좌석입니다.');
                return;
            }

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
                await refreshSeatStatuses();
            } catch (err) {
                setError(err.message);

                // ✅ 에러 발생 시 서버 상태 강제 동기화
                setTimeout(() => {
                    refreshSeatStatuses().catch(console.error);
                }, 500);
            } finally {
                setIsReserving(false);
            }
        },
        [concertId, selectedSeats, localBookedSeats, refreshSeatStatuses],
    );

    const handleRemoveSeat = useCallback(
        (seatId) => {
            const seatToRemove = selectedSeats.find((s) => s.seatId === seatId);
            if (seatToRemove)
                handleSeatClick(seatToRemove).catch(console.error);
        },
        [selectedSeats, handleSeatClick],
    );

    // 폴링 사이클 실행 함수 (폴백용 - 일반 새로고침 모드)
    const executePollingCycle = useCallback(async () => {
        try {
            console.log('🔥 좌석 상태 새로고침 사이클 시작');
            await refreshSeatStatuses();
            setError(null);
            setConnectionStatus('connected');
        } catch (error) {
            console.error('🔥 폴링 사이클 에러:', error);
            setError(error.message);
            setConnectionStatus('error');
        }
    }, [refreshSeatStatuses]);

    // ✅ 폴링 시스템 (원래 간격으로 복구)
    const startPolling = useCallback(async () => {
        if (isStartingPollingRef.current || isPolling || !enablePolling) {
            return;
        }

        isStartingPollingRef.current = true;

        try {
            if (stablePollingManagerRef.current) {
                stablePollingManagerRef.current.stop();
                stablePollingManagerRef.current = null;
            }
            if (pollingManagerRef.current) {
                pollingManagerRef.current = null;
            }

            setIsPolling(true);
            setConnectionStatus('connecting');

            if (isBackendPollingSupported()) {
                console.log('🔥 폴링 시스템 시작 (35초 간격)');

                const stableManager = createStablePollingManager(concertId, {
                    onUpdate: (seatUpdates) => {
                        console.log('🔥 좌석 업데이트 수신:', seatUpdates);
                        refreshSeatStatuses();
                    },
                    onError: (error) => {
                        console.error('🔥 폴링 에러:', error);
                        setError(error.message);
                        setConnectionStatus('error');
                    },
                    onStatusChange: (isConnected) => {
                        setConnectionStatus(
                            isConnected ? 'connected' : 'disconnected',
                        );
                    },
                });

                stablePollingManagerRef.current = stableManager;
                stableManager.start();

                pollingManagerRef.current = {
                    stopPolling: () => {
                        stableManager.stop();
                        setIsPolling(false);
                        setConnectionStatus('disconnected');
                    },
                };
            } else {
                // ✅ 복구: 원래 간격 사용
                console.log('🔥 백엔드 Long Polling 비활성화 - 일반 주기적 새로고침 모드');
                const pollingInterval = getPollingInterval(); // ✅ 35초로 복구
                console.log(`🔥 ${pollingInterval / 1000}초 주기 좌석 상태 새로고침 시스템 시작`);

                pollingManagerRef.current = {
                    stopPolling: () => {
                        setIsPolling(false);
                        setConnectionStatus('disconnected');
                    },
                };

                // 즉시 한 번 실행
                await executePollingCycle();

                // 폴링 루프
                const runPollingLoop = async () => {
                    let cycleCount = 0;
                    while (isPolling && enablePolling) {
                        cycleCount++;
                        console.log(`🔥 폴링 사이클 #${cycleCount} 대기 중...`);

                        // ✅ 원래 간격으로 대기
                        await new Promise((resolve) =>
                            setTimeout(resolve, pollingInterval),
                        );

                        if (!isPolling || !enablePolling) {
                            console.log('🔥 폴링 루프 중단');
                            break;
                        }

                        await executePollingCycle();
                    }
                    console.log('🔥 폴링 루프 종료');
                };

                runPollingLoop();
            }

            setConnectionStatus('connected');
        } finally {
            isStartingPollingRef.current = false;
        }
    }, [concertId, isPolling, enablePolling, executePollingCycle]);

    // 폴링 시스템 정지 함수
    const stopPolling = useCallback(() => {
        console.log('🔥 폴링 시스템 중지');
        setIsPolling(false);
        setConnectionStatus('disconnected');
        isStartingPollingRef.current = false;

        if (stablePollingManagerRef.current) {
            stablePollingManagerRef.current.stop();
            stablePollingManagerRef.current = null;
        }

        pollingManagerRef.current = null;
    }, []);

    // ✅ 타이머 로직 (dependencies 수정)
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
    }, [timer, handleClearSelection]); // ✅ dependencies 수정

    // 언마운트 시 정리
    useEffect(() => {
        return () => {
            if (stablePollingManagerRef.current) {
                stablePollingManagerRef.current.stop();
            }
            if (pollingManagerRef.current) {
                pollingManagerRef.current.stopPolling();
            }
            if (selectedSeatsRef.current.length > 0) {
                selectedSeatsRef.current.forEach((seat) => {
                    releaseSeat(concertId, seat.seatId).catch(console.error);
                });
            }
        };
    }, [concertId]);

    // 좌석 복구 후 상태 초기화 함수
    const handleRestoreComplete = useCallback(async () => {
        try {
            setSelectedSeats([]);
            setTimer(0);
            setError(null);
            await refreshSeatStatuses();
            console.log('좌석 복구 후 상태 초기화 완료');
        } catch (err) {
            console.error('좌석 복구 후 상태 초기화 실패:', err);
            setError(err.message);
        }
    }, [refreshSeatStatuses]);

    // 폴링 상태 정보 가져오기
    const getPollingStatus = useCallback(() => {
        if (stablePollingManagerRef.current) {
            return stablePollingManagerRef.current.getStatus();
        }
        return {
            isPolling: isPolling,
            retryCount: 0,
            lastUpdateTime: null,
        };
    }, [isPolling]);

    return {
        seatStatuses,
        selectedSeats,
        isReserving,
        error,
        timer,
        isPolling,
        connectionStatus,
        pollingStatus: getPollingStatus(),
        refreshSeatStatuses,
        startPolling,
        stopPolling,
        handleSeatClick,
        handleRemoveSeat,
        handleClearSelection,
        handleRestoreComplete,
        handlePaymentSuccess, // ✅ 새로 추가된 함수
    };
};