// src/features/booking/components/ConcertInfoHeader.jsx

export default function ConcertInfoHeader({ concertInfo }) {
    // 1. concertInfo가 아직 null이면 로딩 상태의 스켈레톤 UI를 보여줍니다.
    if (!concertInfo) {
        return (
            <div className="bg-[#1A202C] p-6 rounded-lg animate-pulse">
                <div className="h-8 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-5 bg-gray-700 rounded w-1/2"></div>
            </div>
        );
    }

    // 2. concertInfo 데이터가 있으면 실제 콘서트 정보를 표시합니다.
    return (
        <div className="bg-[#1A202C] p-6 rounded-lg">
            <h1 className="text-3xl font-bold text-white break-words">
                {concertInfo.title}
            </h1>
            <p className="text-gray-400 mt-2">
                {/* 날짜 형식을 사용자가 읽기 편하게 변환합니다. */}
                {new Date(concertInfo.concertDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })}
                {' · '}
                {concertInfo.venueName}
            </p>
        </div>
    );
}
