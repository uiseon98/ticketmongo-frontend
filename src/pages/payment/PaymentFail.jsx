// src/pages/payment/PaymentFail.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchBooking } from '../../features/payment/paymentAPI.js';
import axios from 'axios';

export default function PaymentFail() {
    const [params] = useSearchParams();
    const bookingNumber = params.get('bookingNumber');
    const code = params.get('code');
    const message = params.get('message');

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!bookingNumber) return;
        setLoading(true);
        fetchBooking(bookingNumber)
            .then((res) => setBooking(res.data.data))
            .catch(() => {
                /* 실패해도 레이아웃에는 영향 없음 */
            })
            .finally(() => setLoading(false));
    }, [bookingNumber]);

    return (
        <div className="bg-gray-900 min-h-screen flex items-center justify-center px-4">
            <div className="max-w-md mx-auto my-12 p-6 bg-gray-800 border border-gray-600 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-2 text-red-400">
                    결제에 실패했습니다
                </h2>
                <hr className="border-gray-600 mb-6" />

                {booking && (
                    <div className="mb-4">
                        <h3 className="font-semibold text-white">공연명</h3>
                        <p className="text-gray-300">{booking.concertTitle}</p>
                    </div>
                )}

                <div className="mb-4">
                    <h3 className="font-semibold text-white">사유</h3>
                    <p className="text-gray-300">
                        {message}
                        {code && (
                            <span className="text-sm text-gray-400">
                                {' '}
                                (코드: {code})
                            </span>
                        )}
                    </p>
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