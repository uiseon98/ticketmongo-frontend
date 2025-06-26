# 📢 프론트엔드 폴더 구조 개편 및 인증 모듈 통합 완료 공지

---

> 프론트엔드 프로젝트의 대규모 폴더 구조 개편 및 인증 모듈 통합 작업이 성공적으로 완료되어 `dev` 브랜치에 머지되었습니다! 🎉 <br><br>
이번 작업은 프로젝트의 **유지보수성, 확장성, 그리고 코드 응집력을 크게 향상**시키는 것을 목표로 진행되었습니다.

---

## 🛠️ 주요 변경 사항 요약:

- **`Feature Slices` 패턴 도입**: `src/features` 디렉토리를 통해 기능(도메인)별로 관련된 모든 코드(컴포넌트, 훅, 서비스, 타입 등)를 한곳에 모았습니다.
- **`src/shared` 디렉토리 재정의**: 공통적으로 사용되는 유틸리티, UI 컴포넌트 등을 명확히 분리하여 재사용성을 높였습니다.
- **인증 모듈 통합**:
    - 기존 `src/services/auth.js`의 모든 인증 관련 기능이 `src/features/auth/services/authService.js`로 완전히 통합되었으며, **`apiClient` 사용 표준**을 따르도록 재정비되었습니다. (기존 `src/services/auth.js`는 삭제됨)
    - `AuthContext.jsx` 및 `Register.jsx`, `Login.jsx` 등 관련 파일들의 임포트 경로 및 로직이 새로운 `authService.js`를 사용하도록 업데이트되었습니다.
- **전반적인 설정 및 라우팅 업데이트**: `package.json`(lucide-react 추가), `App.jsx` 라우팅 등 프로젝트 전반의 파일들이 새로운 구조에 맞춰 최신화되었습니다.

<br>

---

---

## 📚 새 폴더 구조 사용 가이드 및 개발 유의사항
> **이번 폴더 구조 개편은 팀원들이 더 쉽게 협업하고, 코드를 찾고, 새로운 기능을 추가할 수 있도록 돕기 위함입니다. 아래 가이드라인을 참고하여 개발을 진행해주세요!**

---
### 1. `src` 디렉토리의 역할 및 파일 생성 규칙

>**`src` 폴더는 모든 원본 소스 코드가 위치하는 곳입니다.**

- **`src/pages/`**:
    - **역할**: 각 라우트(URL 경로)에 직접 매핑되는 최상위 컴포넌트(페이지)들을 모아둡니다.
    - **파일 생성**: `pages/[도메인명]/[페이지명].jsx` 형태로 생성합니다.
        - 예: `src/pages/auth/Login.jsx`, `src/pages/concert/ConcertList.jsx`
    - **유의사항**: 페이지 컴포넌트 자체는 가급적 UI 로직(데이터 페칭, 상태 관리)을 직접 구현하기보다, `features` 폴더의 하위 컴포넌트나 훅을 조합하여 페이지를 구성하는 역할을 합니다.

    <br>

- **`src/features/[도메인명]/`**: (예: `auth`, `concert`, `user`, `admin`, `booking`)
    - **역할**: 특정 도메인(기능)과 관련된 모든 코드(컴포넌트, 훅, 서비스, 타입 정의)를 응집시켜 관리합니다. 이 폴더는 해당 기능의 '작은 애플리케이션'이라고 생각할 수 있습니다.
    - **내부 구조**: 각 `features` 폴더 안에는 다음과 같은 하위 디렉토리를 포함할 수 있습니다.
        - `components/`: 해당 도메인에서만 사용되는 UI 컴포넌트.
        - `hooks/`: 해당 도메인에 특화된 커스텀 훅 (예: `useConcertData.js`, `useLogin.js`).
        - `services/`: 해당 도메인과 관련된 API 통신 로직을 정의한 파일 (예: `concertService.js`, `authService.js`). **여기에 `apiClient`를 임포트하여 사용합니다.**
        - `types/`: 해당 도메인에 특화된 데이터 타입 정의.
    - **유의사항**: 새로운 기능을 개발할 때는 해당 기능이 속하는 도메인(`features/[도메인명]`) 아래에 파일을 생성하는 것을 최우선으로 고려해주세요.

    <br>

- **`src/shared/`**:
    - **역할**: 프로젝트의 여러 도메인(`features`)에서 **공통적으로 재사용**되는 유틸리티, UI 컴포넌트, 훅, 전역 스토어 등을 모아둡니다.
    - **내부 구조**:
        - `components/layout/`: 앱 전체에 적용되는 공통 레이아웃 컴포넌트 (예: `Header`, `Footer`, `MainLayout`).
        - `components/ui/`: 범용적으로 재사용 가능한 UI 요소 (예: `Button`, `InputField`, `Modal`).
        - `hooks/`: 여러 도메인에서 재사용될 수 있는 범용 커스텀 훅 (예: `useLocalStorage.js`, `useDebounce.js`).
        - `stores/`: Zustand와 같은 전역 상태 관리 스토어 (예: `authStore.js`, `cartStore.js`).
        - `types/`: 앱 전체에서 사용되는 공통 타입 정의.
        - `utils/`: 범용 유틸리티 함수 (예: `apiClient.js`, `validation.js`, `helpers.js`).
    - **유의사항**: `shared` 폴더의 코드는 어떤 `features` 폴더에도 의존해서는 안 됩니다. 즉, `shared`는 `features`에 있는 파일을 임포트할 수 없습니다.

    <br>

- **`src/context/`**:
    - **역할**: React Context API를 사용하여 전역 상태를 관리하는 Provider 컴포넌트들을 모아둡니다.
    - **파일 생성**: `[Context명]Context.jsx` 형태로 생성합니다.
        - 예: `src/context/AuthContext.jsx`

    <br>

- **`src/assets/`**:
    - **역할**: 이미지, 아이콘, 폰트 등 정적 자원들을 모아둡니다.
    - **유의사항**: CSS 파일에서 `url()`로 직접 참조하거나, JS/JSX 파일에서 `import`하여 사용합니다.

    <br>

- **`src/styles/`**:
    - **역할**: 전역 및 공통 스타일 파일들을 모아둡니다.
    - **내부 구조**: `variables.css` (CSS 변수), `globals.css` (전역 CSS), `components.css` (공통 컴포넌트 스타일).
    - **유의사항**: Tailwind CSS를 주력으로 사용하므로, 여기에 너무 많은 커스텀 CSS를 추가하기보다 Tailwind 유틸리티 클래스 활용을 우선합니다.

<br>

---

### 2. `apiClient` 사용 표준 및 개발 가이드

> 프로젝트 전반의 **API 통신 일관성과 효율성을 위해 `src/shared/utils/apiClient.js`를 통한 API 호출 표준을 확립했습니다.** 앞으로 모든 API 요청은 이 `apiClient` 인스턴스를 사용하는 것을 원칙으로 합니다.

- **`apiClient`의 역할:**
    - **기본 URL 관리**: `VITE_APP_API_URL` 환경 변수를 통해 백엔드 API의 기본 URL을 중앙에서 관리합니다.
    - **자격 증명(Credential) 포함**: `withCredentials: true` 설정으로 모든 요청에 쿠키/세션(JWT 포함)이 자동으로 포함되어 인증 처리가 용이합니다.
    - **공통 헤더**: `Content-Type: application/json`과 같은 공통 헤더가 기본으로 설정됩니다.
    - **요청/응답 인터셉터**: 요청 전 토큰 삽입, 응답 에러 처리(예: 401/403 응답 시 로그인 페이지 리다이렉트), 성공 응답(`success` 필드 확인) 등의 로직을 중앙에서 관리합니다.

<br>

- **개발 시 참고 사항:**
    - **직접 `axios.create()`를 호출하거나 `fetch` API를 사용하지 마세요.** 모든 API 요청은 `src/shared/utils/apiClient.js`를 임포트하여 사용해야 합니다.
    - **API 서비스 파일 구조**: 각 `features/[도메인명]/services` 디렉토리 내에서 `apiClient`를 임포트하여 해당 도메인에 특화된 API 호출 함수들을 정의합니다.

        ```
        // 예시: src/features/concert/services/concertService.js
        import apiClient from '../../../shared/utils/apiClient'; // shared/utils/apiClient 경로에 유의
        
        export const fetchConcerts = async () => {
            try {
                const response = await apiClient.get('/concerts'); // apiClient 사용
                return response.data.data; // SuccessResponse 구조에 따라
            } catch (error) {
                console.error('Failed to fetch concerts:', error);
                throw error;
            }
        };
        
        ```

    - **에러 처리**: `apiClient`의 응답 인터셉터에서 공통 에러 처리가 이루어지므로, 각 API 호출 함수에서는 필요한 경우에만 추가적인 에러 핸들링을 구현합니다.

<br>

---

### 3. 코딩 컨벤션 및 스타일 가이드

- **파일 및 컴포넌트명**:
    - React 컴포넌트 파일은 `PascalCase`로 작성하고 `.jsx` 확장자를 사용합니다. (예: `Login.jsx`, `ConcertCard.jsx`)
    - 훅 파일은 `use` 접두사를 사용하고 `camelCase`로 작성합니다. (예: `useLogin.js`, `useConcertData.js`)
    - 서비스, 유틸리티 파일은 `camelCase`로 작성합니다. (예: `authService.js`, `validation.js`)
- **컴포넌트 구조**:
    - 함수형 컴포넌트와 React Hooks를 사용합니다.
    - 컴포넌트 내에서 복잡한 로직은 커스텀 훅으로 분리하는 것을 권장합니다.
- **ESLint & Prettier**: 프로젝트에 ESLint와 Prettier가 설정되어 있어 코드 품질과 일관된 스타일을 유지합니다. 코드 커밋 전 `npm run lint:fix` 명령어를 실행하여 자동으로 포맷팅 오류를 수정하는 것을 권장합니다.
- **빈 파일 및 플레이스홀더**: 현재 비어있는 파일들은 향후 구현될 기능이나 특정 목적을 위한 플레이스홀더입니다. `// TODO: [구현 내용]`과 같은 주석을 파일 상단에 추가하여 해당 파일의 목적을 명확히 하고, 향후 개발 시 참고하도록 합니다.

<br>

---
## ⚠️ 필수 조치 사항:

1. **최신 `dev` 브랜치 풀(pull) 또는 리베이스(rebase) 하기**

    ```bash
      git pull origin dev
      # 또는 현재 작업 브랜치에서: git pull origin dev --rebase
    ```

2. **`npm install` 실행하기**
    - `package.json` 변경사항(특히 `lucide-react` 추가)이 반영되도록 반드시 **`npm install`** 명령어를 한 번 더 실행해 주시기 바랍니다.

<br>

### 📚 상세 내용은 PR 메시지 및 `README.md` 참고:

- **머지된 PR 메시지**: 상세한 변경 내용을 확인할 수 있습니다.
- **업데이트된 `README.md` 파일**: 새로운 폴더 구조 등이 최신 정보로 업데이트되었으니 확인해 주세요.

<br>

---
> [❗[메인으로 돌아가기]](./README.md)