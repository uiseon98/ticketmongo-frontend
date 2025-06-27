// 기존 src/pages/Home.jsx의 내용을 src/pages/home/Home.jsx로 옮기면서, fetchConcerts와 AuthContext의 임포트 경로를 새로운 구조에 맞게 수정합니다.
import React, { useState, useEffect, createContext, useContext } from 'react';
import { fetchConcerts } from '../../features/concert/services/concertService'; // 경로 수정
import { AuthContext } from '../../context/AuthContext'; // 경로 수정
import '../../App.css'; // 기본 스타일 임포트 (App.css 사용 예시)

function Home() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    async function getConcerts() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchConcerts(); // 새 서비스 함수 호출
        setConcerts(data.content || data); // 서비스 함수에서 content를 직접 반환하므로 바로 사용
      } catch (err) {
        console.error('콘서트 목록을 가져오는 데 실패했습니다:', err);
        setError(err.message || '콘서트 목록을 불러오지 못했습니다.');
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
    return (
      <div className="card" style={{ color: 'red' }}>
        에러: {error}
      </div>
    );
  }

  return (
    <div className="container">
      {user && (
        <div className="card">
          {user.username}님 환영합니다.
          <button onClick={logout} style={{ marginLeft: '10px' }}>
            로그아웃
          </button>
        </div>
      )}

      <h1>공연 목록</h1>
      {concerts.length === 0 ? (
        <p>현재 등록된 공연이 없습니다.</p>
      ) : (
        <ul className="concert-list">
          {concerts.map((concert) => (
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
