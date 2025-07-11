// src/features/concert/components/FilterPanel.jsx

// ===== IMPORT 섹션 =====
import React, { useState, useCallback, useEffect } from 'react';
// useState: 필터 상태 관리
// useCallback: 함수 최적화 (기본적인 수준만)
// useEffect: 초기값 설정

/**
 * ===== FilterPanel 컴포넌트 (개선된 버전) =====
 *
 * 🎯 주요 개선사항:
 * 1. **스마트 초기화 버튼**: 상황에 따라 "필터 초기화" / "전체 보기"로 변경
 * 2. **필터 적용 상태 추적**: 현재 필터가 적용되어 있는지 감지
 * 3. **향상된 사용자 경험**: 필터링 후에도 전체 목록으로 쉽게 돌아가기
 */
const FilterPanel = ({
    // ===== 필수 props =====
    onFilter, // 필터 적용 함수 (useConcerts.filterConcerts)
    onReset, // 🔥 새로 추가: 전체 보기 함수 (ConcertListPage에서 전달)

    // ===== 초기값 props =====
    initialFilters = {}, // 초기 필터 값

    // ===== UI 제어 props =====
    loading = false, // 필터링 중인지 여부 (useConcerts.loading)
    disabled = false, // 전체 비활성화

    // ===== 스타일 props =====
    className = '', // 추가 CSS 클래스
    compact = false, // 컴팩트 모드 (좁은 공간용)

    // ===== 🔥 새로 추가: 상태 추적 props =====
    hasActiveFilters = false, // 현재 필터가 적용되어 있는지 여부 (ConcertListPage에서 전달)
}) => {
    // ===== 상태 관리 섹션 =====

    /**
     * 날짜 필터 상태 (YYYY-MM-DD 형식)
     * 백엔드 ConcertFilterDTO.startDate, endDate와 매핑
     */
    const [startDate, setStartDate] = useState(initialFilters.startDate || '');
    const [endDate, setEndDate] = useState(initialFilters.endDate || '');

    /**
     * 간단한 에러 상태
     * 복잡한 검증 로직 대신 기본적인 에러만 추적
     */
    const [error, setError] = useState('');

    /**
     * 🔥 개선된 변경 상태 추적
     * 1. hasLocalChanges: 현재 입력 필드에 변경사항이 있는지
     * 2. hasActiveFilters: 실제로 필터가 적용되어 있는지 (props로 받음)
     */
    const [hasLocalChanges, setHasLocalChanges] = useState(false);

    // ===== 기본 유효성 검증 함수들 =====

    /**
     * 🔥 현재 날짜 가져오기 (YYYY-MM-DD 형식)
     */
    const getCurrentDate = useCallback(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    /**
     * 날짜 범위 검증 (간단 버전)
     * 시작일이 종료일보다 늦으면 안됨
     */
    const isValidDateRange = useCallback(() => {
        if (!startDate || !endDate) return true; // 둘 중 하나라도 없으면 OK
        return new Date(startDate) <= new Date(endDate);
    }, [startDate, endDate]);

    /**
     * 🔥 과거 날짜 검증
     * 시작일이 현재 날짜보다 이전인지 확인
     */
    const isPastDate = useCallback(() => {
        if (!startDate) return false; // 시작일이 없으면 검증하지 않음
        const today = getCurrentDate();
        return startDate < today;
    }, [startDate, getCurrentDate]);

    /**
     * 🔥 종료일 과거 날짜 검증
     * 종료일이 현재 날짜보다 이전인지 확인
     */
    const isEndDatePast = useCallback(() => {
        if (!endDate) return false; // 종료일이 없으면 검증하지 않음
        const today = getCurrentDate();
        return endDate < today;
    }, [endDate, getCurrentDate]);

    /**
     * 🔥 개선된 전체 필터 유효성 검증
     * 1. 날짜 범위 검증 (시작일 <= 종료일)
     * 2. 과거 날짜 차단 (백엔드에서 지원하지 않는 경우)
     */
    const validateFilters = useCallback(() => {
        setError(''); // 에러 초기화

        // 1. 날짜 범위 검증 (필수)
        if (!isValidDateRange()) {
            setError(
                '시작일과 종료일을 다시 확인해주세요. 종료일이 시작일보다 앞설 수 없습니다.',
            );
            return false;
        }

        // 🔥 2. 과거 날짜 완전 차단 (API 요청 방지)
        if (isPastDate() && isEndDatePast()) {
            setError(
                '🚫 과거 날짜 범위는 검색할 수 없습니다. 현재 날짜 이후로 설정해주세요.',
            );
            return false; // API 요청 차단
        } else if (isPastDate()) {
            setError('🚫 시작일이 과거입니다. 오늘 날짜 이후로 설정해주세요.');
            return false; // API 요청 차단
        } else if (isEndDatePast()) {
            setError('🚫 종료일이 과거입니다. 오늘 날짜 이후로 설정해주세요.');
            return false; // API 요청 차단
        }

        return true;
    }, [isValidDateRange, isPastDate, isEndDatePast]);

    // ===== 필터 데이터 변환 함수 =====

    /**
     * 현재 필터 상태를 백엔드 API 형식으로 변환
     * ConcertFilterDTO 형식에 맞춤
     */
    const getCurrentFilters = useCallback(() => {
        const filters = {};

        // 날짜 필터 (값이 있을 때만 추가)
        if (startDate.trim()) {
            filters.startDate = startDate.trim();
        }
        if (endDate.trim()) {
            filters.endDate = endDate.trim();
        }

        return filters;
    }, [startDate, endDate]);

    /**
     * 🔥 현재 필터가 비어있는지 확인
     */
    const isCurrentFilterEmpty = useCallback(() => {
        const filters = getCurrentFilters();
        return Object.keys(filters).length === 0;
    }, [getCurrentFilters]);

    // ===== 이벤트 핸들러들 =====

    /**
     * 필터 적용 핸들러
     * useConcerts.filterConcerts() 호출
     */
    const handleApplyFilter = useCallback(async () => {
        // 로딩 중이거나 비활성화 상태면 실행하지 않음
        if (loading || disabled) {
            return;
        }

        // 유효성 검증
        if (!validateFilters()) {
            return; // 검증 실패 시 함수 종료 (에러 메시지는 이미 설정됨)
        }

        // 현재 필터 값들을 API 형식으로 변환
        const filterParams = getCurrentFilters();

        try {
            // useConcerts.filterConcerts() 호출
            if (onFilter && typeof onFilter === 'function') {
                await onFilter(filterParams);
                console.info('필터 적용 완료:', filterParams);

                // 필터 적용 후 로컬 변경사항 초기화
                setHasLocalChanges(false);
            }
        } catch (err) {
            // 필터링 실패 시 에러 메시지 설정
            setError('필터링 중 오류가 발생했습니다.');
            console.error('필터링 실패:', err);
        }
    }, [loading, disabled, validateFilters, getCurrentFilters, onFilter]);

    /**
     * 🔥 개선된 초기화/전체보기 핸들러
     * 상황에 따라 다른 동작 수행:
     * 1. 로컬 변경사항만 있는 경우 -> 필드 초기화
     * 2. 필터가 적용된 상태인 경우 -> 전체 보기 (onReset 호출)
     */
    const handleResetOrShowAll = useCallback(() => {
        if (hasActiveFilters && onReset) {
            // 필터가 적용된 상태 -> 전체 보기
            onReset();
            console.info('전체 콘서트 보기로 전환');
        } else {
            // 로컬 변경사항만 있는 경우 -> 필드 초기화
            setStartDate(initialFilters.startDate || '');
            setEndDate(initialFilters.endDate || '');
            setError('');
            setHasLocalChanges(false);
            console.info('필터 입력 필드가 초기화되었습니다.');
        }
    }, [hasActiveFilters, onReset, initialFilters]);

    /**
     * 시작일 변경 핸들러
     */
    const handleStartDateChange = useCallback((event) => {
        setStartDate(event.target.value);
        setHasLocalChanges(true);

        // 🔥 실시간 과거 날짜 검증
        const newStartDate = event.target.value;
        if (newStartDate) {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
            if (newStartDate < today) {
                setError(
                    '⚠️ 시작일이 과거입니다. 과거~현재 기간의 콘서트를 검색합니다.',
                );
            } else {
                setError(''); // 과거가 아니면 에러 제거
            }
        } else {
            setError(''); // 입력값이 없으면 에러 제거
        }
    }, []);

    /**
     * 종료일 변경 핸들러
     */
    const handleEndDateChange = useCallback((event) => {
        setEndDate(event.target.value);
        setHasLocalChanges(true);

        // 🔥 실시간 과거 날짜 검증
        const newEndDate = event.target.value;
        if (newEndDate) {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
            if (newEndDate < today) {
                setError(
                    '⚠️ 종료일이 과거입니다. 현재까지의 콘서트를 검색합니다.',
                );
            } else {
                setError(''); // 과거가 아니면 에러 제거
            }
        } else {
            setError(''); // 입력값이 없으면 에러 제거
        }
    }, []);

    // ===== 부수 효과(Side Effect) =====

    /**
     * 초기값 변경 시 상태 동기화
     */
    useEffect(() => {
        setStartDate(initialFilters.startDate || '');
        setEndDate(initialFilters.endDate || '');
        setHasLocalChanges(false);
        setError('');
    }, [initialFilters]);

    // ===== 🔥 동적 버튼 텍스트 및 상태 계산 =====

    /**
     * 초기화/전체보기 버튼의 텍스트와 활성화 상태 결정
     */
    const resetButtonConfig = useCallback(() => {
        if (hasActiveFilters) {
            // 필터가 적용된 상태
            return {
                text: '🏠 전체 보기',
                emoji: '🏠',
                enabled: true,
                tooltip: '모든 콘서트 보기',
            };
        } else if (hasLocalChanges) {
            // 로컬 변경사항만 있는 상태
            return {
                text: '🔄 필터 초기화',
                emoji: '🔄',
                enabled: true,
                tooltip: '입력한 필터 조건 지우기',
            };
        } else {
            // 아무 변경사항 없는 상태
            return {
                text: '⚪ 필터 초기화',
                emoji: '⚪',
                enabled: false,
                tooltip: '변경된 필터 조건이 없습니다',
            };
        }
    }, [hasActiveFilters, hasLocalChanges]);

    const resetConfig = resetButtonConfig();

    // ===== 스타일 정의 =====

    /**
     * 컨테이너 스타일
     */
    const containerStyles = {
        padding: compact ? '12px' : '16px',
        border: '1px solid #374151', // 어두운 테두리
        borderRadius: '8px',
        backgroundColor: '#1E293B', // 다크 배경
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)', // 더 진한 그림자
        opacity: disabled ? 0.6 : 1,
    };

    /**
     * 섹션 스타일
     */
    const sectionStyles = {
        marginBottom: compact ? '12px' : '16px',
    };

    /**
     * 라벨 스타일
     */
    const labelStyles = {
        display: 'block',
        fontSize: compact ? '13px' : '14px',
        fontWeight: '600',
        color: '#FFFFFF', // 흰색 라벨
        marginBottom: '6px',
    };

    /**
     * 입력 필드 스타일
     */
    const inputStyles = {
        width: '100%',
        padding: compact ? '6px 8px' : '8px 12px',
        border: '1px solid #374151', // 어두운 테두리
        borderRadius: '4px',
        fontSize: compact ? '13px' : '14px',
        backgroundColor: disabled ? '#374151' : '#1E293B', // 다크 배경
        color: disabled ? '#9ca3af' : '#FFFFFF', // 흰색 텍스트
    };

    /**
     * 🔥 개선된 에러 메시지 스타일
     * 에러 타입에 따라 다른 색상 적용
     */
    const getErrorStyles = useCallback(() => {
        const baseStyles = {
            fontSize: '12px',
            marginTop: '8px',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '6px',
        };

        // 과거 날짜 경고인지 확인
        const isWarning = error.includes('⚠️');

        if (isWarning) {
            // 경고 스타일 (노란색)
            return {
                ...baseStyles,
                color: '#FBB93B', // 더 어두운 노란색 텍스트
                backgroundColor: '#1E293B', // 다크 배경
                borderColor: '#374151', // 어두운 테두리
            };
        } else {
            // 에러 스타일 (빨간색)
            return {
                ...baseStyles,
                color: '#F87171', // 더 어두운 빨간색
                backgroundColor: '#1E293B', // 다크 배경
                borderColor: '#374151', // 어두운 테두리
            };
        }
    }, [error]);

    /**
     * 버튼 기본 스타일
     */
    const buttonBaseStyles = {
        padding: compact ? '6px 12px' : '8px 16px',
        borderRadius: '4px',
        fontSize: compact ? '13px' : '14px',
        fontWeight: '500',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        border: 'none',
        opacity: disabled || loading ? 0.6 : 1,
    };

    /**
     * 적용 버튼 스타일
     */
    const applyButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: '#3b82f6',
        color: '#ffffff',
        marginRight: '8px',
    };

    /**
     * 🔥 개선된 초기화/전체보기 버튼 스타일
     */
    const resetButtonStyles = {
        ...buttonBaseStyles,
        backgroundColor: hasActiveFilters ? '#10b981' : '#6b7280', // 전체보기는 초록색, 초기화는 회색
        color: '#ffffff',
        opacity: !resetConfig.enabled || disabled ? 0.4 : 1,
        cursor: !resetConfig.enabled || disabled ? 'not-allowed' : 'pointer',
    };

    // ===== JSX 렌더링 =====

    return (
        <div
            className={`filter-panel ${className}`}
            style={containerStyles}
            role="search"
            aria-label="콘서트 필터링"
        >
            {/* 📅 날짜 필터 섹션 */}
            <div style={sectionStyles}>
                <h3
                    style={{
                        ...labelStyles,
                        fontSize: compact ? '14px' : '16px',
                        marginBottom: compact ? '8px' : '12px',
                        color: '#ffffff',
                    }}
                >
                    📅 공연 날짜
                </h3>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto 1fr',
                        gap: '8px',
                        alignItems: 'end',
                    }}
                >
                    {/* 시작일 */}
                    <div>
                        <label htmlFor="startDate" style={labelStyles}>
                            시작일
                        </label>
                        <input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            disabled={disabled}
                            style={inputStyles}
                        />
                    </div>

                    {/* 구분선 */}
                    <div
                        style={{
                            color: '#6b7280',
                            fontSize: compact ? '14px' : '16px',
                            paddingBottom: '8px',
                        }}
                    >
                        ~
                    </div>

                    {/* 종료일 */}
                    <div>
                        <label htmlFor="endDate" style={labelStyles}>
                            종료일
                        </label>
                        <input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={handleEndDateChange}
                            disabled={disabled}
                            style={inputStyles}
                        />
                    </div>
                </div>
            </div>

            {/* ⚠️ 에러/경고 메시지 */}
            {error && (
                <div style={getErrorStyles()}>
                    <div style={{ flexShrink: 0 }}>
                        {error.includes('⚠️') ? '⚠️' : '🚫'}
                    </div>
                    <div style={{ flex: 1 }}>
                        {error.replace('⚠️ ', '')} {/* 이모지 중복 제거 */}
                    </div>
                </div>
            )}

            {/* 🔧 버튼 영역 */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '8px',
                    marginTop: compact ? '12px' : '16px',
                }}
            >
                {/* 🔥 개선된 초기화/전체보기 버튼 */}
                <button
                    type="button"
                    onClick={handleResetOrShowAll}
                    disabled={disabled || !resetConfig.enabled}
                    style={resetButtonStyles}
                    aria-label={resetConfig.tooltip}
                    title={resetConfig.tooltip}
                >
                    {resetConfig.text}
                </button>

                {/* 적용 버튼 */}
                <button
                    type="button"
                    onClick={handleApplyFilter}
                    disabled={disabled || loading || isCurrentFilterEmpty()}
                    style={{
                        ...applyButtonStyles,
                        opacity:
                            disabled || loading || isCurrentFilterEmpty()
                                ? 0.4
                                : 1,
                    }}
                    aria-label="필터 적용"
                    title={
                        isCurrentFilterEmpty()
                            ? '필터 조건을 입력해주세요'
                            : '필터 적용'
                    }
                >
                    {loading ? '⏳ 적용 중...' : '🔍 필터 적용'}
                </button>
            </div>

            {/* 💡 도움말 (컴팩트가 아닐 때만) */}
            {!compact && (
                <div
                    style={{
                        marginTop: '12px',
                        padding: '8px',
                        backgroundColor: '#1E293B', // 다크 배경으로 변경
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#9CA3AF', // 어두운 회색 텍스트
                        border: '1px solid #374151', // 어두운 테두리 추가
                    }}
                >
                    {hasActiveFilters ? (
                        <>
                            🎯{' '}
                            <strong style={{ color: '#3B82F6' }}>
                                필터 적용됨:
                            </strong>{' '}
                            조건에 맞는 콘서트만 표시 중입니다. "전체 보기"를
                            클릭하여 모든 콘서트를 확인하세요.
                        </>
                    ) : (
                        <>
                            💡 <strong>팁:</strong> 날짜를 설정한 후 "필터 적용"
                            버튼을 눌러주세요. 과거 날짜를 선택하면 이미 종료된
                            콘서트를 검색할 수 있습니다.
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

// ===== 기본 PROPS =====
FilterPanel.defaultProps = {
    initialFilters: {},
    loading: false,
    disabled: false,
    className: '',
    compact: false,
    hasActiveFilters: false,
    onReset: null,
};

export default FilterPanel;
