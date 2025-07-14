// src/features/booking/components/SelectionPanel.jsx (개선된 버전)
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
    isProcessing = false, // ✅ NEW: 결제 중 상태 추가
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
                                    {/* ✅ IMPROVED: 결제 중일 때 개별 좌석 제거 버튼 비활성화 */}
                                    <button
                                        onClick={() => onRemove(seat.seatId)}
                                        disabled={isProcessing}
                                        className={`text-gray-500 hover:text-white transition-colors ${
                                            isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                                        }`}
                                        aria-label={`${seat.seatInfo} 좌석 선택 취소`}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* ✅ IMPROVED: 결제 중일 때 전체 선택 취소 버튼 비활성화 */}
                        <button
                            onClick={onClear}
                            disabled={isProcessing}
                            className={`text-sm text-[#6B8EFE] hover:underline mt-2 transition-colors ${
                                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            {isProcessing ? '결제 진행 중...' : '전체 선택 취소'}
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

                {/* ✅ IMPROVED: 결제 중 상태에 따른 버튼 텍스트 및 스타일 변경 */}
                <button
                    onClick={onCheckout}
                    disabled={selectedSeats.length === 0 || isProcessing}
                    className={`w-full font-bold py-3 rounded-lg transition-all duration-200 ${
                        isProcessing
                            ? 'bg-yellow-600 text-white cursor-wait'
                            : selectedSeats.length === 0
                            ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                            : 'bg-[#6B8EFE] text-white hover:bg-opacity-90 active:scale-95'
                    }`}
                >
                    {isProcessing ? (
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            결제 진행 중...
                        </div>
                    ) : (
                        '결제하기'
                    )}
                </button>

                {/* ✅ NEW: 결제 중일 때 추가 안내 메시지 */}
                {isProcessing && (
                    <p className="text-xs text-center text-yellow-300 animate-pulse">
                        결제 창에서 진행해주세요. 페이지를 벗어나지 마세요.
                    </p>
                )}

                {/* ✅ NEW: 좌석 선점 시간 경고 */}
                {timer > 0 && timer <= 60 && selectedSeats.length > 0 && (
                    <p className="text-xs text-center text-red-300 animate-pulse">
                        ⚠️ 선점 시간이 1분 미만 남았습니다!
                    </p>
                )}
            </div>
        </div>
    );
}