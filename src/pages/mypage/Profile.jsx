import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { User, Lock, Calendar } from 'lucide-react';

import { ProfileTab } from '../../features/user/components/ProfileTab';
import { PasswordTab } from '../../features/user/components/PasswordTab';
import { BookingsTab } from '../../features/user/components/BookingsTab';
import { userService } from '../../features/user/services/userService';

// 반응형 Hook 추가
const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200
    );

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setScreenWidth(width);
            setIsMobile(width <= 768);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return {
        isMobile,
        isTablet: screenWidth <= 1024 && screenWidth > 768,
        isDesktop: screenWidth > 1024,
        screenWidth
    };
};

export default function Profile() {
    const location = useLocation();
    const { isMobile, isTablet } = useResponsive();
    const [activeTab, setActiveTab] = useState('profile');
    const [userInfo, setUserInfo] = useState(null);
    const [bookingHistory, setBookingHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isBookingsLoading, setIsBookingsLoading] = useState(false);

    // 사용자 정보 로드
    useEffect(() => {
        const loadUserInfo = async () => {
            try {
                const data = await userService.getUserInfo();
                setUserInfo(data);
            } catch (error) {
                console.error('Failed to load user info:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserInfo();
    }, []);

    useEffect(() => {
        if (location.state?.from === 'bookingDetail') {
            setActiveTab('bookings');
        }
    }, [location.state]);

    // 예매 내역 로드 (예매 내역 탭 선택 시)
    useEffect(() => {
        if (
            activeTab === 'bookings' &&
            userInfo &&
            bookingHistory.length === 0
        ) {
            const loadBookingHistory = async () => {
                setIsBookingsLoading(true);
                try {
                    const data = await userService.getBookingHistory(
                        userInfo.id,
                    );
                    setBookingHistory(data);
                } catch (error) {
                    console.error('Failed to load booking history:', error);
                } finally {
                    setIsBookingsLoading(false);
                }
            };

            loadBookingHistory();
        }
    }, [activeTab, userInfo, bookingHistory.length]);

    // 사용자 정보 업데이트
    const handleUpdateUserInfo = async (updatedInfo) => {
        const result = await userService.updateUserInfo(updatedInfo);
        if (result.success) {
            setUserInfo(result.data);
        }
        return result;
    };

    // 비밀번호 변경
    const handleChangePassword = async (passwordData) => {
        return await userService.changePassword(passwordData);
    };

    const tabs = [
        {
            id: 'profile',
            label: '내 정보',
            icon: User,
            component: ProfileTab,
            props: {
                userInfo,
                onUpdateUserInfo: handleUpdateUserInfo,
                isLoading,
            },
        },
        {
            id: 'password',
            label: '비밀번호 변경',
            icon: Lock,
            component: PasswordTab,
            props: {
                userId: userInfo?.id,
                onChangePassword: handleChangePassword,
            },
        },
        {
            id: 'bookings',
            label: '예매 내역',
            icon: Calendar,
            component: BookingsTab,
            props: {
                bookingHistory,
                isLoading: isBookingsLoading,
            },
        },
    ];

    const getCurrentTabComponent = () => {
        const currentTab = tabs.find((tab) => tab.id === activeTab);
        if (!currentTab) return null;

        const Component = currentTab.component;
        return <Component {...currentTab.props} />;
    };

    return (
            <div
                style={{
                    backgroundColor: '#111827', // gray-900
                    minHeight: '100vh',
                    width: '100vw',
                    margin: 0,
                    padding: 0,
                    overflowX: 'hidden',
                }}
            >
                <div
                    className={isMobile
                        ? "p-4 overflow-x-hidden"
                        : isTablet
                            ? "max-w-5xl mx-auto p-4 overflow-x-hidden"
                            : "max-w-7xl mx-auto p-6 overflow-x-hidden"
                    }
                    style={{
                        backgroundColor: '#111827',
                        minHeight: '100vh',
                        color: '#FFFFFF',
                        boxSizing: 'border-box',
                    }}
                >
                    {/* Page Title */}
                    <div className="text-center mb-8">
                        <h2
                            className={isMobile
                                ? "text-2xl font-bold mb-2 break-words"
                                : isTablet
                                    ? "text-3xl font-bold mb-2 break-words"
                                    : "text-4xl font-bold mb-2 break-words"
                            }
                            style={{
                                color: '#FFFFFF',
                                wordBreak: 'keep-all',
                                overflowWrap: 'break-word',
                            }}
                        >
                            마이페이지
                        </h2>
                        <p
                            className="text-gray-400"
                            style={{
                                fontSize: isMobile ? '14px' : '16px',
                                padding: isMobile ? '0 16px' : '0',
                            }}
                        >
                            프로필과 계정 설정을 관리하세요
                        </p>
                    </div>

                    {/* Tab Navigation - 개선된 스타일 */}
                    <div className="flex flex-col sm:flex-row justify-center mb-8">
                        <div
                            className="rounded-xl p-1 flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-1"
                            style={{
                                backgroundColor: '#1f2937', // gray-800
                                border: '1px solid #374151', // gray-700
                            }}
                        >
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 rounded-lg transition-all duration-200 ${
                                            isMobile ? 'px-4 py-3' : 'px-6 py-3'
                                        }`}
                                        style={{
                                            backgroundColor: activeTab === tab.id
                                                ? '#374151' // gray-700 - 선택된 탭
                                                : 'transparent',
                                            color: activeTab === tab.id
                                                ? '#ffffff' // 선택된 탭 텍스트
                                                : '#9ca3af', // gray-400 - 비선택 탭
                                            border: activeTab === tab.id
                                                ? '1px solid #4b5563' // gray-600
                                                : '1px solid transparent',
                                            boxShadow: activeTab === tab.id
                                                ? '0 2px 4px rgba(0, 0, 0, 0.1)'
                                                : 'none',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (activeTab !== tab.id) {
                                                e.target.style.backgroundColor = '#2d3748'; // gray-750
                                                e.target.style.color = '#d1d5db'; // gray-300
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (activeTab !== tab.id) {
                                                e.target.style.backgroundColor = 'transparent';
                                                e.target.style.color = '#9ca3af'; // gray-400
                                            }
                                        }}
                                    >
                                        <Icon size={isMobile ? 16 : 18} />
                                        <span
                                            className="font-medium"
                                            style={{
                                                fontSize: isMobile ? '14px' : '16px',
                                            }}
                                        >
                                            {tab.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div
                        className="rounded-2xl"
                        style={{
                            backgroundColor: '#1f2937', // gray-800
                            border: '1px solid #374151', // gray-700
                            padding: isMobile ? '20px' : isTablet ? '24px' : '32px',
                        }}
                    >
                        {getCurrentTabComponent()}
                    </div>

                    {/* 모바일에서 하단 여백 */}
                    {isMobile && (
                        <div className="h-16" aria-hidden="true"></div>
                    )}
                </div>
            </div>
        );
    }