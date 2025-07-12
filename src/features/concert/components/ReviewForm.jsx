// src/features/concert/components/ReviewForm.jsx (Responsive Version)

// ===== IMPORT 섹션 =====
import React, { useState, useCallback, useEffect } from 'react';
// useState: 폼 상태 관리
// useCallback: 이벤트 핸들러 최적화
// useEffect: 초기값 설정 및 수정 모드 처리

// 리뷰 관련 타입과 상수들을 import
import {
    RatingLabels,
    RatingEmojis,
    ReviewValidation,
} from '../types/review.js';

/**
 * ===== Responsive ReviewForm 컴포넌트 =====
 *
 * 🎯 주요 역할:
 * 1. **리뷰 작성**: 새로운 콘서트 후기 작성 폼
 * 2. **리뷰 수정**: 기존 리뷰 내용 수정 폼
 * 3. **유효성 검증**: 실시간 입력 검증 및 에러 표시
 * 4. **별점 입력**: 인터랙티브한 별점 선택 UI
 * 5. **글자 수 카운터**: 제목/내용 글자 수 실시간 표시
 * 6. **완전 반응형**: 모바일, 태블릿, 데스크톱 최적화
 *
 * 🔄 Hook 연동:
 * - useReviews.createReview (새 리뷰 작성)
 * - useReviews.updateReview (기존 리뷰 수정)
 * - useReviews.actionLoading (작업 중 상태)
 *
 * 📱 반응형 특징:
 * - 모바일 우선 설계
 * - 터치 친화적 별점 인터페이스
 * - 적응형 레이아웃
 * - 스크린 크기별 최적화
 * - 키보드 호환성
 */
const ReviewForm = ({
    // ===== 모드 props =====
    mode = 'create', // 'create' | 'edit' - 작성/수정 모드
    initialData = null, // 수정 모드일 때 기존 리뷰 데이터

    // ===== 필수 데이터 props =====
    concertId, // 콘서트 ID (필수)
    userId, // 작성자 사용자 ID (필수)
    userNickname, // 작성자 닉네임 (필수)

    // ===== 액션 props =====
    onSubmit, // 폼 제출 핸들러 (useReviews.createReview or updateReview)
    onCancel, // 취소 버튼 핸들러 (선택사항)

    // ===== 상태 props =====
    loading = false, // 제출 중 로딩 상태 (useReviews.actionLoading)
    disabled = false, // 폼 비활성화

    // ===== UI 제어 props =====
    showCancelButton = true, // 취소 버튼 표시 여부

    // ===== 스타일 props =====
    className = '', // 추가 CSS 클래스
    compact = false, // 컴팩트 모드
}) => {
    // ===== 상태 관리 =====
    const [isMobile, setIsMobile] = useState(false);

    // 화면 크기 감지
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    /**
     * 폼 데이터 상태 (ReviewFormData 형식)
     */
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        rating: initialData?.rating || 5,
        userNickname: initialData?.userNickname || userNickname || '',
        userId: initialData?.userId || userId || null,
    });

    /**
     * 유효성 검증 에러 상태
     */
    const [errors, setErrors] = useState({
        title: '',
        description: '',
        rating: '',
        userNickname: '',
        userId: '',
    });

    /**
     * 폼 터치 상태 (사용자가 입력한 필드 추적)
     */
    const [touched, setTouched] = useState({
        title: false,
        description: false,
        rating: false,
        userNickname: false,
    });

    /**
     * 별점 호버 상태 (마우스 오버된 별점)
     */
    const [hoveredRating, setHoveredRating] = useState(0);

    // ===== 유효성 검증 함수들 =====

    /**
     * 개별 필드 유효성 검증
     */
    const validateField = useCallback((fieldName, value) => {
        const validation = ReviewValidation[fieldName];
        if (!validation) return '';

        // 필수 필드 검증
        if (
            validation.required &&
            (!value || value.toString().trim().length === 0)
        ) {
            return `${getFieldDisplayName(fieldName)}은(는) 필수입니다.`;
        }

        // 길이 검증
        if (
            value &&
            validation.maxLength &&
            value.length > validation.maxLength
        ) {
            return `${getFieldDisplayName(fieldName)}은(는) ${validation.maxLength}자 이하여야 합니다.`;
        }

        if (
            value &&
            validation.minLength &&
            value.length < validation.minLength
        ) {
            return `${getFieldDisplayName(fieldName)}은(는) ${validation.minLength}자 이상이어야 합니다.`;
        }

        // 숫자 범위 검증 (평점)
        if (fieldName === 'rating') {
            const numValue = Number(value);
            if (validation.min && numValue < validation.min) {
                return `평점은 ${validation.min}점 이상이어야 합니다.`;
            }
            if (validation.max && numValue > validation.max) {
                return `평점은 ${validation.max}점 이하여야 합니다.`;
            }
        }

        return '';
    }, []);

    /**
     * 전체 폼 유효성 검증
     */
    const validateForm = useCallback(() => {
        const newErrors = {};
        let isValid = true;

        // 모든 필드에 대해 검증 수행
        Object.keys(formData).forEach((fieldName) => {
            const error = validateField(fieldName, formData[fieldName]);
            newErrors[fieldName] = error;
            if (error) isValid = false;
        });

        setErrors(newErrors);
        return isValid;
    }, [formData, validateField]);

    /**
     * 필드 표시명 반환
     */
    const getFieldDisplayName = useCallback((fieldName) => {
        const displayNames = {
            title: '리뷰 제목',
            description: '리뷰 내용',
            rating: '평점',
            userNickname: '닉네임',
            userId: '사용자 ID',
        };
        return displayNames[fieldName] || fieldName;
    }, []);

    // ===== 이벤트 핸들러들 =====

    /**
     * 텍스트 입력 필드 변경 핸들러
     */
    const handleInputChange = useCallback(
        (fieldName) => {
            return (event) => {
                const value = event.target.value;

                // 폼 데이터 업데이트
                setFormData((prev) => ({
                    ...prev,
                    [fieldName]: value,
                }));

                // 터치 상태 업데이트
                setTouched((prev) => ({
                    ...prev,
                    [fieldName]: true,
                }));

                // 실시간 유효성 검증 (터치된 필드만)
                if (touched[fieldName]) {
                    const error = validateField(fieldName, value);
                    setErrors((prev) => ({
                        ...prev,
                        [fieldName]: error,
                    }));
                }
            };
        },
        [touched, validateField],
    );

    /**
     * 별점 클릭 핸들러
     */
    const handleRatingClick = useCallback(
        (rating) => {
            setFormData((prev) => ({
                ...prev,
                rating,
            }));

            setTouched((prev) => ({
                ...prev,
                rating: true,
            }));

            // 별점 유효성 검증
            const error = validateField('rating', rating);
            setErrors((prev) => ({
                ...prev,
                rating: error,
            }));
        },
        [validateField],
    );

    /**
     * 별점 호버 핸들러 (데스크톱용)
     */
    const handleRatingHover = useCallback((rating) => {
        if (!isMobile) {
            setHoveredRating(rating);
        }
    }, [isMobile]);

    /**
     * 별점 호버 해제 핸들러 (데스크톱용)
     */
    const handleRatingLeave = useCallback(() => {
        if (!isMobile) {
            setHoveredRating(0);
        }
    }, [isMobile]);

    /**
     * 폼 제출 핸들러
     */
    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();

            // 모든 필드를 터치 상태로 설정 (에러 표시용)
            setTouched({
                title: true,
                description: true,
                rating: true,
                userNickname: true,
            });

            // 전체 폼 유효성 검증
            if (!validateForm()) {
                return;
            }

            // 비활성화 상태이거나 로딩 중이면 제출하지 않음
            if (disabled || loading) {
                return;
            }

            try {
                // 부모 컴포넌트의 제출 함수 호출
                if (onSubmit && typeof onSubmit === 'function') {
                    if (mode === 'edit' && initialData?.id) {
                        await onSubmit(formData);
                    } else {
                        // 작성 모드: 폼 데이터만 전달
                        await onSubmit(formData);
                    }
                }
            } catch (error) {
                // 에러는 상위 컴포넌트에서 처리
                console.error('리뷰 제출 실패:', error);
            }
        },
        [
            formData,
            disabled,
            loading,
            validateForm,
            onSubmit,
            mode,
            initialData,
        ],
    );

    /**
     * 취소 버튼 핸들러
     */
    const handleCancel = useCallback(() => {
        if (onCancel && typeof onCancel === 'function') {
            onCancel();
        }
    }, [onCancel]);

    // ===== 부수 효과 =====

    /**
     * 초기 데이터 변경 시 폼 상태 동기화
     */
    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                rating: initialData.rating || 5,
                userNickname: initialData.userNickname || userNickname || '',
                userId: initialData.userId || userId || null,
            });
        }
    }, [initialData, userNickname, userId]);

    /**
     * 외부 props 변경 시 폼 데이터 업데이트
     */
    useEffect(() => {
        if (!initialData) {
            setFormData((prev) => ({
                ...prev,
                userNickname: userNickname || prev.userNickname,
                userId: userId || prev.userId,
            }));
        }
    }, [userNickname, userId, initialData]);

    // ===== 유틸리티 함수들 =====

    /**
     * 글자 수 표시 함수
     */
    const getCharacterCount = useCallback((text, maxLength) => {
        const currentLength = text ? text.length : 0;
        return `${currentLength}/${maxLength}`;
    }, []);

    /**
     * 글자 수 색상 결정 함수
     */
    const getCharacterCountColor = useCallback((text, maxLength) => {
        const currentLength = text ? text.length : 0;
        const percentage = currentLength / maxLength;

        if (percentage >= 1) return '#dc2626'; // 빨간색 (초과)
        if (percentage >= 0.9) return '#f59e0b'; // 주황색 (90% 이상)
        if (percentage >= 0.7) return '#10b981'; // 초록색 (70% 이상)
        return '#9ca3af'; // 회색 (일반)
    }, []);

    /**
     * 별점 표시용 별 렌더링 (반응형)
     */
    const renderStars = useCallback(() => {
        const stars = [];
        const displayRating = hoveredRating || formData.rating;
        const starSize = isMobile ? '28px' : (compact ? '24px' : '32px');
        const starPadding = isMobile ? '8px' : '4px';

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <button
                    key={i}
                    type="button"
                    onClick={() => handleRatingClick(i)}
                    onMouseEnter={() => handleRatingHover(i)}
                    onMouseLeave={handleRatingLeave}
                    style={{
                        background: 'none',
                        border: 'none',
                        fontSize: starSize,
                        color: i <= displayRating ? '#fbbf24' : '#4b5563',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        transition: 'color 0.2s ease',
                        padding: starPadding,
                        minHeight: isMobile ? '44px' : 'auto', // 터치 친화적
                        minWidth: isMobile ? '44px' : 'auto',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    disabled={disabled}
                    aria-label={`${i}점`}
                >
                    ★
                </button>,
            );
        }

        return stars;
    }, [
        hoveredRating,
        formData.rating,
        compact,
        disabled,
        isMobile,
        handleRatingClick,
        handleRatingHover,
        handleRatingLeave,
    ]);

    // ===== 반응형 스타일 정의 =====

    /**
     * 컨테이너 스타일 (반응형)
     */
    const containerStyles = {
        backgroundColor: '#1E293B',
        borderRadius: '8px',
        border: '1px solid #4b5563',
        padding: isMobile ? '16px' : (compact ? '16px' : '24px'),
        maxWidth: isMobile ? '100%' : '600px',
        margin: '0 auto',
        color: '#FFFFFF',
        width: '100%',
        boxSizing: 'border-box',
    };

    /**
     * 제목 스타일 (반응형)
     */
    const titleStyles = {
        fontSize: isMobile ? '18px' : (compact ? '18px' : '20px'),
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: isMobile ? '16px' : (compact ? '16px' : '20px'),
        textAlign: 'center',
        lineHeight: '1.4',
    };

    /**
     * 폼 그룹 스타일 (반응형)
     */
    const formGroupStyles = {
        marginBottom: isMobile ? '20px' : (compact ? '16px' : '20px'),
    };

    /**
     * 라벨 스타일 (반응형)
     */
    const labelStyles = {
        display: 'block',
        fontSize: isMobile ? '16px' : (compact ? '14px' : '16px'),
        fontWeight: '600',
        color: '#D1D5DB',
        marginBottom: '8px',
    };

    /**
     * 입력 필드 기본 스타일 (반응형)
     */
    const inputBaseStyles = {
        width: '100%',
        padding: isMobile ? '12px 16px' : (compact ? '8px 12px' : '12px 16px'),
        border: '2px solid #4B5563',
        borderRadius: '6px',
        fontSize: isMobile ? '16px' : (compact ? '14px' : '16px'), // iOS 줌 방지
        backgroundColor: disabled ? '#374151' : '#374151',
        color: disabled ? '#9CA3AF' : '#FFFFFF',
        transition: 'border-color 0.2s ease',
        minHeight: isMobile ? '44px' : 'auto', // 터치 친화적
        boxSizing: 'border-box',
    };

    /**
     * 에러 상태 입력 필드 스타일
     */
    const getInputStyles = (fieldName) => {
        const hasError = touched[fieldName] && errors[fieldName];
        return {
            ...inputBaseStyles,
            borderColor: hasError ? '#ef4444' : '#4b5563',
        };
    };

    /**
     * 텍스트영역 스타일 (반응형)
     */
    const textareaStyles = {
        ...getInputStyles('description'),
        minHeight: isMobile ? '120px' : (compact ? '80px' : '120px'),
        resize: 'vertical',
        fontFamily: 'inherit',
    };

    /**
     * 에러 메시지 스타일 (반응형)
     */
    const errorStyles = {
        fontSize: isMobile ? '14px' : '12px',
        color: '#ef4444',
        marginTop: '6px',
        lineHeight: '1.4',
    };

    /**
     * 글자 수 카운터 스타일 (반응형)
     */
    const getCounterStyles = (fieldName, maxLength) => ({
        fontSize: isMobile ? '14px' : '12px',
        color: getCharacterCountColor(formData[fieldName], maxLength),
        textAlign: 'right',
        marginTop: '6px',
    });

    /**
     * 별점 섹션 스타일 (반응형)
     */
    const ratingContainerStyles = {
        textAlign: 'center',
        padding: isMobile ? '16px' : (compact ? '12px' : '16px'),
        backgroundColor: '#374151',
        borderRadius: '6px',
        border: '1px solid #4B5563',
    };

    /**
     * 별점 라벨 스타일 (반응형)
     */
    const ratingLabelStyles = {
        fontSize: isMobile ? '16px' : (compact ? '14px' : '16px'),
        color: '#3b82f6',
        marginTop: '8px',
        fontWeight: '600',
        lineHeight: '1.4',
    };

    /**
     * 버튼 기본 스타일 (반응형)
     */
    const buttonBaseStyles = {
        padding: isMobile ? '12px 20px' : (compact ? '8px 16px' : '12px 24px'),
        borderRadius: '6px',
        fontSize: isMobile ? '16px' : (compact ? '14px' : '16px'),
        fontWeight: '600',
        border: 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.6 : 1,
        minHeight: isMobile ? '48px' : 'auto', // 터치 친화적
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
    };

    /**
     * 제출 버튼 스타일 (반응형)
     */
    const submitButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: loading ? '#9ca3af' : '#3b82f6',
        color: '#ffffff',
        flex: isMobile ? 1 : 'none',
        marginRight: isMobile ? '8px' : '12px',
    };

    /**
     * 취소 버튼 스타일 (반응형)
     */
    const cancelButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: 'transparent',
        color: '#9ca3af',
        border: '1px solid #6b7280',
        flex: isMobile ? 1 : 'none',
    };

    /**
     * 버튼 컨테이너 스타일 (반응형)
     */
    const buttonContainerStyles = {
        display: 'flex',
        flexDirection: isMobile ? 'row' : 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: isMobile ? '24px' : (compact ? '20px' : '24px'),
        gap: isMobile ? '0' : '0',
    };

    // ===== JSX 렌더링 =====

    return (
        <div className={`review-form ${className}`} style={containerStyles}>
            {/* 폼 제목 - 반응형 */}
            <h2 style={titleStyles}>
                {mode === 'edit' ? <>✨ 관람평 수정</> : <>✍️ 관람평 작성</>}
                <span
                    style={{
                        fontSize: isMobile ? '12px' : '11px',
                        backgroundColor: '#eff6ff',
                        color: '#1e40af',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: 'normal',
                        marginLeft: '8px',
                        display: isMobile ? 'block' : 'inline',
                        marginTop: isMobile ? '4px' : '0',
                    }}
                >
                    관람 후
                </span>
            </h2>

            <form onSubmit={handleSubmit}>
                {/* 제목 입력 - 반응형 */}
                <div style={formGroupStyles}>
                    <label htmlFor="review-title" style={labelStyles}>
                        리뷰 제목 *
                    </label>
                    <input
                        id="review-title"
                        type="text"
                        value={formData.title}
                        onChange={handleInputChange('title')}
                        disabled={disabled}
                        placeholder="리뷰 제목을 입력해주세요"
                        style={getInputStyles('title')}
                        maxLength={ReviewValidation.title.maxLength}
                    />
                    {touched.title && errors.title && (
                        <div style={errorStyles}>{errors.title}</div>
                    )}
                    <div
                        style={getCounterStyles(
                            'title',
                            ReviewValidation.title.maxLength,
                        )}
                    >
                        {getCharacterCount(
                            formData.title,
                            ReviewValidation.title.maxLength,
                        )}
                    </div>
                </div>

                {/* 별점 입력 - 반응형 */}
                <div style={formGroupStyles}>
                    <label style={labelStyles}>평점 *</label>
                    <div style={ratingContainerStyles}>
                        <div style={{
                            marginBottom: '12px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexWrap: isMobile ? 'nowrap' : 'nowrap',
                            gap: isMobile ? '4px' : '0',
                        }}>
                            {renderStars()}
                        </div>
                        <div style={ratingLabelStyles}>
                            <span style={{ fontSize: isMobile ? '20px' : '18px' }}>
                                {RatingEmojis[hoveredRating || formData.rating]}
                            </span>
                            {' '}
                            {RatingLabels[hoveredRating || formData.rating]} (
                            {hoveredRating || formData.rating}/5)
                        </div>
                    </div>
                    {touched.rating && errors.rating && (
                        <div style={errorStyles}>{errors.rating}</div>
                    )}
                </div>

                {/* 내용 입력 - 반응형 */}
                <div style={formGroupStyles}>
                    <label htmlFor="review-description" style={labelStyles}>
                        리뷰 내용 *
                    </label>
                    <textarea
                        id="review-description"
                        value={formData.description}
                        onChange={handleInputChange('description')}
                        disabled={disabled}
                        placeholder="콘서트 관람 후기를 자세히 작성해주세요"
                        style={textareaStyles}
                        maxLength={ReviewValidation.description.maxLength}
                    />
                    {touched.description && errors.description && (
                        <div style={errorStyles}>{errors.description}</div>
                    )}
                    <div
                        style={getCounterStyles(
                            'description',
                            ReviewValidation.description.maxLength,
                        )}
                    >
                        {getCharacterCount(
                            formData.description,
                            ReviewValidation.description.maxLength,
                        )}
                    </div>
                </div>

                {/* 닉네임 입력 - 반응형 */}
                <div style={formGroupStyles}>
                    <label htmlFor="review-nickname" style={labelStyles}>
                        닉네임 *
                    </label>
                    <input
                        id="review-nickname"
                        type="text"
                        value={formData.userNickname}
                        onChange={handleInputChange('userNickname')}
                        disabled={disabled}
                        placeholder="닉네임을 입력해주세요"
                        style={getInputStyles('userNickname')}
                        maxLength={ReviewValidation.userNickname.maxLength}
                    />
                    {touched.userNickname && errors.userNickname && (
                        <div style={errorStyles}>{errors.userNickname}</div>
                    )}
                    <div
                        style={getCounterStyles(
                            'userNickname',
                            ReviewValidation.userNickname.maxLength,
                        )}
                    >
                        {getCharacterCount(
                            formData.userNickname,
                            ReviewValidation.userNickname.maxLength,
                        )}
                    </div>
                </div>

                {/* 버튼 영역 - 반응형 */}
                <div style={buttonContainerStyles}>
                    <button
                        type="submit"
                        disabled={disabled || loading}
                        style={submitButtonStyles}
                    >
                        {loading ? (
                            <>
                                <span style={{
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #ffffff',
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    marginRight: '6px',
                                }}></span>
                                {mode === 'edit' ? '수정 중...' : '작성 중...'}
                            </>
                        ) : (
                            <>
                                {mode === 'edit'
                                    ? '✅ 수정 완료'
                                    : '📝 리뷰 작성'}
                            </>
                        )}
                    </button>

                    {showCancelButton && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            style={cancelButtonStyles}
                        >
                            ❌ 취소
                        </button>
                    )}
                </div>
            </form>

            {/* 안내 메시지 - 반응형 */}
            {!compact && (
                <div
                    style={{
                        marginTop: '20px',
                        padding: isMobile ? '16px' : '12px',
                        backgroundColor: '#374151',
                        borderRadius: '6px',
                        fontSize: isMobile ? '14px' : '12px',
                        color: '#D1D5DB',
                        lineHeight: '1.5',
                        textAlign: isMobile ? 'center' : 'left',
                    }}
                >
                    💡 작성하신 리뷰는 다른 관람객들에게 큰 도움이 됩니다.
                    정직하고 자세한 후기를 작성해주세요!
                </div>
            )}

            {/* CSS 애니메이션 */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

// ===== 기본 PROPS =====
ReviewForm.defaultProps = {
    mode: 'create',
    initialData: null,
    loading: false,
    disabled: false,
    showCancelButton: true,
    className: '',
    compact: false,
};

export default ReviewForm;