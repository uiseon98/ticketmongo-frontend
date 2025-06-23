// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import './index.css'
// import App from './App.jsx'
//
// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <App />
//   </StrictMode>,
// )
// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css'; // 전역 스타일
import App from '/src/App.jsx'; // 기존 App 컴포넌트
import Home from '/src/pages/Home.jsx'; // 새로 만든 Home 컴포넌트 임포트

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/* <App /> 대신 Home 컴포넌트를 렌더링합니다. */}
        <Home />
    </React.StrictMode>,
);