import React, { useState, useEffect } from 'react';
import { fetchConcerts } from '../services/api'; // api.js에서 정의한 API 함수 임포트
import '../App.css'; // 기본 스타일 임포트 (App.css 사용 예시)

function Home() {
    const [concerts, setConcerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function getConcerts() {
            try {
                setLoading(true);
                setError(null);
                // 백엔드에서 콘서트 목록 데이터를 가져옵니다.
                // fetchConcerts 함수는 /api/concerts 경로로 요청을 보냅니다.
                const response = await fetchConcerts();
                // 백엔드의 SuccessResponse 구조에 따라, api.js 응답 인터셉터에서 이미 실제 데이터 부분(data 필드)이 추출되어 반환됩니다.
                // 따라서 response.data.content 또는 response.data를 한 번 더 확인할 필요 없이 바로 response.data를 사용합니다.
                setConcerts(response.data.content); // 백엔드 Page 객체 응답의 content 필드에 실제 목록이 있습니다.
            } catch (err) {
                console.error("콘서트 목록을 가져오는 데 실패했습니다:", err);
                setError(err.message || "콘서트 목록을 불러오지 못했습니다.");
            } finally {
                setLoading(false);
            }
        }
        getConcerts();
    }, []);

    if (loading) {
        return <div className="card">로딩 중...</div>;
    }

    if (error) {
        return <div className="card" style={{ color: 'red' }}>에러: {error}</div>;
    }

    return (
        <div className="container">
            <h1>공연 목록</h1>
            {concerts.length === 0 ? (
                <p>현재 등록된 공연이 없습니다.</p>
            ) : (
                <ul className="concert-list">
                    {concerts.map(concert => (
                        <li key={concert.concertId} className="concert-item">
                            <h3>{concert.title}</h3>
                            <p>아티스트: {concert.artist}</p>
                            <p>장소: {concert.venueName}</p>
                            <p>날짜: {concert.concertDate}</p>
                            {/* 추가 정보 표시 (필요시) */}
                        </li>
                    ))}
                </ul>
            )}
            <p className="read-the-docs">
                이것은 백엔드에서 데이터를 가져오는 예시입니다.
            </p>
        </div>
    );
}

export default Home;
