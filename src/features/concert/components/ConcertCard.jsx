//// src/components/concert/ConcertCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

function ConcertCard({ concert }) {
  return (
    <li className="flex flex-row gap-6 bg-[#1A202C] rounded-[16px] p-4 w-full h-40 shadow-md">
      {/* 썸네일 이미지 */}
      <div className="w-48 h-32 rounded-[8px] overflow-hidden">
        <img
          src={concert.posterImageUrl || 'https://placehold.co/192x128'}
          alt={concert.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* 텍스트 정보 */}
      <div className="flex flex-col justify-between flex-grow">
        <div>
          <span className="text-xs text-gray-400 font-normal">Concert</span>
          <h3 className="text-lg font-semibold text-white mt-1">
            {concert.title}
          </h3>
          <p className="text-sm text-gray-300 mt-1">
            {concert.venueName} | {concert.concertDate}
          </p>
        </div>
        <Link
          to={`/concerts/${concert.concertId}`}
          className="text-blue-400 text-sm font-medium mt-2 hover:underline self-start"
        >
          Concert Details →
        </Link>
      </div>
    </li>
  );
}

export default ConcertCard;
