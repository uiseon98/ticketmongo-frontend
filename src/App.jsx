// 애플리케이션의 주요 라우팅 규칙을 정의
import React from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom'; // 필요한 컴포넌트들 임포트

// 각 페이지 컴포넌트 임포트 (src/pages 폴더에 실제 파일로 존재한다고 가정)
import HomePage from './pages/Home.jsx'; // 콘서트 목록을 보여주는 홈 페이지
import ConcertsPage from './pages/ConcertsPage.jsx'; // (가상의) 모든 콘서트 목록 페이지
import ConcertDetailPage from './pages/ConcertDetailPage.jsx'; // (가상의) 콘서트 상세 페이지
import MyPage from './pages/MyPage.jsx'; // (가상의) 마이페이지
import LoginPage from './pages/LoginPage.jsx'; // (가상의) 로그인 페이지
import RegisterPage from './pages/RegisterPage.jsx'; // (가상의) 회원가입 페이지
import SellerStatusPage from './pages/SellerStatus.jsx'; // SellerStatus 페이지 임포트

// App 컴포넌트: 라우팅 정의 및 네비게이션 제공
function App() {
    return (
        <div>
            {/* 3. 내비게이션 링크 (SPA에서 페이지 이동을 위해 사용) */}
            <nav style={{ padding: '1rem', background: '#333', color: '#fff' }}>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', justifyContent: 'space-around' }}>
                    <li><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>홈</Link></li>
                    <li><Link to="/concerts" style={{ color: '#fff', textDecoration: 'none' }}>콘서트</Link></li>
                    <li><Link to="/mypage" style={{ color: '#fff', textDecoration: 'none' }}>마이페이지</Link></li>
                    <li><Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>로그인</Link></li>
                    <li><Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>회원가입</Link></li>
                    <li><Link to="/seller-status" style={{ color: '#fff', textDecoration: 'none' }}>판매자 상태</Link></li>
                </ul>
            </nav>

            {/* 4. Routes와 Route를 사용하여 URL 경로에 따라 렌더링할 컴포넌트 정의 */}
            <Routes>
                <Route path="/" element={<HomePage />} /> {/* 홈 경로 */}
                <Route path="/concerts" element={<ConcertsPage />} /> {/* 콘서트 목록 */}
                <Route path="/concerts/:id" element={<ConcertDetailPage />} /> {/* 콘서트 상세 (동적 ID) */}
                <Route path="/mypage" element={<MyPage />} /> {/* 마이페이지 */}
                <Route path="/login" element={<LoginPage />} /> {/* 로그인 페이지 */}
                <Route path="/register" element={<RegisterPage />} /> {/* 회원가입 페이지 */}
                <Route path="/seller-status" element={<SellerStatusPage />} /> {/* 판매자 상태 페이지 */}


                {/* 5. 일치하는 라우트가 없을 경우 표시할 404 페이지 */}
                <Route path="*" element={<h2>404 - 페이지를 찾을 수 없습니다.</h2>} />
            </Routes>
        </div>
    );
}

export default App;

// 아래는 App.jsx에서 분리되어야 할 페이지 컴포넌트들 (별도 파일로 관리)
// 이전에 App.jsx에 임시로 정의했던 HomePage, ConcertsPage, ConcertDetailPage, MyPage, LoginPage, RegisterPage, NotFoundPage 등의 함수들을 각자 src/pages 폴더의 별도 파일 (예: HomePage.jsx)로 옮겨야 합니다.

/* 예시: src/pages/ConcertsPage.jsx 파일로 분리
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ConcertsPage = () => {
    const navigate = useNavigate();
    const goToConcertDetail = (id) => {
        navigate(`/concerts/${id}`);
    };

    return (
        <div>
            <h2>콘서트 목록 페이지</h2>
            <ul>
                <li><Link to="/concerts/1">아이유 콘서트 상세</Link></li>
                <li><Link to="/concerts/2">BTS 콘서트 상세</Link></li>
            </ul>
            <button onClick={() => goToConcertDetail(3)}>다른 콘서트 상세 보기</button>
        </div>
    );
};
export default ConcertsPage;
*/

/* 예시: src/pages/ConcertDetailPage.jsx 파일로 분리
import React from 'react';
import { useParams } from 'react-router-dom';

const ConcertDetailPage = () => {
    const { id } = useParams();
    return <h2>콘서트 상세 페이지 - ID: {id}</h2>;
};
export default ConcertDetailPage;
*/
