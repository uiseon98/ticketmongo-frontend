// 루트 컴포넌트 - 콘서트 페이지와 통일된 디자인

import React, { useContext, useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// 스타일 import
import './App.css';

// 레이아웃
import MainLayout from './shared/components/layout/MainLayout';
import AuthLayout from './shared/components/layout/AuthLayout';
import PublicLayout from './shared/components/layout/PublicLayout.jsx';
import SellerLayout from './shared/components/layout/SellerLayout';
import AdminLayout from './shared/components/layout/AdminLayout';

// Auth Context
import { AuthContext } from './context/AuthContext';

// 페이지 컴포넌트들
import HomePage from './pages/home/Home.jsx';
import LoginPage from './pages/auth/Login.jsx';
import RegisterPage from './pages/auth/Register.jsx';
import ProfilePage from './pages/mypage/Profile.jsx';
import BookingDetailPage from './pages/mypage/BookingDetail.jsx';

// 콘서트 페이지
import ConcertListPage from './pages/concert/ConcertListPage.jsx';
import ConcertDetailPage from './pages/concert/ConcertDetailPage.jsx';

// 예매 페이지
import WaitingPage from './pages/booking/WaitingPage.jsx';
import SeatSelectionPage from './pages/booking/SeatSelectionPage.jsx';

// 결제 페이지
import { PaymentRoutes } from './features/payment/RoutePayment.jsx';

// 판매자 페이지
import SellerHomePage from './pages/seller/SellerHomePage.jsx';
import SellerStatusPage from './pages/seller/SellerStatusPage.jsx';
import SellerApplyPage from './pages/seller/SellerApplyPage.jsx';
import ConcertRegisterPage from './pages/seller/ConcertRegisterPage.jsx';
import SellerConcertManagementPage from './pages/seller/SellerConcertManagementPage.jsx';

// 관리자 페이지
import AdminDashboard from './pages/admin/Dashboard';
import AdminSellerManagement from './pages/admin/AdminSellerManagement';
import SellerApproval from './pages/admin/SellerApproval.jsx';
import ApplicationHistoryPage from './pages/admin/ApplicationHistoryPage.jsx';

// 에러 페이지
import NotFoundPage from './pages/NotFoundPage.jsx';
import UnauthorizedAccessPage from './pages/UnauthorizedAccessPage';

// 로딩 컴포넌트 (콘서트 페이지와 통일된 스타일)
// ✅ App.jsx에서 LoadingComponent 수정
const LoadingComponent = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width <= 768);
            setIsTablet(width <= 1024 && width > 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{
            backgroundColor: '#111827',
            minHeight: '100vh',
            width: '100vw',
            margin: 0,
            padding: 0,
            overflowX: 'hidden',
        }}>
            <div
                className={isMobile
                    ? "p-4 overflow-x-hidden"
                    : isTablet
                        ? "max-w-4xl mx-auto p-4 overflow-x-hidden"
                        : "max-w-6xl mx-auto p-6 overflow-x-hidden"
                }
                style={{
                    backgroundColor: '#111827',
                    minHeight: '100vh',
                    color: '#FFFFFF',
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <div style={{
                    textAlign: 'center',
                    backgroundColor: '#1f2937',
                    padding: isMobile ? '24px' : '40px',
                    borderRadius: '12px',
                    border: '1px solid #374151',
                    maxWidth: isMobile ? '90%' : '400px',
                    width: '100%',
                }}>
                    <div className="loading-spinner mx-auto mb-4"></div>
                    <div className="loading-text">🎭 티켓몬을 초기화하는 중...</div>
                </div>
            </div>
        </div>
    );
};

// 임시 관리자 설정 페이지
const TempSettingsPage = () => (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="card max-w-md mx-auto text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h2 className="text-xl font-bold text-white mb-2">설정 페이지</h2>
            <p className="text-gray-400">관리자 설정 기능이 곧 추가될 예정입니다.</p>
        </div>
    </div>
);

// 권한 보호 컴포넌트
const ProtectedRoute = ({ children, condition, fallback }) => {
    return condition ? children : fallback;
};

// App 컴포넌트: 라우팅 정의 및 네비게이션 제공
export default function App() {
    const { user, loading } = useContext(AuthContext);

    // 로딩 중일 때 통일된 로딩 화면 표시
    if (loading) {
        return <LoadingComponent />;
    }

    // 역할 확인 헬퍼 변수
    const isAdmin =
        user &&
        (user.role === 'ROLE_ADMIN' ||
            (user.roles && user.roles.includes('ROLE_ADMIN')));
    const isSeller =
        user &&
        (user.role === 'ROLE_SELLER' ||
            (user.roles && user.roles.includes('ROLE_SELLER')));
    const isLoggedIn = !!user;

    return (
        <div className="min-h-screen bg-gray-900">
            <Routes>
                {/* ===== 인증 전용 라우트 ===== */}
                <Route element={<AuthLayout />}>
                    <Route
                        path="/login"
                        element={
                            <ProtectedRoute
                                condition={!user}
                                fallback={<Navigate to="/" replace />}
                            >
                                <LoginPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <ProtectedRoute
                                condition={!user}
                                fallback={<Navigate to="/" replace />}
                            >
                                <RegisterPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>

                {/* ===== 공개 페이지 라우트 ===== */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="concerts" element={<ConcertListPage />} />
                    <Route path="concerts/:concertId" element={<ConcertDetailPage />} />
                    {PaymentRoutes()}
                </Route>

                {/* ===== 로그인 후 보호된 페이지 ===== */}
                <Route element={<MainLayout />}>

                    {/* 예매 관련 페이지 */}
                    <Route
                        path="concerts/:concertId/wait"
                        element={
                            <ProtectedRoute
                                condition={isLoggedIn}
                                fallback={<Navigate to="/login" replace />}
                            >
                                <WaitingPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="concerts/:concertId/reserve"
                        element={
                            <ProtectedRoute
                                condition={isLoggedIn}
                                fallback={<Navigate to="/login" replace />}
                            >
                                <SeatSelectionPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* 마이페이지 */}
                    <Route
                        path="/mypage/profile"
                        element={
                            <ProtectedRoute
                                condition={isLoggedIn}
                                fallback={<Navigate to="/login" replace />}
                            >
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/bookingDetail/:bookingNumber"
                        element={
                            <ProtectedRoute
                                condition={isLoggedIn}
                                fallback={<Navigate to="/login" replace />}
                            >
                                <BookingDetailPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* ===== 판매자 페이지 그룹 ===== */}
                    <Route
                        path="/seller"
                        element={
                            <ProtectedRoute
                                condition={isLoggedIn && !isAdmin}
                                fallback={<Navigate to="/unauthorized" replace />}
                            >
                                <SellerLayout />
                            </ProtectedRoute>
                        }
                    >
                        {/* 판매자 대시보드 */}
                        <Route index element={<SellerHomePage />} />

                        {/* 모든 로그인 유저 접근 가능 */}
                        <Route path="apply" element={<SellerApplyPage />} />
                        <Route path="status" element={<SellerStatusPage />} />

                        {/* 판매자 권한 필요 */}
                        <Route
                            element={
                                <ProtectedRoute
                                    condition={isSeller}
                                    fallback={<Navigate to="/unauthorized" replace />}
                                >
                                    <Outlet />
                                </ProtectedRoute>
                            }
                        >
                            <Route path="concerts/register" element={<ConcertRegisterPage />} />
                            <Route path="concerts/manage" element={<SellerConcertManagementPage />} />
                        </Route>
                    </Route>

                    {/* ===== 관리자 페이지 그룹 ===== */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute
                                condition={isLoggedIn && isAdmin}
                                fallback={<Navigate to="/unauthorized" replace />}
                            >
                                <AdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<AdminDashboard />} />
                        <Route path="seller-approvals" element={<SellerApproval />} />
                        <Route path="sellers" element={<AdminSellerManagement />} />
                        <Route path="history" element={<ApplicationHistoryPage />} />
                        <Route path="settings" element={<TempSettingsPage />} />
                    </Route>
                </Route>

                {/* ===== 에러 페이지 ===== */}
                <Route path="/unauthorized" element={<UnauthorizedAccessPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </div>
    );
}