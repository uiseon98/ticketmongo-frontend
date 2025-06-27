import apiClient from '../../../shared/utils/apiClient'; // 공통 apiClient 임포트

export const userService = {
    getUserInfo: async () => {
        const response = await apiClient.get('/mypage/profile');
        if (response.data) {
            return response.data;
        }
    },

    updateUserInfo: async (userInfo) => {
        try {
            const response = await apiClient.post('/mypage/profile', userInfo, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.message || '회원 정보 수정 중 오류가 발생했습니다.' };
        }
    },

    changePassword: async (passwordData) => {
        // 실제로는 fetch('/api/user/password', { method: 'PUT', body: JSON.stringify(passwordData) })
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: '비밀번호가 변경되었습니다.' });
            }, 500);
        });
    },

    getBookingHistory: async (userId) => {
        // 실제로는 fetch(`/api/user/${userId}/bookings`)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        eventName: 'BTS Concert 2025',
                        date: '2025-07-15',
                        venue: 'Olympic Stadium',
                        seats: 'VIP-A12, A13',
                        status: 'confirmed',
                        price: '₩180,000',
                    },
                    {
                        id: 2,
                        eventName: 'Hamilton Musical',
                        date: '2025-06-20',
                        venue: 'Seoul Arts Center',
                        seats: 'R석 3열 15-16번',
                        status: 'completed',
                        price: '₩150,000',
                    },
                    {
                        id: 3,
                        eventName: 'Ed Sheeran Live',
                        date: '2025-08-10',
                        venue: 'KSPO Dome',
                        seats: 'Standing A',
                        status: 'confirmed',
                        price: '₩120,000',
                    },
                ]);
            }, 800);
        });
    },
};
