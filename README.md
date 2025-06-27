# `AIBE1_FinalProject_Team03_FE` (프론트엔드 레포지토리)

---

> 이 레포지토리는 Ticketmon 프로젝트의 프론트엔드 애플리케이션 코드를 관리합니다. 백엔드 레포지토리(AIBE1_FinalProject_Team03_BE)와 분리되어, 프론트엔드 팀이 독립적으로 개발 및 배포를 진행할 수 있도록 구성되었습니다.

> [❗[프론트엔드 폴더 구조 & 개발 가이드 문서 보러가기]](./ARCHITECTURE_GUIDE.md)

---

## 🚀 1. 개발 환경 설정 가이드

### 1.1. 필수 설치 도구

- Node.js: v18.x 이상 권장
- npm: v9.x 이상 권장 (Node.js 설치 시 함께 설치됨)
- Git: 최신 버전
- Docker Desktop: 백엔드 인프라(Redis, LocalStack, Nginx) 실행 및 로컬 환경 테스트를 위해 필요합니다.

### 1.2. 프로젝트 시작하기

**1. 프론트엔드 레포지토리 클론:**

```bash
    git clone https://github.com/AIBE-3Team/AIBE1_FinalProject_Team03_FE.git
    cd AIBE1_FinalProject_Team03_FE
```

---

**2. 의존성 설치:**

- 프로젝트에 필요한 모든 의존성을 설치합니다. (package.json 기반: react-router-dom, axios 등 포함)

⚡️ 중요: 변경사항을 pull 받은 후에는 반드시 npm install을 다시 실행해야 합니다!

```bash
    npm install
    # 프로젝트에 필요한 모든 의존성을 설치합니다. (package.json 기반)
    # react-router-dom (클라이언트 라우팅), axios (API 통신) 등 포함

    # 만약 이전에 설치하지 않았다면 개별적으로 설치:
    # npm install react-router-dom
    # npm install axios
```

(이 명령은 package.json에 정의된 모든 패키지를 설치합니다.)

---

**3. Tailwind CSS (v3) 설치 및 설정:**

- 안정적인 개발 환경을 위해 Tailwind CSS v3를 설치하고 설정합니다. (이 과정은 이미 완료되어 파일에 반영되었습니다.)

  - Tailwind CSS (v3) 및 필수 라이브러리 설치:
    ```Bash
        npm install -D tailwindcss@^3.4.4 postcss autoprefixer
    ```
  - `postcss.config.js`** 파일 생성 및 설정:** 프로젝트 루트에 `postcss.config.js` 파일을 생성하고 아래 내용을 추가합니다.
    ```JavaScript
        // postcss.config.js
        export default {
            plugins: {
                tailwindcss: {},
                autoprefixer: {}
            }
        };
    ```
  - `tailwind.config.js` **파일 생성 및 설정:+** 프로젝트 루트에 `tailwind.config.js` 파일을 생성하고 아래 내용을 추가합니다. `content` 경로를 정확히 설정하는 것이 중요합니다.
    ```JavaScript
        // tailwind.config.js
        /** @type {import('tailwindcss').Config} */
        export default {
            content: [
                './index.html',
                './src/**/*.{js,jsx,ts,tsx}' // src 폴더 내의 모든 관련 파일을 스캔하도록 설정
            ],
            theme: {
                extend: {}
            },
            plugins: []
        };
    ```
  - **메인 CSS 파일 (`src/index.css`)에 Tailwind 지시어 추가:** `src/index.css` 파일의 모든 기존 내용을 지우고 아래 내용만 남겨둡니다.
    `CSS
        /* src/index.css */
        @tailwind base;
        @tailwind components;
        @tailwind utilities;
    `
    <br>

  Tailwind CSS v3가 프로젝트에 기본적으로 설정되어 있습니다. 별도의 추가 설치 없이 바로 유틸리티 클래스를 사용하여 UI를 구성할 수 있습니다. 자세한 내용은 [Tailwind CSS 공식 문서](https://tailwindcss.com/docs)를 참조해주세요.

---

**4. 환경 변수 설정:**

- 프로젝트 루트 디렉토리에 .env 파일을 생성합니다.
- 다음 내용을 .env 파일에 추가합니다. VITE\_ 접두사를 사용하는 것이 중요합니다.

```
    # .env 파일 내용 (환경에 따라 변경될 수 있습니다)

    # 백엔드 API의 기본 URL 설정
    # 로컬 개발 환경: IDE에서 실행 중인 백엔드 서버 주소 (Nginx 프록시를 통해 접근)
    # 운영 환경: 실제 배포된 백엔드 API 도메인 (예: https://api.ticketmon.com/api)
    VITE_APP_API_URL=http://localhost:8080/api

    # WebSocket 연결을 위한 URL 설정 (대기열 등 실시간 통신용)
    # 로컬 개발 환경: IDE에서 실행 중인 백엔드 WebSocket 서버 주소 (Nginx 프록시를 통해 접근)
    # 운영 환경: 실제 배포된 WebSocket 서버 도메인 (예: wss://ws.ticketmon.com/ws/waitqueue)
    # 참고: ws:// 대신 wss://는 HTTPS와 마찬가지로 보안 소켓 연결을 의미합니다.
    VITE_APP_WS_URL=ws://localhost:8080/ws/waitqueue
```

- .env 파일은 .gitignore에 의해 Git 추적에서 제외되므로 절대 커밋하지 않습니다.

**5. 백엔드 앱 및 인프라 실행 (백엔드 레포지토리 AIBE1_FinalProject_Team03_BE 필요)**

- **백엔드 앱 (Spring Boot) 실행**: IntelliJ IDEA에서 백엔드 레포지토리(AIBE1_FinalProject_Team03_BE)를 열고 TicketmonGoApplication.java를 실행합니다. (http://localhost:8080에서 시작)
- **Docker 컨테이너 (Redis, LocalStack, Nginx) 실행**: AIBE1_FinalProject_Team03_BE 레포지토리 루트에서 다음 명령어를 실행합니다.
  ```bash
    docker-compose up --build
  ```
  (Redis, LocalStack, Nginx 컨테이너가 실행됩니다. Nginx는 http://localhost를 통해 프론트엔드 앱을 서빙합니다.)

**6. 프론트엔드 로컬 개발 서버 실행:**

- 이 레포지토리(AIBE1_FinalProject_Team03_FE)의 루트 디렉토리에서 다음 명령어를 실행합니다.

```bash
    npm run dev
```

- 개발 서버가 http://localhost:5173 (기본값) 또는 다른 사용 가능한 포트에서 시작됩니다. (예: http://localhost:5174)

### 1.3. 로컬 환경 테스트 방법 ✅

모든 앱과 컨테이너가 실행 중인 상태에서:

1. 웹 브라우저로 접속: http://localhost 로 접속하여 프론트엔드 앱이 Nginx를 통해 정상적으로 표시되는지 확인합니다. (react-router-dom을 통해 페이지 전환 테스트)

2. 개발자 도구 확인 (F12):

   - Network 탭에서 백엔드 API 호출(예: /api/concerts)이 200 OK 응답을 받는지 확인합니다.
   - ⚠️ WebSocket 연결 테스트 (현재 이슈 확인 중)
     - Network 탭의 WS 필터에서 ws://localhost:8080/ws/waitqueue WebSocket 연결 상태를 확인합니다.
     - 현재 백엔드 대기열 진입 API (/api/queue/enter)는 백엔드 내부 오류로 인해 500 Internal Server Error를 반환하고 있습니다. (이전 500에서 400으로 변경됨)
     - 따라서 현재로서는 WebSocket 연결이 실패하더라도 정상적인 상황입니다. (백엔드 대기열 담당 팀원 확인 필요)
   - Console 탭에 CORS 관련 오류나 기타 JavaScript 오류가 없는지 확인합니다.

3. 백엔드 API 직접 테스트 (Swagger UI):
   - http://localhost:8080/swagger-ui.html 로 접속하여 백엔드 API가 정상 작동하는지 확인합니다.
   - 💡 참고: 이제 백엔드 SecurityConfig에 anyRequest().authenticated() 등 실질적인 접근 권한 규칙이 적용되었으므로, Swagger UI를 통한 API 테스트 시 로그인된 상태(브라우저 쿠키 존재)여야만 authenticated() 또는 hasRole()이 적용된 API에 접근 가능합니다.

## 🛠️ 2. 기술 스택 및 주요 도구

- 프레임워크: React (v19.x)
- 번들러/빌드 도구: Vite (v6.x)
  - Vite는 React 코드 자체의 작성 방식에는 영향을 주지 않고, 더 빠르고 효율적인 개발 환경 및 빌드를 제공합니다. React 코드 구현에 집중하시면 됩니다.
- 패키지 관리자: npm
- 클라이언트 측 HTTP 통신: axios (API 연동 편의성 증대)
- 클라이언트 측 라우팅: react-router-dom (SPA 페이지 전환 관리)
- 코드 품질 도구: ESLint
- 스타일링: Tailwind CSS (v3), CSS Modules (또는 일반 CSS)

## 📦 3. 프로젝트 구조 (Vite + React 기본)

```
.
├── public/                 # 빌드 시 그대로 복사될 정적 파일 (파비콘, robots.txt 등)
│   └── vite.svg            # Vite 로고 이미지 (예시)
├── src/                    # 애플리케이션의 모든 원본 소스 코드
│   ├── assets/             # 이미지, 아이콘 등 정적 자원 (import를 통해 사용)
│   │   └── react.svg       # React 로고 이미지 (예시)
│   ├── context/            # React Context API를 사용하여 전역 상태를 관리하는 파일
│   │   ├── AuthContext.jsx
│   │   └── BookingProcessContext.jsx
│   ├── features/           # 도메인 또는 기능별로 관련된 모든 코드를 모아둔 폴더
│   │   ├── admin/          # 관리자 기능 (컴포넌트, 훅, 서비스, 타입 등)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── auth/           # 인증 기능 (로그인, 회원가입 관련 컴포넌트, 훅, 서비스, 타입 등)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── booking/        # 예매 기능 (좌석 선택, 결제 관련 컴포넌트, 훅, 서비스, 타입 등)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── concert/        # 콘서트 관련 기능 (목록, 상세, 리뷰 컴포넌트, 훅, 서비스, 타입 등)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── user/           # 사용자 관련 기능 (프로필, 예매/결제 내역 컴포넌트, 훅, 서비스, 타입 등)
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       └── types/
│   ├── pages/              # 각 라우트(경로)에 매핑될 최상위 페이지 컴포넌트들을 모아두는 폴더
│   │   ├── admin/          # 관리자 페이지
│   │   │   ├── ConcertManagement.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SeatManagement.jsx
│   │   │   ├── SellerStatus.jsx
│   │   │   └── SystemStatus.jsx
│   │   ├── auth/           # 인증 관련 페이지
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── SocialCallback.jsx
│   │   ├── booking/        # 예매 관련 페이지
│   │   │   ├── Payment.jsx
│   │   │   └── SeatSelectionPage.jsx
│   │   ├── concert/        # 콘서트 관련 페이지
│   │   │   ├── ConcertDetailPage.jsx
│   │   │   └── ConcertListPage.jsx
│   │   ├── home/           # 홈 페이지
│   │   │   └── Home.jsx
│   │   ├── mypage/         # 마이페이지
│   │   │   ├── BookingHistory.jsx
│   │   │   ├── PaymentHistory.jsx
│   │   │   └── Profile.jsx
│   │   └── NotFound.jsx    # 404 에러 페이지
│   ├── services/           # 애플리케이션 전반에 걸쳐 사용되는 공통 서비스 정의 (API 클라이언트 설정 등)
│   │   ├── api.js          # 백엔드 API 클라이언트 설정 및 공통 설정
│   │   └── config.js
│   ├── shared/             # 여러 도메인/기능에서 공통으로 사용되는 유틸리티, UI 컴포넌트, 훅, 스토어 등
│   │   ├── components/     # 재사용 가능한 UI 컴포넌트
│   │   │   ├── layout/     # 공통 레이아웃 (헤더, 푸터, 사이드바 등)
│   │   │   ├── ui/         # 범용 UI 요소 (버튼, 입력 필드 등)
│   │   ├── hooks/          # 재사용 가능한 커스텀 훅
│   │   ├── stores/         # Zustand 등 전역 상태 관리 스토어 (선택 사항)
│   │   ├── types/          # 공통으로 사용되는 타입 정의
│   │   └── utils/          # 범용 유틸리티 함수
│   ├── styles/             # 전역 및 공통 스타일 파일
│   │   ├── components.css
│   │   ├── globals.css
│   │   └── variables.css
│   ├── App.css             # 메인 앱 컴포넌트의 스타일 정의
│   ├── App.jsx             # 애플리케이션의 메인 컴포넌트 (라우팅 정의, 주요 레이아웃 구성)
│   ├── index.css           # 전역 스타일 정의 (기본 HTML 요소 스타일링, reset CSS 등)
│   └── main.jsx            # React 앱의 진입점 (ReactDOM 렌더링 시작, BrowserRouter 설정)
├── .env                    # 환경 변수 파일 (API URL, WS URL 등. Git 추적 제외)
├── .gitignore              # Git 추적 제외 파일 목록 (빌드 결과물, 환경 변수 등)
├── eslint.config.js        # ESLint 설정 파일 (코드 품질 및 스타일 가이드라인)
├── index.html              # 웹 페이지의 기본 HTML 파일 (React 앱이 마운트될 root 요소 포함)
├── package.json            # 프로젝트 정보 및 의존성 관리 (설치된 라이브러리 목록)
├── package-lock.json       # 설치된 패키지의 정확한 버전 및 종속성 트리 정보
├── README.md               # 현재 이 문서 (프로젝트 설명, 개발 가이드)
├── postcss.config.js       # PostCSS 설정 파일 (Tailwind CSS 통합)
├── tailwind.config.js      # Tailwind CSS 설정 파일
└── vite.config.js          # Vite 설정 파일 (빌드 옵션, 개발 서버 설정 등)
```

## 🔄 4. 브랜치 전략 및 Git Workflow

- 기본 브랜치: main
- 개발 브랜치: dev
- 기능 개발 브랜치: feat/[기능_이름]
- Git Workflow:

  1. dev 브랜치에서 최신 변경 사항을 풀(pull) 받습니다.

  ```bash
      git checkout dev
      git pull origin dev
  ```

  2. 새로운 기능 개발을 위해 feat/[기능_이름] 브랜치를 생성하고 전환합니다.

  ```
      git checkout -b feat/[기능_이름]
  ```

  3. 코드 변경 후 로컬에서 충분히 테스트합니다.

  4. 변경 사항을 커밋합니다. (커밋 메시지 가이드를 따릅니다.)

  ```
      git add .
      git commit -m "feat: [기능 요약]"
  ```

  5. 작업한 브랜치를 원격(remote)에 푸시합니다.

  ```
      git push origin feat/[기능_이름]
  ```

  6. feat/[기능_이름] 브랜치에서 dev 브랜치로 Pull Request (PR)를 생성합니다.
  7. 코드 리뷰를 거쳐 PR이 승인되면 dev 브랜치에 병합됩니다.

## 📚 5. 기존 테스트 코드 이관 안내 (추후 진행 예정)

- 현재 백엔드 레포지토리에는 프론트엔드 동작 확인을 위한 테스트 코드들이 남아있습니다.
- 이 코드들은 향후 프론트엔드 레포지토리로 이관할 예정입니다.
- 이전된 후에는 이 README.md를 통해 해당 코드들의 위치 및 활용 방안을 안내해 드리겠습니다.

## ⚠️ 6. 중요한 참고 사항 (인증 및 배포 전략)

- 백엔드 API 인증(로그인/JWT) 관련:
  - 이제 백엔드 SecurityConfig에 anyRequest().authenticated() 등 실질적인 접근 권한 규칙이 적용되었습니다.
  - API 호출 시 유효한 JWT 토큰이 필요합니다.
  - 로컬 테스트 시: ~~localhost:8080/auth/login 에서~~ 로그인 후, 브라우저가 자동으로 보내는 쿠키를 통해 인증을 수행할 수 있습니다. Swagger UI를 통한 테스트도 이 방식으로 진행하면 됩니다.
- 프론트엔드 배포 전략 (AWS 비용 최소화):
  - CI/CD 단계에서 Vite로 빌드된 프론트엔드 정적 파일은 AWS S3에 직접 배포되지 않고, GitHub Actions의 '아티팩트'로만 저장됩니다. 이는 AWS 비용 발생을 AWS 마이그레이션 시점까지 최소화하기 위함입니다.
  - 로컬 개발 환경에서는 docker-compose.yml 에 추가된 Nginx 컨테이너가 프론트엔드의 dist 폴더를 서빙하게 됩니다.
  - 실제 AWS로 마이그레이션할 때 GitHub Actions를 통해 AWS S3와 CloudFront로 자동 배포가 이루어질 것입니다.
