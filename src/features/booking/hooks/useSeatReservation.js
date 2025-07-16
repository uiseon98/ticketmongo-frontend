// src/features/booking/hooks/useSeatReservation.js

import { useState, useEffect, useRef, useCallback } from 'react';
import {
    reserveSeat,
    releaseSeat,
    fetchAllSeatStatus,
    extendAccessKey,
    invalidateAccessKey,
} from '../services/bookingService';
import {
    getPollingInterval,
    isBackendPollingSupported,
    createStablePollingManager,
} from '../services/seatService';

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
            setError(
                err.message || '좌석 정보를 가져오는 중 문제가 발생했습니다.',
            );
        }
    }, [concertId]);

    // 좌석 상태 부분 업데이트 함수 (실시간 폴링용)
    const updateSeatStatuses = useCallback((seatUpdates) => {
        console.log('🔥 좌석 상태 부분 업데이트:', seatUpdates);

        setSeatStatuses((prevSeats) => {
            const updatedSeats = [...prevSeats];

            // 받은 업데이트 데이터로 해당 좌석들만 업데이트
            seatUpdates.forEach((updatedSeat) => {
                const index = updatedSeats.findIndex(
                    (seat) => seat.seatId === updatedSeat.seatId,
                );
                if (index !== -1) {
                    updatedSeats[index] = {
                        ...updatedSeats[index],
                        ...updatedSeat,
                    };
                    console.log(
                        `🔥 좌석 ${updatedSeat.seatId} 상태 업데이트: ${updatedSeats[index].status}`,
                    );
                }
            });

            // 내가 선점한 좌석 목록도 함께 업데이트
            const myReservedSeats = updatedSeats.filter(
                (s) => s.isReservedByCurrentUser,
            );
            setSelectedSeats(myReservedSeats);

            return updatedSeats;
        });
    }, []);

    // 간단한 폴링 - 복잡한 하이브리드 로직 제거
    const triggerImmediatePolling = useCallback(() => {
        // 복잡한 로직 제거, 단순히 로그만 남김
        console.log('🚀 사용자 액션 발생 (폴링은 35초 주기로 계속 실행)');
    }, []);

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
                    onUpdate: () => {
                        console.log(
                            '🔥 폴링 업데이트 트리거 - 전체 좌석 상태 새로고침',
                        );
                        // 항상 전체 새로고침으로 누락 방지
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
    }, [
        concertId,
        isPolling,
        enablePolling,
        refreshSeatStatuses,
        updateSeatStatuses,
    ]);

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

    useEffect(() => {
        // 1분에 한 번씩 액세스키 연장 API를 호출하는 인터벌 설정
        const EXTENSION_INTERVAL_MS = 60 * 1000; // 1분

        console.log('[AccessKey] 페이지 진입. 자동 연장 시스템을 시작합니다.');
        const intervalId = setInterval(() => {
            console.log('[AccessKey] 주기적인 자동 연장을 시도합니다.');
            extendAccessKey(concertId).catch((err) => {
                console.warn(
                    '액세스 키 자동 연장에 실패했습니다:',
                    err.message,
                );
            });
        }, EXTENSION_INTERVAL_MS);

        // 페이지를 이탈하면(언마운트 시) 인터벌을 정리합니다.
        return () => {
            console.log(
                '[AccessKey] 페이지 이탈. 자동 연장 시스템을 중단합니다.',
            );
            clearInterval(intervalId);
        };
    }, [concertId]);

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
            console.log('[AccessKey] 페이지 이탈. 액세스키를 폐기합니다.');
            invalidateAccessKey(concertId).catch((err) => {
                console.warn(
                    '페이지 이탈 시 액세스키 폐기 중 오류 발생:',
                    err.message,
                );
            });
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
                    if (selectedSeats.length >= MAX_SEATS_SELECTABLE) {
                        throw new Error(
                            '좌석은 최대 2개까지 선점할 수 있습니다.',
                        );
                    }
                    if (seat.status !== 'AVAILABLE')
                        throw new Error(
                            '다른 유저가 선점 중인 좌석입니다. 다른 좌석을 선택해 주세요.',
                        );
                    await reserveSeat(concertId, seat.seatId);
                }
                await refreshSeatStatuses(); // 상태 동기화

                // 좌석 액션 후 즉시 폴링 트리거
                triggerImmediatePolling();
            } catch (err) {
                setError(err.message);
            } finally {
                setIsReserving(false);
            }
        },
        [
            concertId,
            selectedSeats,
            refreshSeatStatuses,
            triggerImmediatePolling,
        ],
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

            // 전체 해제 액션 후 즉시 폴링 트리거
            triggerImmediatePolling();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsReserving(false);
        }
    }, [
        concertId,
        selectedSeats,
        refreshSeatStatuses,
        triggerImmediatePolling,
    ]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

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
        triggerImmediatePolling, // 즉시 폴링 트리거 함수
        handleSeatClick,
        handleRemoveSeat,
        handleClearSelection,
        handleRestoreComplete, // 좌석 복구 후 상태 초기화 함수
        clearError, // 에러 상태 초기화 함수
    };
};
