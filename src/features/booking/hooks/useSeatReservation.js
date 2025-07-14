// src/features/booking/hooks/useSeatReservation.js

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    reserveSeat,
    releaseSeat,
    fetchAllSeatStatus,
} from '../services/bookingService';
import {
    getPollingInterval,
    isBackendPollingSupported,
    pollSeatStatus,
    createStablePollingManager,
} from '../services/seatService';
import apiClient from '../../../shared/utils/apiClient';

export const useSeatReservation = (concertId, options = {}) => {
    const { enablePolling = true } = options;
    // 1. 모든 관련 상태는 훅 내에서만 관리합니다.
    const [seatStatuses, setSeatStatuses] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [isReserving, setIsReserving] = useState(false);
    const [error, setError] = useState(null);
    const [timer, setTimer] = useState(0);
    const [isPolling, setIsPolling] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected', 'error'

    const selectedSeatsRef = useRef(selectedSeats);
    const pollingManagerRef = useRef(null);
    const stablePollingManagerRef = useRef(null);
    const isStartingPollingRef = useRef(false);

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

    // 폴링 시스템 시작 함수
    const startPolling = useCallback(async () => {
        // 중복 호출 방지
        if (isStartingPollingRef.current || isPolling || !enablePolling) {
            return;
        }

        // 시작 플래그 설정
        isStartingPollingRef.current = true;

        try {
            // 기존 폴링 세션 정리
            if (stablePollingManagerRef.current) {
                stablePollingManagerRef.current.stop();
                stablePollingManagerRef.current = null;
            }
            if (pollingManagerRef.current) {
                pollingManagerRef.current = null;
            }

            setIsPolling(true);
            setConnectionStatus('connecting');

            // 단순 주기적 폴링 시스템 사용
            if (isBackendPollingSupported()) {
                console.log('🔥 폴링 시스템 시작 (35초 간격)');

                // 폴링 매니저 생성
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
                // 폴백: 일반 주기적 새로고침
                console.log(
                    '🔥 백엔드 Long Polling 비활성화 - 일반 주기적 새로고침 모드',
                );

                const pollingInterval = getPollingInterval();
                console.log(
                    `🔥 ${pollingInterval / 1000}초 주기 좌석 상태 새로고침 시스템 시작`,
                );

                // 폴링 관리 객체 저장 (먼저 설정)
                pollingManagerRef.current = {
                    stopPolling: () => {
                        setIsPolling(false);
                        setConnectionStatus('disconnected');
                    },
                };

                // 즉시 한 번 실행
                await executePollingCycle();

                // 폴링 사이클을 순차적으로 실행하는 함수
                const runPollingLoop = async () => {
                    let cycleCount = 0;
                    while (isPolling && enablePolling) {
                        cycleCount++;
                        console.log(`🔥 폴링 사이클 #${cycleCount} 대기 중...`);

                        // 다음 폴링까지 설정된 간격 대기
                        const pollingInterval = getPollingInterval();
                        await new Promise((resolve) =>
                            setTimeout(resolve, pollingInterval),
                        );

                        // 상태 재확인
                        if (!isPolling || !enablePolling) {
                            console.log('🔥 폴링 루프 중단:', {
                                isPolling,
                                enablePolling,
                            });
                            break;
                        }

                        await executePollingCycle();
                    }
                    console.log('🔥 폴링 루프 종료');
                };

                // 폴링 루프 시작 (비동기)
                runPollingLoop();
            }

            setConnectionStatus('connected');
        } finally {
            // 시작 플래그 해제
            isStartingPollingRef.current = false;
        }
    }, [concertId, isPolling, enablePolling, refreshSeatStatuses]);

    // 폴링 사이클 실행 함수 (폴백용 - 일반 새로고침 모드)
    const executePollingCycle = useCallback(async () => {
        try {
            console.log('🔥 좌석 상태 새로고침 사이클 시작');

            // refreshSeatStatuses 호출 (실시간 좌석 상태 동기화)
            console.log('🔥 refreshSeatStatuses 호출');
            await refreshSeatStatuses();

            setError(null);
            setConnectionStatus('connected');
        } catch (error) {
            console.error('🔥 폴링 사이클 에러:', error);
            setError(error.message);
            setConnectionStatus('error');
        }
    }, [concertId, refreshSeatStatuses]);

    // 폴링 시스템 정지 함수
    const stopPolling = useCallback(() => {
        console.log('🔥 폴링 시스템 중지');
        setIsPolling(false);
        setConnectionStatus('disconnected');

        // 시작 플래그도 해제
        isStartingPollingRef.current = false;

        // 안정적인 폴링 매니저 정리
        if (stablePollingManagerRef.current) {
            stablePollingManagerRef.current.stop();
            stablePollingManagerRef.current = null;
        }

        pollingManagerRef.current = null;
    }, []);

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

    // 언마운트 시 좌석 해제 및 폴링 정리
    useEffect(() => {
        return () => {
            // 폴링 정리
            if (stablePollingManagerRef.current) {
                stablePollingManagerRef.current.stop();
            }
            if (pollingManagerRef.current) {
                pollingManagerRef.current.stopPolling();
            }

            // 좌석 해제
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

    // 좌석 복구 후 상태 초기화 함수
    const handleRestoreComplete = useCallback(async () => {
        try {
            // 먼저 상태를 완전히 초기화
            setSelectedSeats([]);
            setTimer(0);
            setError(null);

            // 그 다음 서버 상태 동기화
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

    // 4. 페이지에서 필요한 모든 것을 반환합니다.
    return {
        seatStatuses,
        selectedSeats,
        isReserving,
        error,
        timer,
        isPolling,
        connectionStatus, // 연결 상태: 'disconnected', 'connecting', 'connected', 'error'
        pollingStatus: getPollingStatus(), // 폴링 상세 상태
        refreshSeatStatuses, // 페이지가 최초 로드 시 호출할 함수
        startPolling, // 폴링 시스템 시작 함수
        stopPolling, // 폴링 시스템 정지 함수
        handleSeatClick,
        handleRemoveSeat,
        handleClearSelection,
        handleRestoreComplete, // 좌석 복구 후 상태 초기화 함수
    };
};
