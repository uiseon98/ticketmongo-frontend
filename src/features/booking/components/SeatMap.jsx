// src/features/booking/components/SeatMap.jsx

import React from 'react';

const getSeatStatusClass = (status, isSelected, isProcessing) => {
    if (isProcessing && isSelected) {
        return 'bg-yellow-500 animate-pulse cursor-wait'; // 처리 중
    }
    if (isSelected) {
        return 'bg-[#6B8EFE] ring-2 ring-white cursor-pointer';
    }
    switch (status) {
        case 'AVAILABLE':
            return 'bg-[#22C55E] hover:bg-green-400 cursor-pointer';
        case 'BOOKED':
            return 'bg-red-500 cursor-not-allowed';
        case 'RESERVED': // 다른 사용자가 선점 중
            return 'bg-orange-500 cursor-not-allowed';
        default:
            return 'bg-gray-600 cursor-not-allowed';
    }
};

export default function SeatMap({
    seatStatuses = [],
    selectedSeats = [],
    onSeatClick,
}) {
    // 1. 좌석 데이터를 '섹션 > 열 > 좌석 배열' 구조로 그룹핑합니다.
    const sections = seatStatuses.reduce((acc, seat) => {
        const [section, row, numStr] = seat.seatInfo.split('-');
        const num = parseInt(numStr, 10);
        if (!acc[section]) acc[section] = {};
        if (!acc[section][row]) acc[section][row] = [];
        acc[section][row].push({ ...seat, num });
        return acc;
    }, {});

    const selectedSeatIds = new Set(selectedSeats.map((s) => s.seatId));

    return (
        <div className="bg-[#22222C] p-4 sm:p-6 rounded-lg h-full">
            <div className="bg-gray-700 w-3/4 mx-auto h-12 flex items-center justify-center rounded-t-full mb-8 text-white font-bold">
                STAGE
            </div>

            {/* 2. 섹션별로 반복하여 렌더링 */}
            <div className="space-y-12">
                {Object.keys(sections)
                    .sort()
                    .map((sectionName) => (
                        <div key={sectionName}>
                            <h3 className="text-xl font-bold text-center text-white mb-4">
                                {sectionName} 구역
                            </h3>
                            {/* 3. 열(row)별로 반복 */}
                            <div className="space-y-4">
                                {Object.keys(sections[sectionName])
                                    .map(Number)
                                    .sort((a, b) => a - b)
                                    .map((rowNum) => (
                                        <div
                                            key={rowNum}
                                            className="flex items-center gap-4"
                                        >
                                            <span className="w-8 text-gray-400 text-sm">
                                                {rowNum}열
                                            </span>
                                            <div className="flex-grow flex justify-center gap-2">
                                                {/* 4. 개별 좌석 렌더링 */}
                                                {sections[sectionName][rowNum]
                                                    .sort(
                                                        (a, b) => a.num - b.num,
                                                    )
                                                    .map((seat) => (
                                                        <div
                                                            key={seat.seatId}
                                                            className={`w-8 h-8 flex items-center justify-center text-xs font-bold text-white rounded-md transition-transform active:scale-90
                                                                ${getSeatStatusClass(seat.status, selectedSeatIds.has(seat.seatId))}
                                                            `}
                                                            onClick={() =>
                                                                onSeatClick &&
                                                                onSeatClick(
                                                                    seat,
                                                                )
                                                            }
                                                        >
                                                            {seat.num}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}
