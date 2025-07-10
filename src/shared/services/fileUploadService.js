// src/shared/services/fileUploadService.js

import apiClient from '../utils/apiClient.js';

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
];

// 업로드 진행 중인 요청들을 추적 (중복 방지용)
const activeUploads = new Map();

/**
 * 파일 업로드 관련 API 서비스
 * 백엔드의 FileUploadController와 연동
 */
export const fileUploadService = {
    /**
     * 포스터 이미지를 Supabase에 업로드
     * 백엔드: POST /api/upload/poster
     *
     * @param {File} file - 업로드할 이미지 파일
     * @param {number|null} concertId - 콘서트 ID (선택사항, 임시 업로드 시 null)
     * @param {Function} onProgress - 업로드 진행률 콜백 함수 (선택사항)
     * @returns {Promise<{success: boolean, message: string, data: string}>} 업로드된 파일의 public URL
     */
    async uploadPosterImage(file, concertId = null, onProgress = null) {
        // 파일 고유 키 생성 (중복 업로드 방지용)
        const fileKey = `${file.name}_${file.size}_${file.lastModified}`;

        // 이미 같은 파일이 업로드 중인지 확인
        if (activeUploads.has(fileKey)) {
            throw new Error(
                '같은 파일이 이미 업로드 진행 중입니다. 잠시 후 다시 시도해주세요.',
            );
        }

        try {
            // 업로드 시작 표시
            activeUploads.set(fileKey, true);

            // 파일 유효성 검사
            if (!file) {
                throw new Error('업로드할 파일이 선택되지 않았습니다.');
            }

            // 파일 크기 검사 (10MB 제한)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                throw new Error('파일 크기는 10MB를 초과할 수 없습니다.');
            }

            // 파일 타입 검사 (이미지만 허용)
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                throw new Error(
                    '지원하지 않는 파일 형식입니다. (JPEG, PNG, WebP, GIF만 가능)',
                );
            }

            // FormData 생성
            const formData = new FormData();
            formData.append('file', file);

            // concertId가 있으면 추가 (기존 콘서트 수정 시)
            if (concertId) {
                formData.append('concertId', concertId.toString());
            }

            // 중복 방지용 타임스탬프 추가
            formData.append('timestamp', Date.now().toString());

            // API 호출 설정
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                // 타임아웃 설정 (60초)
                timeout: 60000,
                // 업로드 진행률 추적 (선택사항)
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total,
                        );
                        onProgress(percentCompleted);
                    }
                },
            };

            console.log('파일 업로드 시작:', {
                fileName: file.name,
                fileSize: this.formatFileSize(file.size),
                fileType: file.type,
                concertId: concertId,
            });

            // 백엔드 API 호출
            const response = await apiClient.post(
                '/upload/poster',
                formData,
                config,
            );

            // 성공 응답 처리
            if (response && response.success && response.data) {
                console.log('파일 업로드 성공:', response.data);
                return {
                    success: true,
                    message:
                        response.message || '파일 업로드가 완료되었습니다.',
                    data: response.data, // Supabase public URL
                };
            } else {
                throw new Error(
                    response?.message || '파일 업로드에 실패했습니다.',
                );
            }
        } catch (error) {
            console.error('파일 업로드 에러:', error);

            // 에러 타입별 처리
            if (error.response) {
                // 백엔드에서 반환한 에러 (4xx, 5xx)
                const { status, data } = error.response;
                let errorMessage =
                    data?.message ||
                    data?.error ||
                    '서버에서 파일 업로드를 처리하지 못했습니다.';

                // HTTP 상태 코드별 세부 처리
                switch (status) {
                    case 400:
                        if (errorMessage.includes('중복')) {
                            errorMessage =
                                '같은 이름의 파일이 이미 존재합니다. 파일명을 변경해주세요.';
                        } else if (errorMessage.includes('크기')) {
                            errorMessage =
                                '파일 크기가 너무 큽니다. 10MB 이하의 파일을 선택해주세요.';
                        }
                        break;
                    case 409:
                        errorMessage =
                            '파일 업로드 충돌이 발생했습니다. 잠시 후 다시 시도해주세요.';
                        break;
                    case 413:
                        errorMessage = '파일 크기가 서버 제한을 초과했습니다.';
                        break;
                    case 500:
                        errorMessage =
                            '서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
                        break;
                    case 503:
                        errorMessage =
                            '서버가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.';
                        break;
                }

                console.error('파일 업로드 서버 에러:', status, errorMessage);
                throw new Error(errorMessage);
            } else if (error.request) {
                // 네트워크 에러 (요청은 보냈지만 응답을 받지 못함)
                console.error('파일 업로드 네트워크 에러:', error.request);
                throw new Error('네트워크 연결을 확인해주세요.');
            } else if (error.code === 'ECONNABORTED') {
                // 타임아웃 에러
                throw new Error(
                    '업로드 시간이 초과되었습니다. 파일 크기를 확인하고 다시 시도해주세요.',
                );
            } else {
                // 클라이언트 측 에러 (파일 검증 실패 등)
                console.error('파일 업로드 클라이언트 에러:', error.message);
                throw new Error(error.message);
            }
        } finally {
            // 업로드 완료 후 추적에서 제거
            activeUploads.delete(fileKey);
        }
    },

    /**
     * 특정 파일 URL로 직접 삭제 (고유 파일명 방식용)
     * @param {string} fileUrl - 삭제할 파일의 전체 URL
     * @param {number|null} concertId - 콘서트 ID (null이면 임시 파일)
     * @param {number} sellerId - 판매자 ID
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async deleteSpecificFile(fileUrl, concertId, sellerId) {
        if (!fileUrl) {
            return { success: false, message: '삭제할 파일 URL이 없습니다.' };
        }

        try {
            console.log('🗑️ 특정 파일 삭제 시작:', {
                fileUrl,
                concertId,
                sellerId,
            });

            // URL에서 파일 경로 추출
            const urlObj = new URL(fileUrl);
            const pathParts = urlObj.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];

            if (concertId) {
                // 콘서트 관련 파일 삭제
                const response = await apiClient.delete(
                    `/upload/poster/specific`,
                    {
                        params: {
                            fileUrl: fileUrl,
                            concertId: concertId,
                            sellerId: sellerId,
                        },
                    },
                );

                if (response && response.success) {
                    console.log('✅ 콘서트 파일 삭제 완료:', fileName);
                    return {
                        success: true,
                        message: response.message || '파일이 삭제되었습니다.',
                    };
                } else {
                    throw new Error(response?.message || '파일 삭제 실패');
                }
            } else {
                // 임시 파일 삭제
                const response = await apiClient.delete(`/upload/temp`, {
                    params: {
                        fileUrl: fileUrl,
                        sellerId: sellerId,
                    },
                });

                if (response && response.success) {
                    console.log('✅ 임시 파일 삭제 완료:', fileName);
                    return {
                        success: true,
                        message:
                            response.message || '임시 파일이 삭제되었습니다.',
                    };
                } else {
                    throw new Error(response?.message || '임시 파일 삭제 실패');
                }
            }
        } catch (error) {
            console.error('❌ 특정 파일 삭제 실패:', error);

            if (error.response) {
                const { status, data } = error.response;
                let errorMessage =
                    data?.message ||
                    '서버에서 파일 삭제를 처리하지 못했습니다.';

                switch (status) {
                    case 403:
                        errorMessage = '해당 파일을 삭제할 권한이 없습니다.';
                        break;
                    case 404:
                        errorMessage = '삭제할 파일을 찾을 수 없습니다.';
                        break;
                    case 500:
                        errorMessage = '서버 오류로 파일 삭제에 실패했습니다.';
                        break;
                }

                return { success: false, message: errorMessage };
            }

            return {
                success: false,
                message: error.message || '파일 삭제 중 오류가 발생했습니다.',
            };
        }
    },

    /**
     * 원본 포스터 URL로 복구 (고유 파일명 방식용)
     * @param {number} concertId - 콘서트 ID
     * @param {number} sellerId - 판매자 ID
     * @param {string} originalUrl - 복구할 원본 URL
     * @returns {Promise<{success: boolean, message: string}>}
     */
    async restoreOriginalPoster(concertId, sellerId, originalUrl) {
        if (!concertId || !sellerId || !originalUrl) {
            return {
                success: false,
                message: '필수 파라미터가 누락되었습니다.',
            };
        }

        try {
            console.log('🔄 원본 포스터 복구 시작:', {
                concertId,
                sellerId,
                originalUrl,
            });

            const response = await apiClient.patch(
                `/upload/poster/${concertId}/restore`,
                {
                    originalUrl: originalUrl,
                },
                {
                    params: { sellerId },
                },
            );

            if (response && response.success) {
                console.log('✅ 원본 포스터 복구 완료');
                return {
                    success: true,
                    message:
                        response.message || '원본 포스터로 복구되었습니다.',
                };
            } else {
                throw new Error(response?.message || '원본 복구 실패');
            }
        } catch (error) {
            console.error('❌ 원본 포스터 복구 실패:', error);

            if (error.response) {
                const { status, data } = error.response;
                let errorMessage =
                    data?.message ||
                    '서버에서 원본 복구를 처리하지 못했습니다.';

                switch (status) {
                    case 403:
                        errorMessage = '해당 콘서트를 수정할 권한이 없습니다.';
                        break;
                    case 404:
                        errorMessage = '콘서트를 찾을 수 없습니다.';
                        break;
                    case 500:
                        errorMessage = '서버 오류로 원본 복구에 실패했습니다.';
                        break;
                }

                return { success: false, message: errorMessage };
            }

            return {
                success: false,
                message: error.message || '원본 복구 중 오류가 발생했습니다.',
            };
        }
    },

    /**
     * 파일 업로드 전 클라이언트 측 유효성 검사
     * 실제 업로드 전에 미리 검증하여 UX 개선
     *
     * @param {File} file - 검사할 파일
     * @returns {{valid: boolean, error?: string}} 검증 결과
     */
    validateFile(file) {
        try {
            // 파일 존재 여부
            if (!file) {
                return { valid: false, error: '파일이 선택되지 않았습니다.' };
            }

            // 파일 크기 검사 (10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
                return {
                    valid: false,
                    error: `파일 크기가 너무 큽니다. (${sizeMB}MB / 최대 10MB)`,
                };
            }

            // 빈 파일 검사
            if (file.size === 0) {
                return {
                    valid: false,
                    error: '빈 파일은 업로드할 수 없습니다.',
                };
            }

            // 파일 타입 검사
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                return {
                    valid: false,
                    error: `지원하지 않는 파일 형식입니다. (${file.type})\n허용 형식: JPEG, PNG, WebP, GIF`,
                };
            }

            // 파일명 검사 (선택사항)
            if (file.name.length > 255) {
                return {
                    valid: false,
                    error: '파일명이 너무 깁니다. (최대 255자)',
                };
            }

            // 파일명에 특수문자 검사
            const invalidChars = /[<>:"/\\|?*]/;
            if (invalidChars.test(file.name)) {
                return {
                    valid: false,
                    error: '파일명에 특수문자가 포함되어 있습니다. (< > : " / \\ | ? * 제외)',
                };
            }

            return { valid: true };
        } catch (error) {
            return {
                valid: false,
                error: '파일 검증 중 오류가 발생했습니다.',
            };
        }
    },

    /**
     * 이미지 URL 유효성 검사 (외부 URL용)
     *
     * @param {string} url - 검사할 URL
     * @returns {{valid: boolean, error?: string}} 검증 결과
     */
    validateImageUrl(url) {
        if (!url || url.trim() === '') {
            return { valid: false, error: 'URL이 비어있습니다.' };
        }

        try {
            const urlObj = new URL(url.trim());

            // 프로토콜 검사
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                return {
                    valid: false,
                    error: 'HTTP 또는 HTTPS URL만 허용됩니다.',
                };
            }

            // 이미지 확장자 검사 (선택사항, URL에 확장자가 없을 수도 있음)
            const pathname = urlObj.pathname.toLowerCase();
            const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const hasValidExtension = validExtensions.some((ext) =>
                pathname.endsWith(ext),
            );

            // 확장자가 없거나 의심스러운 경우 경고만 하고 통과
            if (
                !hasValidExtension &&
                pathname !== '' &&
                !pathname.endsWith('/')
            ) {
                console.warn(
                    '이미지 파일 확장자가 감지되지 않았습니다:',
                    pathname,
                );
            }

            return { valid: true };
        } catch (error) {
            return { valid: false, error: '올바른 URL 형식이 아닙니다.' };
        }
    },

    /**
     * 이미지 로드 가능 여부 테스트 (외부 URL용)
     * CORS 문제나 네트워크 문제 사전 감지
     *
     * @param {string} url - 테스트할 이미지 URL
     * @param {number} timeout - 타임아웃 시간 (밀리초, 기본 5초)
     * @returns {Promise<{loadable: boolean, error?: string}>}
     */
    async testImageLoad(url, timeout = 5000) {
        return new Promise((resolve) => {
            const img = new Image();
            const timeoutId = setTimeout(() => {
                resolve({
                    loadable: false,
                    error: '이미지 로드 시간이 초과되었습니다.',
                });
            }, timeout);

            img.onload = () => {
                clearTimeout(timeoutId);
                resolve({ loadable: true });
            };

            img.onerror = () => {
                clearTimeout(timeoutId);
                resolve({
                    loadable: false,
                    error: '이미지를 불러올 수 없습니다. URL을 확인해주세요.',
                });
            };

            // CORS 문제 방지 (anonymous 모드로 로드 시도)
            img.crossOrigin = 'anonymous';
            img.src = url;
        });
    },

    /**
     * 파일 크기를 사람이 읽기 쉬운 형태로 변환
     *
     * @param {number} bytes - 바이트 단위 파일 크기
     * @returns {string} 변환된 크기 문자열 (예: "2.5 MB")
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    },

    /**
     * 파일 확장자 추출
     *
     * @param {string} filename - 파일명
     * @returns {string} 확장자 (소문자, 점 제외)
     */
    getFileExtension(filename) {
        if (!filename || !filename.includes('.')) {
            return '';
        }
        return filename.split('.').pop().toLowerCase();
    },

    /**
     * 이미지 파일인지 확인
     *
     * @param {File} file - 확인할 파일
     * @returns {boolean} 이미지 파일 여부
     */
    isImageFile(file) {
        return ALLOWED_IMAGE_TYPES.includes(file.type);
    },

    /**
     * 파일을 Base64 데이터 URL로 변환 (미리보기용)
     *
     * @param {File} file - 변환할 파일
     * @returns {Promise<string>} Base64 데이터 URL
     */
    fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('파일이 제공되지 않았습니다.'));
                return;
            }

            const reader = new FileReader();

            reader.onload = (event) => {
                resolve(event.target.result);
            };

            reader.onerror = (error) => {
                console.error('FileReader 에러:', error);
                reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
            };

            reader.readAsDataURL(file);
        });
    },

    /**
     * 현재 업로드 진행 중인 파일 개수 반환
     *
     * @returns {number} 업로드 진행 중인 파일 수
     */
    getActiveUploadCount() {
        return activeUploads.size;
    },

    /**
     * 모든 진행 중인 업로드 취소 (강제 정리)
     * 컴포넌트 언마운트 시 사용
     */
    clearActiveUploads() {
        activeUploads.clear();
    },
};
