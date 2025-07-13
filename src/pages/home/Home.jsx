import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { concertService } from '../../features/concert/services/concertService';
import '../../App.css';
import { Search } from 'lucide-react';
import ConcertCard from '../../features/concert/components/ConcertCard';

function Home() {
    const navigate = useNavigate();
    const [searchKeyword, setsearchKeyword] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [concerts, setConcerts] = useState([]);

    useEffect(() => {
        async function getConcerts() {
            try {
                setLoading(true);
                setError(null);

                const response = await concertService.getConcerts({
                    page: 0,
                    size: 4,
                });

                // 응답 데이터 구조 확인 및 처리
                let concertData = [];

                if (response?.data) {
                    // SuccessResponse 구조: { success: true, message: "...", data: {...} }
                    if (response.data.content) {
                        // 페이지네이션 구조: { content: [...], totalElements: ..., ... }
                        concertData = response.data.content;
                    } else if (Array.isArray(response.data)) {
                        // 직접 배열인 경우
                        concertData = response.data;
                    } else {
                        console.warn(
                            '⚠️ 예상치 못한 데이터 구조:',
                            response.data,
                        );
                        concertData = [];
                    }
                } else if (Array.isArray(response)) {
                    // 직접 배열 응답인 경우
                    concertData = response;
                }

                setConcerts(concertData);
            } catch (err) {
                // 에러 메시지 처리
                let errorMessage = '콘서트 목록을 불러오지 못했습니다.';

                if (err.message) {
                    errorMessage = err.message;
                } else if (err.response?.data?.message) {
                    errorMessage = err.response.data.message;
                }

                setError(errorMessage);
                setConcerts([]); // 에러 시 빈 배열로 설정
            } finally {
                setLoading(false);
            }
        }

        getConcerts();
    }, []);

    // 검색 실행 핸들러
    const handleSearch = () => {
        if (searchKeyword.trim()) {
            navigate(`/concerts?query=${encodeURIComponent(searchKeyword)}`);
            setsearchKeyword('');
        }
    };

    const handleSearchInput = (e) => {
        setsearchKeyword(e.target.value);
    };

    const handleConcertClick = (concert) => {
        navigate(`/concerts/${concert.concertId}`);
    };

    return (
        <div className="bg-gray-900 text-white">
            {/* 상단바 */}
            <div className="relative bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 h-80 md:h-96 flex items-center mx-4 md:mx-8 lg:mx-16 xl:mx-24 rounded-xl overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-60"></div>
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
                    style={{
                        backgroundImage: 'url("/images/main.jpg")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center center',
                    }}
                ></div>

                <div className="relative w-full px-6 md:px-12 lg:px-16 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-2xl md:text-4xl font-bold mb-4 leading-tight">
                            최고의
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                                라이브
                            </span>
                            를 경험하세요
                        </h1>
                        <p className="text-base md:text-lg text-gray-100 mb-6">
                            가장 핫한 콘서트 티켓을 찾아보세요.
                        </p>

                        <div className="max-w-xl mx-auto">
                            <div className="flex rounded-lg overflow-hidden shadow-lg">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        value={searchKeyword}
                                        onChange={handleSearchInput}
                                        onKeyDown={(e) =>
                                            e.key === 'Enter' && handleSearch()
                                        }
                                        className="block w-full pl-10 pr-3 py-3 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                                        placeholder="콘서트를 검색하세요"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-3 transition-colors font-medium text-sm md:text-base"
                                >
                                    검색
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 콘서트 섹션 */}
            <div className="py-16 bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            인기 콘서트
                        </h2>
                        <p className="text-gray-400 text-lg">
                            놓치면 안 될 최고의 라이브 공연들
                        </p>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-gray-300 text-lg animate-pulse">
                                콘서트를 불러오는 중입니다...
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="text-red-400 text-lg">{error}</div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-fit">
                                {concerts.map((concert) => (
                                    <ConcertCard
                                        key={concert.concertId}
                                        concert={concert}
                                        onClick={handleConcertClick}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/concerts')}
                        className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm md:text-base rounded-lg shadow-md transition-colors"
                    >
                        전체 콘서트 보기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Home;