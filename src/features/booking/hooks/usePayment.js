// src/features/booking/hooks/usePayment.js (개선된 버전)

import { useState } from 'react';
import { createBookingAndPreparePayment } from '../services/bookingService';
import { loadTossPayments } from '@tosspayments/payment-sdk';

export const usePayment = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState(null);

    const proceedToPayment = async (concertId, selectedSeats, onPaymentSuccess) => {
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

            // ✅ 결제 성공 시 즉시 로컬 상태 업데이트
            if (onPaymentSuccess) {
                console.log('🎉 결제 성공 - 로컬 상태 즉시 업데이트');
                onPaymentSuccess(selectedSeats);
            }

        } catch (err) {
            setPaymentError(err.message || '결제 요청 중 오류가 발생했습니다.');
            if (err.code === 'USER_CANCEL') {
                throw new Error('사용자가 결제를 취소했습니다.');
            }
            throw err;
        } finally {
            setIsProcessing(false);
        }
    };

    return { proceedToPayment, isProcessing, paymentError };
};