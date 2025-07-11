import React, { useState, useEffect } from 'react';
import apiClient from '../../../shared/utils/apiClient';
import { NotificationSection } from './BookingDetail/NotificationSection';
import { NOTIFICATION_TYPE } from '../services/bookingDetailService';

export default function SubscriptionToggle() {
    // 구독 상태: null(로딩중), true(구독), false(비구독)
    const [isSubscribed, setIsSubscribed] = useState(null);
    // 브라우저 알림 권한
    const [permission, setPermission] = useState(Notification.permission);
    // 토스트 메시지
    const [notification, setNotification] = useState(null);

    // localStorage 키
    const LOCAL_PLAYER_ID_KEY = 'oneSignalPlayerId';
    const PERMISSION_KEY = 'hasRequestedPushPermission';

    // 1. 마운트 시 OneSignal/DB 상태 동기화
    useEffect(() => {
        const syncStates = async () => {
            const perm = Notification.permission;
            setPermission(perm);

            if (perm !== 'granted') {
                setIsSubscribed(false);
                return;
            }

            // OneSignal 구독 상태 확인
            let oneSignalSubscribed = false;
            let playerId = null;
            try {
                const OneSignal = window.OneSignal;
                if (OneSignal && OneSignal.User?.PushSubscription) {
                    oneSignalSubscribed =
                        await OneSignal.User.PushSubscription.optedIn;
                    playerId = OneSignal.User.PushSubscription.id;
                }
            } catch (e) {
                oneSignalSubscribed = false;
            }

            // DB 구독 상태 확인
            let dbSubscribed = false;
            try {
                const res = await apiClient.get('/notifications/status');
                dbSubscribed = !!res.data.subscribed;
            } catch (e) {
                dbSubscribed = false;
            }

            // 둘 다 true일 때만 토글 ON
            setIsSubscribed(oneSignalSubscribed && dbSubscribed);

            // playerId는 localStorage에 저장
            if (playerId) localStorage.setItem(LOCAL_PLAYER_ID_KEY, playerId);
        };

        syncStates();
    }, []);

    // 2. 최초 1회 권한 요청 (DB 연동 없음)
    useEffect(() => {
        if (localStorage.getItem(PERMISSION_KEY)) return;
        localStorage.setItem(PERMISSION_KEY, 'true');
        const OneSignal = window.OneSignal;
        if (!OneSignal) return;
        OneSignal.push(async () => {
            try {
                await OneSignal.registerForPushNotifications();
            } catch {}
            setPermission(Notification.permission);
            OneSignal.getUserId((playerId) => {
                if (playerId)
                    localStorage.setItem(LOCAL_PLAYER_ID_KEY, playerId);
            });
        });
    }, []);

    // 3. 토글 클릭 시: OneSignal → DB 순서로 구독/해제, 둘 다 성공 시만 ON/OFF
    const handleToggle = async () => {
        if (isSubscribed === null) return; // 로딩 중엔 무시

        const perm = Notification.permission;
        setPermission(perm);

        if (perm !== 'granted') {
            setNotification({
                type: NOTIFICATION_TYPE.ERROR,
                message: '브라우저 알림 권한을 먼저 허용해주세요.',
            });
            setIsSubscribed(false);
            return;
        }

        const OneSignal = window.OneSignal;
        if (!OneSignal || !OneSignal.User?.PushSubscription) {
            setNotification({
                type: NOTIFICATION_TYPE.ERROR,
                message: '푸시 SDK가 로드되지 않았습니다.',
            });
            return;
        }

        try {
            if (!isSubscribed) {
                // 구독: OneSignal → DB
                await OneSignal.User.PushSubscription.optIn();
                const playerId = OneSignal.User.PushSubscription.id;
                await apiClient.post('/notifications/subscribe', {
                    playerId,
                    channel: 'PUSH',
                });
                localStorage.setItem(LOCAL_PLAYER_ID_KEY, playerId);
                setIsSubscribed(true);
                setNotification({
                    type: NOTIFICATION_TYPE.SUCCESS,
                    message: '푸시 알림이 활성화되었습니다.',
                });
            } else {
                // 해제: DB → OneSignal
                const playerId =
                    OneSignal.User.PushSubscription.id ||
                    localStorage.getItem(LOCAL_PLAYER_ID_KEY);
                if (playerId) {
                    await apiClient.post('/notifications/unsubscribe', {
                        playerId,
                    });
                }
                await OneSignal.User.PushSubscription.optOut();
                localStorage.removeItem(LOCAL_PLAYER_ID_KEY);
                setIsSubscribed(false);
                setNotification({
                    type: NOTIFICATION_TYPE.INFO,
                    message: '푸시 알림이 비활성화되었습니다.',
                });
            }
        } catch (err) {
            console.error('[구독/해제 오류]', err);
            setNotification({
                type: NOTIFICATION_TYPE.ERROR,
                message: '알림 구독 처리 중 오류가 발생했습니다.',
            });
            // 실패 시 상태 동기화 재시도
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    // 4. 토스트 메시지 3초 후 자동 제거
    useEffect(() => {
        if (!notification) return;
        const timer = setTimeout(() => setNotification(null), 3000);
        return () => clearTimeout(timer);
    }, [notification]);

    // 5. 로딩 중 UI
    if (isSubscribed === null) {
        return (
            <div className="mt-4 text-sm text-gray-500">
                알림 설정 정보를 불러오는 중입니다...
            </div>
        );
    }

    // 6. 최종 UI
    return (
        <div>
            {notification && (
                <NotificationSection notification={notification} />
            )}
            <label className="flex items-center space-x-3 mt-4 cursor-pointer">
                <input
                    type="checkbox"
                    checked={isSubscribed}
                    onChange={handleToggle}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-gray-200 font-medium">
                    서비스 알림 수신 동의{' '}
                </span>
            </label>
            <p className="text-sm text-gray-400 mt-10">
                브라우저 알림 권한:{' '}
                <strong
                    className={
                        permission === 'granted'
                            ? 'text-green-600'
                            : 'text-red-600'
                    }
                >
                    {permission}
                </strong>
                <br />
                <span className="text-sm text-gray-400">
                    권한 변경: 브라우저 주소창 좌측 아이콘(클릭) - 알림(허용)
                </span>
            </p>
        </div>
    );
}
