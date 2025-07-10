// src/features/user/components/SubscriptionToggle.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../../../shared/utils/apiClient';
import { NotificationSection } from './BookingDetail/NotificationSection';
import { NOTIFICATION_TYPE } from '../services/bookingDetailService';

export default function SubscriptionToggle() {
  // 구독 로딩 상태(null = 불러오는 중, true/false = DB 구독 상태)
  const [isSubscribed, setIsSubscribed] = useState(null);
  // 브라우저 알림 권한 ('granted' | 'denied' | 'default')
  const [permission, setPermission] = useState(Notification.permission);
  // 알림 메시지
  const [notification, setNotification] = useState(null);

  // 로컬에 플레이어 ID 저장해 두는 키
  const LOCAL_PLAYER_ID_KEY = 'oneSignalPlayerId';

  // 마운트 시 브라우저 권한과 서버 구독 상태 조회
  useEffect(() => {
    const perm = Notification.permission;
    setPermission(perm);

    // 권한이 granted 일 때만 DB 상태 조회
    if (perm === 'granted') {
      apiClient.get('/notifications/status')
        .then(res => {
          setIsSubscribed(res.data.subscribed);
        })
        .catch(err => {
          console.error('[구독 상태 조회 오류]', err);
          setIsSubscribed(false);
        });
    } else {
      // 권한 denied or default 이면 무조건 false
      setIsSubscribed(false);
    }
  }, []);

  // 토글 클릭 핸들러
  const handleToggle = async () => {
    // 로딩 중엔 무시
    if (isSubscribed === null) return;

    const perm = Notification.permission;
    setPermission(perm);

    // 1) 권한이 허용되지 않았으면 안내 후 종료
    if (perm !== 'granted') {
      setNotification({ type: NOTIFICATION_TYPE.ERROR, message: '브라우저 알림 권한을 허용해주세요.' });
      setIsSubscribed(false);
      return;
    }

    // 2) OneSignal SDK 유무 확인
    const OneSignal = window.OneSignal;
    if (!OneSignal || !OneSignal.User?.PushSubscription) {
      setNotification({ type: NOTIFICATION_TYPE.ERROR, message: '푸시 SDK가 로드되지 않았습니다.' });
      return;
    }

    // 3) 실제 구독 / 해제 로직
    try {
      if (!isSubscribed) {
        // ── 구독 요청 ──
        OneSignal.User.PushSubscription.optIn();
        const playerId = OneSignal.User.PushSubscription.id;
        if (!playerId) throw new Error('푸시 권한을 허용받지 못했습니다.');
        // 구독 API 호출
        await apiClient.post('/notifications/subscribe', { playerId, channel: 'PUSH' });
        // 로컬에도 저장
        localStorage.setItem(LOCAL_PLAYER_ID_KEY, playerId);
        setIsSubscribed(true);
        setNotification({ type: NOTIFICATION_TYPE.SUCCESS, message: '푸시 알림이 활성화되었습니다.' });
      } else {
        // ── 해제 요청 ──
        // SDK에서 playerId 가져오기
        let playerId = OneSignal.User.PushSubscription.id;
        // 만약 권한은 granted이나 SDK 내부 ID가 없으면, 로컬 저장된 ID 사용
        if (!playerId) {
          playerId = localStorage.getItem(LOCAL_PLAYER_ID_KEY);
        }
        if (!playerId) throw new Error('해제할 구독 정보가 없습니다.');
        // 언구독 API 호출
        await apiClient.post('/notifications/unsubscribe', { playerId });
        OneSignal.User.PushSubscription.optOut();
        // 로컬 플레이어 ID 지우기
        localStorage.removeItem(LOCAL_PLAYER_ID_KEY);
        setIsSubscribed(false);
        setNotification({ type: NOTIFICATION_TYPE.INFO, message: '푸시 알림이 비활성화되었습니다.' });
      }
    } catch (e) {
      console.error('[구독/해제 과정 오류]', e);
      setNotification({ type: NOTIFICATION_TYPE.ERROR, message: e.message || '요청에 실패했습니다.' });
    }
  };

  // notification이 생기면 3초 후 자동으로 사라지게
  useEffect(() => {
    if (!notification) return;
    const timer = setTimeout(() => setNotification(null), 3000);
    return () => clearTimeout(timer);
  }, [notification]);

  // 로딩 중일 땐 스켈레톤 또는 로딩 텍스트
  if (isSubscribed === null) {
    return <div className="mt-4 text-sm text-gray-500">알림 설정 로딩 중...</div>;
  }

  // 렌더링
  return (
    <div>
      {notification && <NotificationSection notification={notification} />}
      <label className="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          checked={isSubscribed}
          onChange={handleToggle}
          className="h-5 w-5 rounded border-gray-300"
        />
        <span>서비스 알림 수신 설정</span>
      </label>
      <p className="text-sm text-gray-400 mt-10">
        ※ 브라우저 알림 권한: <strong>{permission}</strong><br/>
        브라우저 설정에서 알림 권한을 차단하면 알림이 오지 않습니다.<br/>
        경로 : 사이트정보 보기(URL 좌측 클릭) - 알림 (허용)
      </p>
    </div>
  );
}
