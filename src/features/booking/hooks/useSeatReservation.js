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
    
    // 하이브리드 폴링을 위한 상태 추가
    const [pollingState, setPollingState] = useState('normal'); // 'normal', 'burst', 'waiting'
    const pollingStartTimeRef = useRef(null);
    const triggerDebounceRef = useRef(null);

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
            setError(err.message || '좌석 정보를 가져오는 중 문제가 발생했습니다.');
        }
    }, [concertId]);

    // 좌석 상태 부분 업데이트 함수 (실시간 폴링용)
    const updateSeatStatuses = useCallback((seatUpdates) => {
        console.log('🔥 좌석 상태 부분 업데이트:', seatUpdates);
        
        setSeatStatuses(prevSeats => {
            const updatedSeats = [...prevSeats];
            
            // 받은 업데이트 데이터로 해당 좌석들만 업데이트
            seatUpdates.forEach(updatedSeat => {
                const index = updatedSeats.findIndex(seat => seat.seatId === updatedSeat.seatId);
                if (index !== -1) {
                    updatedSeats[index] = { ...updatedSeats[index], ...updatedSeat };
                    console.log(`🔥 좌석 ${updatedSeat.seatId} 상태 업데이트: ${updatedSeats[index].status}`);
                }
            });
            
            // 내가 선점한 좌석 목록도 함께 업데이트
            const myReservedSeats = updatedSeats.filter(s => s.isReservedByCurrentUser);
            setSelectedSeats(myReservedSeats);
            
            return updatedSeats;
        });
    }, []);

    // 즉시 폴링 트리거 함수 (하이브리드 접근법)
    const triggerImmediatePolling = useCallback(() => {
        // 디바운싱 적용
        if (triggerDebounceRef.current) {
            clearTimeout(triggerDebounceRef.current);
        }
        
        triggerDebounceRef.current = setTimeout(() => {
            // 스마트 중단 로직: 현재 폴링이 거의 완료될 시점이면 중단하지 않음
            if (pollingStartTimeRef.current) {
                const timeElapsed = Date.now() - pollingStartTimeRef.current;
                const SMART_ABORT_THRESHOLD = 25000; // 25초
                
                if (timeElapsed > SMART_ABORT_THRESHOLD) {
                    console.log('🔥 폴링이 거의 완료되어 즉시 폴링 건너뜀');
                    return;
                }
            }
            
            console.log('🚀 사용자 액션으로 인한 즉시 폴링 트리거');
            setPollingState('burst');
            
            // 현재 진행 중인 폴링 중단하고 즉시 새로운 폴링 시작
            if (stablePollingManagerRef.current) {
                stablePollingManagerRef.current.stop();
                
                // 즉시 새로운 폴링 시작
                setTimeout(() => {
                    startPolling().then(() => {
                        setPollingState('normal');
                    }).catch(() => {
                        setPollingState('normal');
                    });
                }, 100); // 약간의 지연으로 안정성 확보
            }
        }, 300); // 300ms 디바운스
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
            pollingStartTimeRef.current = Date.now(); // 폴링 시작 시간 기록
        
        // 단순 주기적 폴링 시스템 사용
        if (isBackendPollingSupported()) {
            console.log('🔥 폴링 시스템 시작 (35초 간격)');
            
            // 폴링 매니저 생성
            const stableManager = createStablePollingManager(concertId, {
                onUpdate: (seatUpdates) => {
                    console.log('🔥 좌석 업데이트 수신:', seatUpdates);
                    // 부분 업데이트 대신 전체 새로고침 사용하여 누락 방지
                    refreshSeatStatuses();
                },
                onError: (error) => {
                    console.error('🔥 폴링 에러:', error);
                    setError(error.message);
                    setConnectionStatus('error');
                },
                onStatusChange: (isConnected) => {
                    setConnectionStatus(isConnected ? 'connected' : 'disconnected');
                }
            });
            
            stablePollingManagerRef.current = stableManager;
            stableManager.start();
            
            pollingManagerRef.current = {
                stopPolling: () => {
                    stableManager.stop();
                    setIsPolling(false);
                    setConnectionStatus('disconnected');
                }
            };
            
        } else {
            // 폴백: 일반 주기적 새로고침
            console.log('🔥 백엔드 Long Polling 비활성화 - 일반 주기적 새로고침 모드');
            
            const pollingInterval = getPollingInterval();
            console.log(`🔥 ${pollingInterval/1000}초 주기 좌석 상태 새로고침 시스템 시작`);
            
            // 폴링 관리 객체 저장 (먼저 설정)
            pollingManagerRef.current = { 
                stopPolling: () => {
                    setIsPolling(false);
                    setConnectionStatus('disconnected');
                }
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
                    await new Promise(resolve => setTimeout(resolve, pollingInterval));
                    
                    // 상태 재확인
                    if (!isPolling || !enablePolling) {
                        console.log('🔥 폴링 루프 중단:', { isPolling, enablePolling });
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
    }, [concertId, isPolling, enablePolling, refreshSeatStatuses, updateSeatStatuses]);

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
            
            // 디바운스 타이머 정리
            if (triggerDebounceRef.current) {
                clearTimeout(triggerDebounceRef.current);
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
                        throw new Error('이미 선택된 좌석입니다');
                    if (selectedSeats.length >= MAX_SEATS_SELECTABLE) {
                        alert('좌석은 최대 2개까지 선점할 수 있습니다.');
                        return;
                    }
                    await reserveSeat(concertId, seat.seatId);
                }
                await refreshSeatStatuses(); // 상태 동기화
                
                // 하이브리드 폴링: 좌석 액션 후 즉시 폴링 트리거
                triggerImmediatePolling();
            } catch (err) {
                setError(err.message);
            } finally {
                setIsReserving(false);
            }
        },
        [concertId, selectedSeats, refreshSeatStatuses, triggerImmediatePolling],
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
            
            // 하이브리드 폴링: 전체 해제 액션 후 즉시 폴링 트리거
            triggerImmediatePolling();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsReserving(false);
        }
    }, [concertId, selectedSeats, refreshSeatStatuses, triggerImmediatePolling]);

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
        pollingState, // 하이브리드 폴링 상태: 'normal', 'burst', 'waiting'
        refreshSeatStatuses, // 페이지가 최초 로드 시 호출할 함수
        startPolling, // 폴링 시스템 시작 함수
        stopPolling, // 폴링 시스템 정지 함수
        triggerImmediatePolling, // 즉시 폴링 트리거 함수
        handleSeatClick,
        handleRemoveSeat,
        handleClearSelection,
        handleRestoreComplete, // 좌석 복구 후 상태 초기화 함수
    };
};
