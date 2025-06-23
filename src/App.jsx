// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
//
// function App() {
//   const [count, setCount] = useState(0)
//
//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }
//
// export default App

// src/App.jsx 예시
import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
    const [apiMessage, setApiMessage] = useState('API 응답 대기 중...');
    const [wsMessage, setWsMessage] = useState('WebSocket 연결 대기 중...');

    // 백엔드 API 호출 테스트
    useEffect(() => {
        // .env 파일에 설정된 VITE_APP_API_URL 사용
        const apiUrl = import.meta.env.VITE_APP_API_URL || 'http://localhost:8080';
        fetch(`${apiUrl}/api/test-endpoint`) // 백엔드에 더미 API 엔드포인트가 있다면 해당 경로로 변경해주세요. 없으면 8080 기본경로로 테스트
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                setApiMessage(`API 응답 성공: ${data.substring(0, 50)}...`);
            })
            .catch(error => {
                setApiMessage(`API 응답 오류: ${error.message}`);
                console.error("API 호출 오류:", error);
            });
    }, []);

    // WebSocket 연결 테스트
    useEffect(() => {
        // .env 파일에 설정된 VITE_APP_WS_URL 사용
        const wsUrl = import.meta.env.VITE_APP_WS_URL || 'ws://localhost:8080/ws'; // 백엔드 WebSocket 경로 확인 필요
        let ws;
        try {
            ws = new WebSocket(wsUrl);

            ws.onopen = () => {
                setWsMessage('WebSocket 연결 성공! 🚀');
                console.log('WebSocket 연결 성공!');
                ws.send('Hello from Frontend!');
            };

            ws.onmessage = (event) => {
                console.log('WebSocket 메시지 수신:', event.data);
                setWsMessage(`WebSocket 메시지 수신: ${event.data.substring(0, 50)}...`);
            };

            ws.onerror = (error) => {
                setWsMessage(`WebSocket 오류 발생: ${error.message}`);
                console.error('WebSocket 오류:', error);
            };

            ws.onclose = () => {
                console.log('WebSocket 연결 종료');
                // setWsMessage('WebSocket 연결 종료'); // 연결 끊김 표시를 위해 주석 처리
            };
        } catch (e) {
            setWsMessage(`WebSocket 연결 시도 중 오류: ${e.message}`);
            console.error("WebSocket 연결 시도 오류:", e);
        }

        return () => {
            if (ws) {
                ws.close();
            }
        };
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1>프론트엔드 ↔ 백엔드 연동 테스트</h1>
            <hr />
            <h2>API 호출 테스트 결과:</h2>
            <p style={{ color: apiMessage.includes('오류') ? 'red' : 'green' }}>{apiMessage}</p>
            <hr />
            <h2>WebSocket 연결 테스트 결과:</h2>
            <p style={{ color: wsMessage.includes('오류') ? 'red' : 'blue' }}>{wsMessage}</p>
            <p style={{ fontSize: '0.8em', color: '#666' }}>백엔드 콘솔에서도 WebSocket 연결 및 메시지 수신/송신 로그를 확인해보세요.</p>
        </div>
    );
}

export default App;