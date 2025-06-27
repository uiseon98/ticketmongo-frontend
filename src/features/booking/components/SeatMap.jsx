import React from 'react';

export default function SeatMap({
  seatStatuses = [],
  selectedSeat,
  onSeatClick,
  isReserving
}) {
  console.log('seats');
  console.log(seatStatuses);
  const sections = seatStatuses.reduce((acc, s) => {
    const [sec] = s.seatInfo.split('-');
    acc[sec] = acc[sec] ? [...acc[sec], s] : [s];
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(sections).map(([sec, list]) => (
        <div key={sec}>
          <h3 className="text-lg font-bold mb-2 text-gray-800 text-center">
            {sec} 구역
          </h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 justify-center">
            {list.map((seat) => {
              const isSel = selectedSeat?.seatId === seat.seatId;
              let base =
                'w-10 h-10 flex items-center justify-center rounded text-sm font-bold cursor-pointer transition';
              if (isSel) base += ' bg-purple-500 ring-2 ring-purple-700';
              else if (seat.status === 'AVAILABLE')
                base += ' bg-green-500 hover:bg-green-600';
              else if (seat.status === 'RESERVED')
                base += ' bg-yellow-500 cursor-not-allowed';
              else if (seat.status === 'BOOKED')
                base += ' bg-red-500 cursor-not-allowed';
              else base += ' bg-gray-400 cursor-not-allowed';

              return (
                <div
                  key={seat.seatId}
                  className={base}
                  onClick={() => !isReserving && onSeatClick(seat)}
                >
                  {seat.seatInfo.split('-')[1]}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
