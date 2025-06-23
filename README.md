[//]: # ([//]: # &#40;# React + Vite&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;Currently, two official plugins are available:&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;- [@vitejs/plugin-react]&#40;https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react&#41; uses [Babel]&#40;https://babeljs.io/&#41; for Fast Refresh&#41;)
[//]: # ()
[//]: # ([//]: # &#40;- [@vitejs/plugin-react-swc]&#40;https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc&#41; uses [SWC]&#40;https://swc.rs/&#41; for Fast Refresh&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;## Expanding the ESLint configuration&#41;)
[//]: # ()
[//]: # ([//]: # &#40;&#41;)
[//]: # ([//]: # &#40;If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template]&#40;https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts&#41; for information on how to integrate TypeScript and [`typescript-eslint`]&#40;https://typescript-eslint.io&#41; in your project.&#41;)
[//]: # ([//]: # &#40;//----------------------------------&#41;)
[//]: # (# `AIBE1_FinalProject_Team03_FE` &#40;프론트엔드 레포지토리&#41;)

[//]: # ()
[//]: # (이 레포지토리는 Ticketmon 프로젝트의 프론트엔드 애플리케이션 코드를 관리합니다. 백엔드 레포지토리&#40;`AIBE1_FinalProject_Team03`&#41;와 분리되어 독립적으로 개발 및 배포됩니다.)

[//]: # ()
[//]: # (-----)

[//]: # ()
[//]: # (## 🚀 1. 개발 환경 설정 가이드)

[//]: # ()
[//]: # (### 1.1. 필수 설치 도구)

[//]: # ()
[//]: # (* **Node.js**: `v18.x` 이상 권장)

[//]: # (* **npm**: `v9.x` 이상 권장 &#40;Node.js 설치 시 함께 설치됨&#41;)

[//]: # (* **Git**: 최신 버전)

[//]: # ()
[//]: # (### 1.2. 프로젝트 시작하기)

[//]: # ()
[//]: # (1.  **레포지토리 클론:**)

[//]: # ()
[//]: # (    ```bash)

[//]: # (    git clone https://github.com/AIBE-3Team/AIBE1_FinalProject_Team03_FE.git)

[//]: # (    cd AIBE1_FinalProject_Team03_FE)

[//]: # (    ```)

[//]: # ()
[//]: # (2.  **의존성 설치:**)

[//]: # ()
[//]: # (    ```bash)

[//]: # (    npm install)

[//]: # (    ```)

[//]: # ()
[//]: # (    &#40;이 명령은 `package.json`에 정의된 모든 패키지를 설치합니다.&#41;)

[//]: # ()
[//]: # (3.  **환경 변수 설정:**)

[//]: # ()
[//]: # (    * 프로젝트 루트 디렉토리에 `.env` 파일을 생성합니다.)

[//]: # (    * 다음 내용을 `.env` 파일에 추가합니다. `VITE_` 접두사를 사용하는 것이 중요합니다.)

[//]: # ()
[//]: # (    <!-- end list -->)

[//]: # ()
[//]: # (    ```dotenv)

[//]: # (    # .env 파일 내용 &#40;환경에 따라 변경될 수 있습니다&#41;)

[//]: # ()
[//]: # (    # 백엔드 API의 기본 URL 설정)

[//]: # (    # 로컬 개발 환경: IDE에서 실행 중인 백엔드 서버 주소)

[//]: # (    # 운영 환경: 실제 배포된 백엔드 API 도메인 &#40;예: https://api.ticketmon.com/api&#41;)

[//]: # (    VITE_APP_API_URL=http://localhost:8080/api)

[//]: # ()
[//]: # (    # WebSocket 연결을 위한 URL 설정 &#40;대기열 등 실시간 통신용&#41;)

[//]: # (    # 로컬 개발 환경: IDE에서 실행 중인 백엔드 WebSocket 서버 주소)

[//]: # (    # 운영 환경: 실제 배포된 WebSocket 서버 도메인 &#40;예: wss://ws.ticketmon.com/ws/waitqueue&#41;)

[//]: # (    # 참고: ws:// 대신 wss://는 HTTPS와 마찬가지로 보안 소켓 연결을 의미합니다.)

[//]: # (    VITE_APP_WS_URL=ws://localhost:8080/ws/waitqueue)

[//]: # (    ```)

[//]: # ()
[//]: # (    * `.env` 파일은 `.gitignore`에 의해 Git 추적에서 제외되므로 커밋하지 않습니다.)

[//]: # ()
[//]: # (4.  **로컬 개발 서버 실행:**)

[//]: # ()
[//]: # (    * 프로젝트 루트 디렉토리에서 다음 명령어를 실행합니다.)

[//]: # ()
[//]: # (    <!-- end list -->)

[//]: # ()
[//]: # (    ```bash)

[//]: # (    npm run dev)

[//]: # (    ```)

[//]: # ()
[//]: # (    * 개발 서버가 `http://localhost:5173` &#40;기본값&#41;에서 시작됩니다.)

[//]: # ()
[//]: # (5.  **로컬 Nginx를 통한 연동 테스트 &#40;선택 사항 - 백엔드 레포의 Docker Compose 필요&#41;**)

[//]: # ()
[//]: # (    * `docker-compose up --build` 명령어를 통해 `nginx-frontend-server` 컨테이너가 실행 중인지 확인합니다.)

[//]: # (    * 웹 브라우저에서 `http://localhost`로 접속하여 프론트엔드 앱이 정상적으로 표시되는지 확인합니다. Nginx가 `dist` 폴더의 빌드 결과물을 서빙하며, `/api` 및 `/ws` 요청을 백엔드로 프록시합니다.)

[//]: # ()
[//]: # (-----)

[//]: # ()
[//]: # (## 🛠️ 2. 기술 스택 및 주요 도구)

[//]: # ()
[//]: # (* **프레임워크:** React &#40;`v19.x`&#41;)

[//]: # (* **번들러/빌드 도구:** Vite &#40;`v6.x`&#41;)

[//]: # (    * `Vite`는 `React` 코드 자체의 작성 방식에는 영향을 주지 않고, 더 빠르고 효율적인 개발 환경 및 빌드를 제공합니다. `React` 코드 구현에 집중하시면 됩니다.)

[//]: # (* **패키지 관리자:** npm)

[//]: # (* **코드 품질 도구:** ESLint)

[//]: # (* **스타일링:** CSS Modules &#40;또는 일반 CSS&#41;)

[//]: # ()
[//]: # (-----)

[//]: # ()
[//]: # (## 📦 3. 프로젝트 구조 &#40;Vite + React 기본&#41;)

[//]: # ()
[//]: # (```)

[//]: # (.)

[//]: # (├── public/                 # 빌드 시 그대로 복사될 정적 파일 &#40;파비콘, robots.txt 등&#41;)

[//]: # (│   └── vite.svg            # Vite 로고 이미지)

[//]: # (├── src/                    # 애플리케이션의 모든 원본 소스 코드)

[//]: # (│   ├── assets/             # 이미지, 아이콘 등 정적 자원 &#40;import를 통해 사용&#41;)

[//]: # (│   │   └── react.svg)

[//]: # (│   ├── App.css             # 메인 앱 컴포넌트 스타일)

[//]: # (│   ├── App.jsx             # 메인 React 컴포넌트)

[//]: # (│   ├── index.css           # 전역 스타일)

[//]: # (│   └── main.jsx            # React 앱 진입점 &#40;DOM 렌더링 시작&#41;)

[//]: # (├── .env                    # 환경 변수 파일 &#40;Git 추적 제외&#41;)

[//]: # (├── .gitignore              # Git 추적 제외 파일 목록)

[//]: # (├── eslint.config.js        # ESLint 설정 파일)

[//]: # (├── index.html              # 웹 페이지의 기본 HTML 파일)

[//]: # (├── package.json            # 프로젝트 정보 및 의존성 관리)

[//]: # (├── package-lock.json       # 설치된 패키지의 정확한 버전 정보)

[//]: # (├── README.md               # 현재 파일)

[//]: # (└── vite.config.js          # Vite 설정 파일)

[//]: # (```)

[//]: # ()
[//]: # (-----)

[//]: # ()
[//]: # (## 🔄 4. 브랜치 전략 및 Git Workflow)

[//]: # ()
[//]: # (* **기본 브랜치:** `main`)

[//]: # (* **개발 브랜치:** `dev`)

[//]: # (* **기능 개발 브랜치:** `feat/[기능_이름]`)

[//]: # (* **Git Workflow:**)

[//]: # (    1.  `dev` 브랜치에서 최신 변경 사항을 풀&#40;pull&#41; 받습니다.)

[//]: # (        ```bash)

[//]: # (        git checkout dev)

[//]: # (        git pull origin dev)

[//]: # (        ```)

[//]: # (    2.  새로운 기능 개발을 위해 `feat/[기능_이름]` 브랜치를 생성하고 전환합니다.)

[//]: # (        ```bash)

[//]: # (        git checkout -b feat/[기능_이름])

[//]: # (        ```)

[//]: # (    3.  코드 변경 후 로컬에서 충분히 테스트합니다.)

[//]: # (    4.  변경 사항을 커밋합니다. &#40;커밋 메시지 가이드를 따릅니다.&#41;)

[//]: # (        ```bash)

[//]: # (        git add .)

[//]: # (        git commit -m "feat: [기능 요약]")

[//]: # (        ```)

[//]: # (    5.  작업한 브랜치를 원격&#40;remote&#41;에 푸시합니다.)

[//]: # (        ```bash)

[//]: # (        git push origin feat/[기능_이름])

[//]: # (        ```)

[//]: # (    6.  `feat/[기능_이름]` 브랜치에서 `dev` 브랜치로 Pull Request &#40;PR&#41;를 생성합니다.)

[//]: # (    7.  코드 리뷰를 거쳐 PR이 승인되면 `dev` 브랜치에 병합됩니다.)

[//]: # ()
[//]: # (-----)

[//]: # ()
[//]: # (## 📚 5. 기존 테스트 코드 이관 안내 &#40;추후 진행 예정&#41;)

[//]: # ()
[//]: # (* 현재 백엔드 레포지토리에는 프론트엔드 동작 확인을 위한 테스트 코드들이 남아있습니다.)

[//]: # (* 이 코드들은 향후 프론트엔드 팀이 실제 기능 구현을 본격적으로 시작하는 시점에 이 프론트엔드 레포지토리로 이관할 예정입니다.)

[//]: # (* 이전된 후에는 이 `README.md`를 통해 해당 코드들의 위치 및 활용 방안을 안내해 드리겠습니다.)

[//]: # ()
[//]: # (-----)

[//]: # ()
[//]: # ()
[//]: # (## 💡 6. 백엔드 API 연동 예시 &#40;홈 화면 - 콘서트 목록 조회&#41;)

[//]: # ()
[//]: # ( 백엔드 API를 어떻게 연동할지 헷갈리지 않도록, 간단한 콘서트 목록 조회 홈 화면 예시를 제공합니다. 이 코드를 `src/pages/Home.jsx`와 같이 적절한 파일로 만들어 활용할 수 있습니다.)

[//]: # ()
[//]: # (**1. `src/services/api.js` &#40;또는 `src/utils/api.js`와 같이 공통 API 호출 로직을 모아두는 파일&#41;**)

[//]: # ()
[//]: # (```javascript)

[//]: # (// src/services/api.js)

[//]: # (// 백엔드 API의 기본 URL을 .env 파일에서 가져옵니다.)

[//]: # (const API_BASE_URL = import.meta.env.VITE_APP_API_URL;)

[//]: # ()
[//]: # (// GET 요청을 위한 공통 함수 &#40;예시&#41;)

[//]: # (async function get&#40;path&#41; {)

[//]: # (  const response = await fetch&#40;`${API_BASE_URL}${path}`, {)

[//]: # (    method: 'GET',)

[//]: # (    headers: {)

[//]: # (      'Content-Type': 'application/json',)

[//]: # (      // 인증이 필요한 API라면, 쿠키가 자동으로 포함되도록 credentials: 'include'를 사용합니다.)

[//]: # (      // fetch API는 기본적으로 same-origin 요청에는 쿠키를 보내고, cross-origin 요청에는 credentials: 'omit'이 기본값입니다.)

[//]: # (      // 백엔드 CORS 설정 &#40;SecurityConfig&#41;에서 allowCredentials: true 로 설정했기 때문에,)

[//]: # (      // 크로스 오리진 요청 시에도 쿠키가 전송되도록 credentials: 'include'를 명시해야 합니다.)

[//]: # (    },)

[//]: # (    credentials: 'include' // 중요: 쿠키를 주고받기 위해 필수)

[//]: # (  }&#41;;)

[//]: # ()
[//]: # (  if &#40;!response.ok&#41; {)

[//]: # (    // API 응답이 성공&#40;2xx&#41;이 아닐 경우 에러 처리)

[//]: # (    const errorData = await response.json&#40;&#41;;)

[//]: # (    throw new Error&#40;errorData.message || `API 호출 실패: ${response.status}`&#41;;)

[//]: # (  })

[//]: # (  return response.json&#40;&#41;;)

[//]: # (})

[//]: # ()
[//]: # (// 백엔드 콘서트 목록 API 호출 함수)

[//]: # (export async function fetchConcerts&#40;&#41; {)

[//]: # (  // 백엔드의 콘서트 목록 API 경로: /api/concerts &#40;SecurityConfig에서 authenticated&#40;&#41;로 보호될 수 있음&#41;)

[//]: # (  return await get&#40;'/concerts'&#41;;)

[//]: # (})

[//]: # ()
[//]: # (// 추후 로그인, 회원가입 등 다른 API 함수들도 여기에 추가 가능합니다.)

[//]: # (// export async function loginUser&#40;credentials&#41; { ... })

[//]: # (```)

[//]: # ()
[//]: # (2. src/pages/Home.jsx &#40;간단한 홈 화면 컴포넌트&#41;)

[//]: # ()
[//]: # (```JavaScript)

[//]: # ()
[//]: # (// src/pages/Home.jsx)

[//]: # (import React, { useState, useEffect } from 'react';)

[//]: # (import { fetchConcerts } from '../services/api'; // 위에서 정의한 API 함수 임포트)

[//]: # (import '../App.css'; // 기본 스타일 임포트 &#40;App.css 사용 예시&#41;)

[//]: # ()
[//]: # (function Home&#40;&#41; {)

[//]: # (  const [concerts, setConcerts] = useState&#40;[]&#41;;)

[//]: # (  const [loading, setLoading] = useState&#40;true&#41;;)

[//]: # (  const [error, setError] = useState&#40;null&#41;;)

[//]: # ()
[//]: # (  useEffect&#40;&#40;&#41; => {)

[//]: # (    async function getConcerts&#40;&#41; {)

[//]: # (      try {)

[//]: # (        setLoading&#40;true&#41;;)

[//]: # (        setError&#40;null&#41;;)

[//]: # (        // 백엔드에서 콘서트 목록 데이터를 가져옵니다.)

[//]: # (        // fetchConcerts 함수는 /api/concerts 경로로 요청을 보냅니다.)

[//]: # (        const response = await fetchConcerts&#40;&#41;;)

[//]: # (        // 백엔드 SuccessResponse 구조에 따라 data 필드에 실제 목록이 있을 수 있습니다.)

[//]: # (        setConcerts&#40;response.data.content || response.data || []&#41;; // 백엔드 응답 구조에 맞춤 &#40;Page 객체일 경우 content, 아니면 data&#41;)

[//]: # (      } catch &#40;err&#41; {)

[//]: # (        console.error&#40;"콘서트 목록을 가져오는 데 실패했습니다:", err&#41;;)

[//]: # (        setError&#40;err.message || "콘서트 목록을 불러오지 못했습니다."&#41;;)

[//]: # (      } finally {)

[//]: # (        setLoading&#40;false&#41;;)

[//]: # (      })

[//]: # (    })

[//]: # (    getConcerts&#40;&#41;;)

[//]: # (  }, []&#41;;)

[//]: # ()
[//]: # (  if &#40;loading&#41; {)

[//]: # (    return <div className="card">로딩 중...</div>;)

[//]: # (  })

[//]: # ()
[//]: # (  if &#40;error&#41; {)

[//]: # (    return <div className="card" style={{ color: 'red' }}>에러: {error}</div>;)

[//]: # (  })

[//]: # ()
[//]: # (  return &#40;)

[//]: # (    <div className="container">)

[//]: # (      <h1>공연 목록</h1>)

[//]: # (      {concerts.length === 0 ? &#40;)

[//]: # (        <p>현재 등록된 공연이 없습니다.</p>)

[//]: # (      &#41; : &#40;)

[//]: # (        <ul className="concert-list">)

[//]: # (          {concerts.map&#40;concert => &#40;)

[//]: # (            <li key={concert.concertId} className="concert-item">)

[//]: # (              <h3>{concert.title}</h3>)

[//]: # (              <p>아티스트: {concert.artist}</p>)

[//]: # (              <p>장소: {concert.venueName}</p>)

[//]: # (              <p>날짜: {concert.concertDate}</p>)

[//]: # (              {/* 추가 정보 표시 &#40;필요시&#41; */})

[//]: # (            </li>)

[//]: # (          &#41;&#41;})

[//]: # (        </ul>)

[//]: # (      &#41;})

[//]: # (      <p className="read-the-docs">)

[//]: # (        이것은 백엔드에서 데이터를 가져오는 예시입니다.)

[//]: # (      </p>)

[//]: # (    </div>)

[//]: # (  &#41;;)

[//]: # (})

[//]: # ()
[//]: # (export default Home;)

[//]: # (```)

[//]: # (3. src/main.jsx 수정 &#40;진입점 변경&#41;)

[//]: # ()
[//]: # (- App.jsx 대신 Home.jsx 컴포넌트가 렌더링되도록 main.jsx 파일을 수정합니다.)

[//]: # ()
[//]: # ()
[//]: # (```JavaScript)

[//]: # ()
[//]: # (// src/main.jsx)

[//]: # (import React from 'react';)

[//]: # (import { createRoot } from 'react-dom/client';)

[//]: # (import './index.css'; // 전역 스타일)

[//]: # (import App from './App.jsx'; // 기존 App 컴포넌트)

[//]: # (import Home from './pages/Home.jsx'; // 새로 만든 Home 컴포넌트 임포트)

[//]: # ()
[//]: # (createRoot&#40;document.getElementById&#40;'root'&#41;&#41;.render&#40;)

[//]: # (  <React.StrictMode>)

[//]: # (    {/* <App /> 대신 Home 컴포넌트를 렌더링합니다. */})

[//]: # (    <Home />)

[//]: # (  </React.StrictMode>,)

[//]: # (&#41;;)

[//]: # (```)

[//]: # (4. 폴더 생성 및 파일 배치:)

[//]: # ()
[//]: # (- src 폴더 안에 services 폴더를 생성하고 api.js 파일을 저장합니다.)

[//]: # (- src 폴더 안에 pages 폴더를 생성하고 Home.jsx 파일을 저장합니다.)

[//]: # ()
[//]: # (---)

[//]: # (**[테스트 방법]**)

[//]: # (1. 위 코드들을 프론트엔드 레포지토리&#40;AIBE1_FinalProject_Team03_FE&#41;에 추가합니다.)

[//]: # (2. 백엔드 Spring Boot 앱이 실행 중인지 확인합니다.)

[//]: # (3. Docker 컨테이너 &#40;Redis, LocalStack, Nginx&#41;가 실행 중인지 확인합니다.)

[//]: # (4. 프론트엔드 레포지토리 터미널에서 npm run dev를 실행합니다.)

[//]: # (5. 웹 브라우저에서 http://localhost로 접속하여 콘서트 목록이 정상적으로 표시되는지 확인합니다. &#40;백엔드 DB에 콘서트 데이터가 있어야 합니다.&#41;)

[//]: # (6. 개발자 도구 Network 탭에서 /api/concerts 호출이 200 OK 응답을 받는지 확인합니다.)

[//]: # (---)

[//]: # (이 예시가 팀원들이 백엔드 연동을 시작하는 데 큰 도움이 되기를 바랍니다!)
# `AIBE1_FinalProject_Team03_FE` (프론트엔드 레포지토리)

이 레포지토리는 Ticketmon 프로젝트의 프론트엔드 애플리케이션 코드를 관리합니다. 기존 백엔드 레포지토리(`AIBE1_FinalProject_Team03`)에서 분리되어, 프론트엔드 팀이 독립적으로 개발 및 배포를 진행할 수 있도록 구성되었습니다.

---

## 🚀 1. 개발 환경 설정 가이드

### 1.1. 필수 설치 도구

* **Node.js**: `v18.x` 이상 권장
* **npm**: `v9.x` 이상 권장 (Node.js 설치 시 함께 설치됨)
* **Git**: 최신 버전
* **Docker Desktop**: 백엔드 인프라(Redis, LocalStack, Nginx) 실행 및 로컬 환경 테스트를 위해 필요합니다.

### 1.2. 프로젝트 시작하기

1.  **프론트엔드 레포지토리 클론:**
    ```bash
    git clone [https://github.com/AIBE-3Team/AIBE1_FinalProject_Team03_FE.git](https://github.com/AIBE-3Team/AIBE1_FinalProject_Team03_FE.git)
    cd AIBE1_FinalProject_Team03_FE
    ```
2.  **의존성 설치:**
    ```bash
    npm install
    ```
    (이 명령은 `package.json`에 정의된 모든 패키지를 설치합니다.)
3.  **환경 변수 설정:**
    * 프로젝트 루트 디렉토리에 `.env` 파일을 생성합니다.
    * 다음 내용을 `.env` 파일에 추가합니다. `VITE_` 접두사를 사용하는 것이 중요합니다.

    ```dotenv
    # .env 파일 내용 (환경에 따라 변경될 수 있습니다)

    # 백엔드 API의 기본 URL 설정
    # 로컬 개발 환경: IDE에서 실행 중인 백엔드 서버 주소
    # 운영 환경: 실제 배포된 백엔드 API 도메인 (예: [https://api.ticketmon.com/api](https://api.ticketmon.com/api))
    VITE_APP_API_URL=http://localhost:8080/api

    # WebSocket 연결을 위한 URL 설정 (대기열 등 실시간 통신용)
    # 로컬 개발 환경: IDE에서 실행 중인 백엔드 WebSocket 서버 주소
    # 운영 환경: 실제 배포된 WebSocket 서버 도메인 (예: wss://[ws.ticketmon.com/ws/waitqueue](https://ws.ticketmon.com/ws/waitqueue))
    VITE_APP_WS_URL=ws://localhost:8080/ws/waitqueue
    ```
    * `.env` 파일은 `.gitignore`에 의해 Git 추적에서 제외되므로 **절대 커밋하지 않습니다.**

4.  **백엔드 앱 및 인프라 실행 (백엔드 레포지토리 `ticketmon-go` 필요)**
    * **백엔드 앱 (Spring Boot) 실행:** IntelliJ IDEA에서 백엔드 레포지토리(`ticketmon-go`)를 열고 `TicketmonGoApplication.java`를 실행합니다. (`http://localhost:8080`에서 시작)
    * **Docker 컨테이너 (Redis, LocalStack, Nginx) 실행:** `ticketmon-go` 레포지토리 루트에서 다음 명령어를 실행합니다.
        ```bash
        docker-compose up --build
        ```
      (Redis, LocalStack, Nginx 컨테이너가 실행됩니다. Nginx는 `http://localhost`를 통해 프론트엔드 앱을 서빙합니다.)

5.  **프론트엔드 로컬 개발 서버 실행:**
    * 이 레포지토리(`AIBE1_FinalProject_Team03_FE`)의 루트 디렉토리에서 다음 명령어를 실행합니다.
    ```bash
    npm run dev
    ```
    * 개발 서버가 `http://localhost:5173` 또는 다른 사용 가능한 포트에서 시작됩니다. (예: `http://localhost:5174`)

### 1.3. 로컬 환경 테스트 방법 ✅

모든 앱과 컨테이너가 실행 중인 상태에서:

1.  **웹 브라우저로 접속:** `http://localhost` 로 접속하여 프론트엔드 앱이 Nginx를 통해 정상적으로 표시되는지 확인합니다. (Vite + React 기본 페이지 ~~또는 콘서트 목록 예시 페이지~~)
2.  **개발자 도구 확인 (F12):**
    * `Network` 탭에서 `/api/concerts` (콘서트 목록 예시를 구현했다면) 와 같은 백엔드 API 호출이 `200 OK` 응답을 받는지 확인합니다.(`http://localhost:5174`)
    * **⚠️ WebSocket 연결 테스트 (현재 이슈 확인 중)**
        * `Network` 탭의 `WS` 필터에서 `ws://localhost:8080/ws/waitqueue` WebSocket 연결 상태를 확인합니다.
        * **현재 이 WebSocket 대기열 진입 API (`/api/queue/enter`)는 백엔드 내부 오류로 인해 `500 Internal Server Error`를 반환하고 있습니다. (이전 500에서 400으로 변경됨)** <br>이 부분은 백엔드 대기열 담당하시는 분이 확인해주시면 좋을 것 같습니다.
        * 따라서 **현재로서는 팀원이WebSocket 연결이 실패하더라도 정상적인 상황**입니다. (향후 해결되면 이 안내 문구를 제거하세요.
        * [//]: # ( * **이 부분은 백엔드 대기열 담당 팀원이 `WaitingQueueController.java`에서 `@RequestParam` 대신 `@RequestBody` DTO를 사용하도록 수정해야 합니다.** &#40;클라이언트와 서버의 파라미터 전달 방식 불일치&#41;.)
        * [//]: # (    * `Network` 탭의 `WS` 필터에서 `ws://localhost:8080/ws/waitqueue` WebSocket 연결이 `101 Switching Protocols` 후 `902.0`으로 성공하는지 확인합니다.)
    * `Console` 탭에 CORS 관련 오류나 기타 JavaScript 오류가 없는지 확인합니다.
        * **💡 참고:** 현재 백엔드 `SecurityConfig`에 `anyRequest().permitAll()`이 임시 활성화되어 있으므로, 이 단계에서는 **CORS 오류가 발생하지 않는 것이 정상**입니다.

3.  **백엔드 API 직접 테스트 (Swagger UI):**
    * `http://localhost:8080/swagger-ui/index.html` 로 접속하여 백엔드 API가 정상 작동하는지 확인합니다.
    * **💡 참고:** 현재 백엔드 `SecurityConfig`에 `anyRequest().permitAll()`이 임시 활성화되어 있으므로, 이 단계에서는 **CORS 오류가 발생하지 않는 것이 정상**입니다.


---

## 🛠️ 2. 기술 스택 및 주요 도구

* **프레임워크:** React (`v19.x`)
* **번들러/빌드 도구:** Vite (`v6.x`)
    * `Vite`는 `React` 코드 자체의 작성 방식에는 영향을 주지 않고, 더 빠르고 효율적인 개발 환경 및 빌드를 제공합니다. `React` 코드 구현에 집중하시면 됩니다.
* **패키지 관리자:** npm
* **코드 품질 도구:** ESLint
* **스타일링:** CSS Modules (또는 일반 CSS)

---

## 📦 3. 프로젝트 구조 (Vite + React 기본)
```
.
├── public/                 # 빌드 시 그대로 복사될 정적 파일 (파비콘, robots.txt 등)
│   └── vite.svg            # Vite 로고 이미지
├── src/                    # 애플리케이션의 모든 원본 소스 코드
│   ├── assets/             # 이미지, 아이콘 등 정적 자원 (import를 통해 사용)
│   │   └── react.svg
│   ├── App.css             # 메인 앱 컴포넌트 스타일
│   ├── App.jsx             # 메인 React 컴포넌트 (현재 기본 렌더링은 Home.jsx로 변경됨)
│   ├── index.css           # 전역 스타일
│   ├── main.jsx            # React 앱 진입점 (DOM 렌더링 시작, Home.jsx 렌더링)
│   ├── pages/              # 페이지 컴포넌트 (예: Home.jsx)
│   │   └── Home.jsx        # 콘서트 목록 조회 예시 홈 화면 컴포넌트
│   └── services/           # API 호출 로직 등 서비스 파일 (예: api.js)
│       └── api.js          # 백엔드 API 연동 예시 함수 포함
├── .env                    # 환경 변수 파일 (Git 추적 제외)
├── .gitignore              # Git 추적 제외 파일 목록
├── eslint.config.js        # ESLint 설정 파일
├── index.html              # 웹 페이지의 기본 HTML 파일
├── package.json            # 프로젝트 정보 및 의존성 관리
├── package-lock.json       # 설치된 패키지의 정확한 버전 정보
├── README.md               # 현재 파일
└── vite.config.js          # Vite 설정 파일

```
---

## 🔄 4. 브랜치 전략 및 Git Workflow

* **기본 브랜치:** `main`
* **개발 브랜치:** `dev`
* **기능 개발 브랜치:** `feat/[기능_이름]`
* **Git Workflow:**
    1.  `dev` 브랜치에서 최신 변경 사항을 풀(pull) 받습니다.
        ```bash
        git checkout dev
        git pull origin dev
        ```
    2.  새로운 기능 개발을 위해 `feat/[기능_이름]` 브랜치를 생성하고 전환합니다.
        ```bash
        git checkout -b feat/[기능_이름]
        ```
    3.  코드 변경 후 로컬에서 충분히 테스트합니다.
    4.  변경 사항을 커밋합니다. (커밋 메시지 가이드를 따릅니다.)
        ```bash
        git add .
        git commit -m "feat: [기능 요약]"
        ```
    5.  작업한 브랜치를 원격(remote)에 푸시합니다.
        ```bash
        git push origin feat/[기능_이름]
        ```
    6.  `feat/[기능_이름]` 브랜치에서 `dev` 브랜치로 Pull Request (PR)를 생성합니다.
    7.  코드 리뷰를 거쳐 PR이 승인되면 `dev` 브랜치에 병합됩니다.

---

## 📚 5. 기존 테스트 코드 이관 안내 (추후 진행 예정)

* 현재 백엔드 레포지토리에는 프론트엔드 동작 확인을 위한 테스트 코드들이 남아있습니다.
* 이 코드들은 향후 프론트엔드 팀이 실제 기능 구현을 본격적으로 시작하는 시점에 이 프론트엔드 레포지토리로 이관할 예정입니다.
* 이전된 후에는 이 `README.md`를 통해 해당 코드들의 위치 및 활용 방안을 안내해 드리겠습니다.

---

## ⚠️ 6. 중요한 참고 사항 (인증 및 배포 전략)

* **인증(로그인/JWT) 관련 이슈 (현재 블로킹 방지 우회):**
    * 현재 백엔드의 `LoginFilter`와 `SecurityConfig` 간의 복합적인 문제로 인해 `401 Unauthorized` 오류가 발생하고 JWT 쿠키가 정상적으로 발행되지 않는 이슈가 있습니다.
    * **임시 조치로 `SecurityConfig.java`에서 모든 요청에 대해 `permitAll()`을 활성화한 상태입니다.** (`.anyRequest().permitAll()` 활성화)
    * **이 문제는 프론트엔드 팀의 개발을 블로킹하지 않기 위한 임시적인 우회 조치입니다.** 로그인 관련 기능 담당자님이 이 문제와 관련해 추후 확인해주시면 좋을 것 같습니다.
    * 이로 인해 현재는 인증 없이도 모든 API에 접근 가능합니다.
* **프론트엔드 배포 전략 (AWS 비용 최소화):**
    * CI/CD 단계에서 `Vite`로 빌드된 프론트엔드 정적 파일은 `AWS S3`에 직접 배포되지 않고, `GitHub Actions`의 **'아티팩트'로만 저장**됩니다. 이는 `AWS` 비용 발생을 `AWS` 마이그레이션 시점까지 최소화하기 위함입니다.
    * 로컬 개발 환경에서는 `docker-compose.yml`에 추가된 `Nginx` 컨테이너가 프론트엔드의 `dist` 폴더를 서빙하게 됩니다.
    * 실제 `AWS`로 마이그레이션할 때 `GitHub Actions`를 통해 `AWS S3`와 `CloudFront`로 자동 배포가 이루어질 것입니다.

---
