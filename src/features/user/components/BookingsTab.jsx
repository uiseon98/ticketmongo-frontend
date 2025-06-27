import React, { useState } from 'react';
import { User, Lock, Calendar, Eye, EyeOff, Camera, Phone, Mail, MapPin, Edit2, Save, X } from 'lucide-react';

export function BookingsTab({ bookingHistory, isLoading, onCancelBooking }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-gray-100 text-gray-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'confirmed':
                return '예매 확정';
            case 'completed':
                return '관람 완료';
            case 'cancelled':
                return '취소됨';
            default:
                return '대기중';
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (window.confirm('정말로 예매를 취소하시겠습니까?')) {
            try {
                await onCancelBooking(bookingId);
                alert('예매가 취소되었습니다.');
            } catch (error) {
                alert('예매 취소에 실패했습니다.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">예매 내역</h3>
                <p className="text-gray-400">총 {bookingHistory?.length || 0}건의 예매 내역이 있습니다</p>
            </div>

            {!bookingHistory || bookingHistory.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-400">예매 내역이 없습니다.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookingHistory.map((booking) => (
                        <div key={booking.id} className="bg-gray-700 rounded-xl p-6 hover:bg-gray-650 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-xl font-bold">{booking.eventName}</h4>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                                    {getStatusText(booking.status)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-400 block">공연일시</span>
                                    <span className="font-medium">{booking.date}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">공연장</span>
                                    <span className="font-medium">{booking.venue}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">좌석</span>
                                    <span className="font-medium">{booking.seats}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 block">결제금액</span>
                                    <span className="font-bold text-blue-400">{booking.price}</span>
                                </div>
                            </div>

                            <div className="flex justify-end mt-4 space-x-2">
                                <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors text-sm">
                                    상세보기
                                </button>
                                {booking.status === 'confirmed' && (
                                    <button
                                        onClick={() => handleCancelBooking(booking.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                    >
                                        취소하기
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
