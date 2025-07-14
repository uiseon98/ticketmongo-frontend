// src/features/booking/hooks/usePayment.js

import { useState } from 'react';
import { createBookingAndPreparePayment } from '../services/bookingService';
import { loadTossPayments } from '@tosspayments/payment-sdk';

export const usePayment = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const proceedToPayment = async (concertId, selectedSeats) => {
        if (selectedSeats.length === 0) {
            setPaymentError('좌석을 먼저 선택해주세요.');
            throw new Error('좌석을 먼저 선택해주세요.');
        }

        setIsProcessing(true);
        setPaymentError(null);

        try {
            const bookingReq = {
                concertId: parseInt(concertId, 10),
                concertSeatIds: selectedSeats.map((seat) => seat.seatId),
            };
            const response = await createBookingAndPreparePayment(bookingReq);
            const tossPayments = await loadTossPayments(response.clientKey);

            await tossPayments.requestPayment('카드', {
                orderId: response.orderId,
                orderName: response.orderName,
                amount: response.amount,
                customerName: response.customerName,
                successUrl: response.successUrl,
                failUrl: response.failUrl,
            });
        } catch (err) {
            // 결제 실패 시, 에러 상태를 설정하여 UI에 피드백을 줄 수 있도록 함
            // 좌석 해제 로직은 이 훅이 아닌, 이 훅을 사용하는 컴포넌트에서 처리
            setPaymentError(err.message || '결제 요청 중 오류가 발생했습니다.');
            if (err.code === 'USER_CANCEL') {
                throw new Error('사용자가 결제를 취소했습니다.');
            }
            // 에러를 다시 throw하여 호출한 쪽에서 후속 처리를 할 수 있도록 함
            throw err;
        } finally {
            setIsProcessing(false);
        }
    };

    return { proceedToPayment, isProcessing, paymentError };
};
