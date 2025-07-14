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

            console.log('🎉 결제 성공 - 좌석 상태 즉시 업데이트');
            if (onPaymentSuccess) {
                onPaymentSuccess(selectedSeats);
            }

        } catch (err) {
            console.error('💳 결제 실패:', err);
            // ✅ 개선된 에러 메시지 처리
            let errorMessage = '결제 중 오류가 발생했습니다.';

            if (err.code === 'USER_CANCEL') {
                errorMessage = '사용자가 결제를 취소했습니다.';
            } else if (err.message) {
                // 백엔드에서 온 구체적인 에러 메시지 사용
                if (err.message.includes('좌석에 이미 티켓이 할당됨')) {
                    errorMessage = '선택하신 좌석이 이미 다른 사용자에게 판매되었습니다. 좌석을 다시 선택해주세요.';
                } else if (err.message.includes('재고 부족') || err.message.includes('SOLD_OUT')) {
                    errorMessage = '선택하신 좌석이 매진되었습니다. 다른 좌석을 선택해주세요.';
                } else if (err.message.includes('선점 시간 만료')) {
                    errorMessage = '좌석 선점 시간이 만료되었습니다. 좌석을 다시 선택해주세요.';
                } else if (err.message.includes('유효하지 않은 좌석')) {
                    errorMessage = '선택하신 좌석이 유효하지 않습니다. 페이지를 새로고침해주세요.';
                } else {
                    errorMessage = err.message;
                }
            }

            setPaymentError(errorMessage);

            // 에러를 다시 throw하여 호출한 쪽에서 후속 처리를 할 수 있도록 함
            const enhancedError = new Error(errorMessage);
            enhancedError.code = err.code;
            enhancedError.originalError = err;
            throw enhancedError;
        } finally {
            setIsProcessing(false);
        }
    };

    return { proceedToPayment, isProcessing, paymentError };
};
