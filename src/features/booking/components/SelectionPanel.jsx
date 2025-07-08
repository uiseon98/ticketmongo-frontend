// src/features/booking/components/SelectionPanel.jsx
import { X, Clock } from 'lucide-react';

const formatTime = (totalSeconds) => {
    if (totalSeconds <= 0) return '00:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function SelectionPanel({
    selectedSeats = [],
    timer,
    onClear,
    onRemove,
    onCheckout,
}) {
    const TICKET_PRICE = 50000; // 티켓 가격 (나중에는 API에서 받아올 수 있음)
    const SERVICE_FEE = 2000; // 고정 수수료

    const subtotal = selectedSeats.length * TICKET_PRICE;
    const total = subtotal + SERVICE_FEE;

    return (
        <div className="bg-[#1A202C] rounded-2xl p-6 sticky top-8 flex flex-col gap-6">
            {/* 1. 선택 좌석 정보 */}
            <div className="flex flex-col gap-4">
                <h2 className="text-xl font-semibold text-gray-200">
                    선택한 좌석
                </h2>
                {selectedSeats.length > 0 ? (
                    <>
                        {/* 선택된 좌석 목록 */}
                        <div className="border-t border-gray-700 pt-4 mt-2 space-y-3">
                            {selectedSeats.map((seat) => (
                                <div
                                    key={seat.seatId}
                                    className="flex justify-between items-center animate-fade-in"
                                >
                                    <span className="text-gray-300 text-sm">
                                        {seat.seatInfo}
                                    </span>
                                    {/* 개별 좌석 X 버튼은 클릭 핸들러를 연결해야 함 */}
                                    <button
                                        onClick={() => onRemove(seat.seatId)}
                                        className="text-gray-500 hover:text-white"
                                        aria-label={`${seat.seatInfo} 좌석 선택 취소`}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            onClick={onClear}
                            className="text-sm text-[#6B8EFE] hover:underline mt-2"
                        >
                            전체 선택 취소
                        </button>
                    </>
                ) : (
                    <p className="text-gray-400 text-sm pt-4 mt-2 border-t border-gray-700">
                        선택 가능한 좌석을 클릭하세요.
                    </p>
                )}
            </div>

            {/* 2. 가격 정보 */}
            <div className="flex flex-col gap-3">
                <h2 className="text-xl font-semibold text-gray-200">
                    가격 정보
                </h2>
                <div className="text-sm space-y-2 text-gray-300">
                    <div className="flex justify-between">
                        <span>티켓 가격:</span>
                        <span className="text-white">
                            {TICKET_PRICE.toLocaleString()}원 ×{' '}
                            {selectedSeats.length}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>예매 수수료:</span>
                        <span className="text-white">
                            {SERVICE_FEE.toLocaleString()}원
                        </span>
                    </div>
                </div>
                <div className="border-t border-gray-700 my-2"></div>
                <div className="flex justify-between items-center">
                    <span className="font-semibold text-white">
                        총 결제 금액:
                    </span>
                    <span className="font-bold text-2xl text-[#6B8EFE]">
                        {total.toLocaleString()}원
                    </span>
                </div>
            </div>

            {/* 3. 구매 버튼 및 타이머 */}
            <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2 text-yellow-400">
                        <Clock size={16} />
                        <span className="font-mono">{formatTime(timer)}</span>
                    </div>
                    <span className="text-gray-400">결제 남은 시간</span>
                </div>
                <button
                    onClick={onCheckout}
                    disabled={selectedSeats.length === 0}
                    className="w-full bg-[#6B8EFE] text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-transform active:scale-95 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    결제하기
                </button>
            </div>
        </div>
    );
}
