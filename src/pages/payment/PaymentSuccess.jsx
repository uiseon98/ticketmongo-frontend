// src/pages/payment/PaymentSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { userService } from '../../features/user/services/userService.js';

export default function PaymentSuccess() {
    const [params] = useSearchParams();
    const bookingNumber = params.get('bookingNumber');
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!bookingNumber) {
            setError('예매 번호가 전달되지 않았습니다.');
            return;
        }
        userService
            .getBookingDetail(bookingNumber)
            .then((data) => setBooking(data))
            .catch(() => setError('예매 정보를 불러오는 데 실패했습니다.'));
    }, [bookingNumber]);

    if (error) {
        return (
            <div className="px-40 flex flex-1 justify-center py-20 bg-gray-900 min-h-screen">
                <div className="layout-content-container text-center">
                    <div className="text-white">{error}</div>
                </div>
            </div>
        );
    }
    if (!booking) {
        return (
            <div className="px-40 flex flex-1 justify-center py-20 bg-gray-900 min-h-screen">
                <div className="layout-content-container text-center">
                    <div className="text-white">로딩 중…</div>
                </div>
            </div>
        );
    }

    const {
        concertTitle = '',
        concertDate = '',
        startTime = '',
        endTime = '',
        seatList = [],
        totalAmount = 0,
    } = booking || {};

    // DTO 필드명에 맞춰 데이터 가공
    const concertDateTime =
        concertDate + ' ' + startTime + (endTime ? '~' + endTime : '');
    const seatLabels = seatList || [];

    return (
        <div className="px-40 flex flex-1 justify-center py-5 bg-gray-900 min-h-screen">
            <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5">
                {/* 제목 & 설명 */}
                <h2 className="text-green-400 text-[28px] font-bold text-center pb-2">
                    결제가 완료되었습니다!
                </h2>
                <p className="text-gray-300 text-base text-center pb-4">
                    아래 예매 정보를 확인해 주세요.
                </p>

                <hr className="border-t border-t-gray-600 mb-6" />

                {/* 주문 요약 */}
                <h3 className="text-white text-lg font-bold pb-2">주문 요약</h3>
                <hr className="border-t border-t-gray-600 mb-6" />

                <div className="bg-gray-800 border border-gray-600 rounded-lg p-6 shadow-lg mb-8">
                    <div className="space-y-3">
                        <div>
                            <p className="text-gray-300 text-sm">공연명</p>
                            <p className="text-white text-sm">{concertTitle}</p>
                        </div>
                        <div>
                            <p className="text-gray-300 text-sm">공연 일시</p>
                            <p className="text-white text-sm">
                                {concertDateTime}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-300 text-sm">좌석</p>
                            <p className="text-white text-sm">
                                {seatLabels?.length > 0
                                    ? seatLabels.join(', ')
                                    : '좌석 정보 없음'}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-300 text-sm">총 금액</p>
                            <p className="text-white text-sm">
                                {(totalAmount || 0).toLocaleString()}원
                            </p>
                        </div>
                    </div>
                </div>

                {/* 버튼 */}
                <div className="flex justify-center gap-3">
                    <Link
                        to="/mypage/profile"
                        className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
                    >
                        마이페이지
                    </Link>
                    <Link
                        to="/"
                        className="flex min-w-[84px] items-center justify-center rounded-lg h-10 px-4 bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                        홈으로
                    </Link>
                </div>
            </div>
        </div>
    );
}
