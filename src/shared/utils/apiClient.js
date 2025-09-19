import axios from 'axios';

// .env 파일에 VITE_APP_API_URL=https://api.ticketmongo.store/api 로 설정했으므로
// 더 이상 임시방편 코드는 필요 없습니다.
const API_BASE_URL = import.meta.env.VITE_APP_API_URL;

console.log('🔧 API Base URL:', API_BASE_URL); // 디버깅용

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        console.log(
            `🚀 API 요청: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
        );

        const { url = '' } = config;
        const securePatterns = [/^\/seats\/concerts\/(\d+)/];

        for (const pattern of securePatterns) {
            const match = url.match(pattern);
            if (match) {
                const concertId = match[1];
                const key = sessionStorage.getItem(`accessKey-${concertId}`);
                if (key) {
                    config.headers['X-Access-Key'] = key;
                } else {
                    console.warn(
                        `⚠️ 세션에 accessKey-${concertId}가 없습니다. URL: ${url}`,
                    );
                }
                break; // 매칭되면 루프 종료
            }
        }

        return config;
    },
    (error) => {
        console.error('❌ API 요청 에러:', error);
        return Promise.reject(error);
    },
);

apiClient.interceptors.response.use(
    (response) => {
        console.log(
            `✅ API 응답 성공: ${response.status} ${response.config.url}`,
        );

        if (
            response.data &&
            typeof response.data === 'object' &&
            'success' in response.data
        ) {
            if (response.data.success) {
                return response.data;
            } else {
                const errorMessage =
                    response.data.message || '알 수 없는 오류가 발생했습니다.';
                const error = new Error(errorMessage);
                error.response = response;
                return Promise.reject(error);
            }
        }
        return response;
    },
    (error) => {
        // 클라이언트 측 타임아웃 에러 처리 (Long Polling에서 정상적인 상황)
        if (
            error.code === 'ECONNABORTED' ||
            error.message.includes('timeout')
        ) {
            const url = error.config?.url || 'unknown';
            console.log(
                `⏰ API 타임아웃: ${url} - Long Polling에서 정상적인 상황일 수 있음`,
            );

            // 폴링 API의 타임아웃은 에러가 아님
            if (url.includes('/polling')) {
                console.log(
                    '🔥 폴링 API 타임아웃 - 정상적인 Long Polling 종료',
                );
                return Promise.reject(new Error('POLLING_TIMEOUT')); // 특별한 에러 타입
            }

            return Promise.reject(new Error('요청 시간이 초과되었습니다.'));
        }

        if (error.response) {
            const status = error.response.status;
            const url = error.response.config?.url || 'unknown';
            const originalRequest = error.config;

            // 구체적인 에러 메시지 생성
            let errorMessage = `API 호출 실패: ${status}`;

            if (error.response.data?.message) {
                errorMessage = error.response.data.message;
            } else {
                // 상태 코드별 기본 메시지
                switch (status) {
                    case 400:
                        errorMessage = '잘못된 요청입니다.';
                        break;
                    case 401:
                        errorMessage = '인증이 필요합니다. 로그인해주세요.';
                        break;
                    case 403:
                        errorMessage = '접근 권한이 없습니다.';
                        break;
                    case 404:
                        errorMessage = '요청한 리소스를 찾을 수 없습니다.';
                        break;
                    case 500:
                        errorMessage = '서버에 오류가 발생했습니다.';
                        break;
                    default:
                        errorMessage = `서버 오류 (${status})`;
                }
            }

            console.error(
                `❌ API Error - Status: ${status}, URL: ${url}, Message: ${errorMessage}`,
            );

            // 401 에러 시 자동 리다이렉트 (필요한 경우 주석 해제)
            if (status === 401) {
                // console.warn('🔒 인증 필요 - 로그인 페이지로 이동');
                // window.location.href = '/login';
            } else if (status === 403) {
                if (originalRequest.url.includes('/seats/concerts')) {
                    // [변경사항 시작] 폴링 API에 대한 403 에러 처리 개선
                    if (originalRequest.url.includes('/polling')) {
                        console.warn(
                            '⚠️ 폴링 API AccessKey 만료 또는 유효하지 않음. 재시도를 시도합니다.',
                        );
                        // 폴링 API의 경우, 얼럿, AccessKey 제거, 리다이렉션 없이 특정 에러를 반환하여 폴링 로직이 재시도하도록 유도
                        return Promise.reject(
                            new Error('POLLING_ACCESS_KEY_EXPIRED'),
                        );
                    } else {
                        // 기존의 /seats/concerts 관련 403 에러 처리 로직 (폴링이 아닌 일반 요청에 해당)
                        alert(
                            '예매 시간이 만료되었습니다. 콘서트 상세 페이지로 돌아갑니다.',
                        );
                        // 해당 콘서트의 accessKey를 세션 스토리지에서 삭제
                        const concertIdMatch =
                            originalRequest.url.match(/concerts\/(\d+)/);
                        if (concertIdMatch) {
                            sessionStorage.removeItem(
                                `accessKey-${concertIdMatch[1]}`,
                            );
                        }
                        // 상세 페이지로 리다이렉트
                        window.location.href = `/concerts/${
                            concertIdMatch ? concertIdMatch[1] : ''
                        }`;
                        return Promise.reject(error); // 여기서 에러 처리를 끝냄
                    }
                    // [변경사항 끝]
                }
            }

            return Promise.reject(new Error(errorMessage));
        } else if (error.request) {
            const networkError =
                '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.';
            console.error('❌ API Network Error:', error.request);
            return Promise.reject(new Error(networkError));
        } else {
            const requestError = 'API 요청 설정 중 오류가 발생했습니다.';
            console.error('❌ API Request Error:', error.message);
            return Promise.reject(new Error(requestError));
        }
    },
);

export default apiClient;
