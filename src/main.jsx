// React 앱의 진입점 - 콘서트 페이지와 통일된 디자인
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css'; // 통일된 전역 CSS
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './shared/hooks/useToast.jsx';
import ToastContainer from './shared/components/ui/ToastContainer';

// 에러 바운더리 컴포넌트 (콘서트 페이지와 통일된 스타일)
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // 에러 리포팅 서비스로 전송 (예: Sentry)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
                    <div className="max-w-md mx-auto text-center">
                        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 shadow-lg">
                            {/* 에러 아이콘 */}
                            <div className="text-6xl mb-4">😵</div>

                            {/* 에러 제목 */}
                            <h1 className="text-2xl font-bold text-red-400 mb-3">
                                앱에 문제가 발생했습니다
                            </h1>

                            {/* 에러 설명 */}
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                예상치 못한 오류가 발생했습니다. 페이지를
                                새로고침하거나 잠시 후 다시 시도해주세요.
                            </p>

                            {/* 액션 버튼들 */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                >
                                    🔄 페이지 새로고침
                                </button>

                                <button
                                    onClick={() => (window.location.href = '/')}
                                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                >
                                    🏠 홈으로 이동
                                </button>
                            </div>

                            {/* 개발 모드에서만 에러 상세 정보 표시 */}
                            {import.meta.env.DEV && this.state.error && (
                                <details className="mt-6 text-left">
                                    <summary className="text-gray-400 text-sm cursor-pointer hover:text-gray-300">
                                        개발자 정보 (클릭하여 펼치기)
                                    </summary>
                                    <pre className="mt-2 text-xs text-red-300 bg-gray-900 p-3 rounded border overflow-auto max-h-32">
                                        {this.state.error.toString()}
                                    </pre>
                                </details>
                            )}
                        </div>

                        {/* 추가 도움말 */}
                        <p className="text-gray-500 text-sm mt-6">
                            문제가 지속되면 고객센터(1588-1234)로 문의해주세요.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

// OneSignal 초기화 (에러 처리 강화)
const initializeOneSignal = async () => {
    try {
        if (!import.meta.env.VITE_ONE_SIGNAL_APP_ID) {
            console.warn('OneSignal App ID가 설정되지 않았습니다.');
            return;
        }

        window.OneSignalDeferred = window.OneSignalDeferred || [];
        OneSignalDeferred.push(async (OneSignal) => {
            try {
                await OneSignal.init({
                    appId: import.meta.env.VITE_ONE_SIGNAL_APP_ID,
                    allowLocalhostAsSecureOrigin: true,
                    serviceWorkerParam: { scope: '/' },
                    serviceWorkerPath: '/OneSignalSDKWorker.js',
                    serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
                    // 알림 권한 요청 자동화 방지 (사용자 동의 후 수동 요청)
                    autoRegister: false,
                    notifyButton: {
                        enable: false, // 기본 알림 버튼 비활성화
                    },
                });

                console.log('OneSignal 초기화 완료');
            } catch (error) {
                console.error('OneSignal 초기화 실패:', error);
            }
        });
    } catch (error) {
        console.error('OneSignal 설정 실패:', error);
    }
};

// OneSignal 초기화 실행
initializeOneSignal();

// 전역 에러 핸들러 (콘솔 로깅 및 리포팅)
window.addEventListener('error', (event) => {
    console.error('전역 에러:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
    });

    // 프로덕션에서 에러 리포팅 서비스로 전송
    if (!import.meta.env.DEV) {
        // 예: Sentry.captureException(event.error);
    }
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('처리되지 않은 Promise 거부:', event.reason);

    // 프로덕션에서 에러 리포팅 서비스로 전송
    if (!import.meta.env.DEV) {
        // 예: Sentry.captureException(event.reason);
    }
});

// 성능 측정 (선택사항)
const measurePerformance = () => {
    if ('performance' in window && 'getEntriesByType' in performance) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const navigation =
                    performance.getEntriesByType('navigation')[0];
                const paint = performance.getEntriesByType('paint');

                console.log('성능 측정:', {
                    'DOM 로딩 시간': Math.round(
                        navigation.domContentLoadedEventEnd -
                            navigation.navigationStart,
                    ),
                    '페이지 로딩 시간': Math.round(
                        navigation.loadEventEnd - navigation.navigationStart,
                    ),
                    'First Paint': paint.find((p) => p.name === 'first-paint')
                        ?.startTime,
                    'First Contentful Paint': paint.find(
                        (p) => p.name === 'first-contentful-paint',
                    )?.startTime,
                });
            }, 0);
        });
    }
};

// 개발 모드에서만 성능 측정
if (import.meta.env.DEV) {
    measurePerformance();
}

// 메인 앱 렌더링
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            {/*
                BrowserRouter는 애플리케이션 전체를 감싸서 라우팅 기능을 활성화합니다.
                HTML5 History API를 사용하여 URL을 관리하며,
                콘서트 페이지와 동일한 라우팅 시스템을 제공합니다.
            */}
            <BrowserRouter
                future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                }}
            >
                <AuthProvider>
                    <ToastProvider>
                        {/*
                            App 컴포넌트에서 모든 라우트를 정의하며,
                            콘서트 페이지와 통일된 디자인 시스템을 적용합니다.
                        */}
                        <App />
                        <ToastContainer />
                    </ToastProvider>
                </AuthProvider>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>,
);
