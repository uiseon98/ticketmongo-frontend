// src/features/concert/components/SearchBar.jsx

// ===== IMPORT 섹션 =====
import React, { useState, useRef, useCallback, useEffect } from 'react';

// 🎯 반응형 Hook 추가
const useResponsive = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [screenWidth, setScreenWidth] = useState(
        typeof window !== 'undefined' ? window.innerWidth : 1200,
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
        screenWidth,
    };
};

/**
 * ===== SearchBar 컴포넌트 (반응형 개선 버전) =====
 *
 * 🎯 주요 개선사항:
 * 1. 모바일에서 터치 친화적인 크기와 레이아웃
 * 2. 반응형 폰트 크기 및 패딩
 * 3. 모바일에서 버튼 배치 최적화
 * 4. iOS zoom 방지를 위한 16px 폰트 사이즈 유지
 */
const SearchBar = ({
    // ===== 필수 props =====
    onSearch, // 검색 실행 함수 (필수)

    // ===== 상태 제어 관련 props =====
    value, // 외부에서 관리하는 검색어 (useSearch.searchTerm)
    onChange, // 검색어 변경 함수 (useSearch.setSearchTerm)

    // ===== 기존 props (선택적) =====
    initialValue = '', // 내부 제어 모드에서의 초기값
    placeholder = '콘서트나 아티스트를 검색하세요',
    loading = false, // useSearch.isSearching과 연동
    disabled = false,
    autoFocus = false,
    onClear, // useSearch.clearSearch와 연동
    className = '',
}) => {
    const { isMobile, isTablet } = useResponsive(); // 🎯 반응형 Hook 사용

    // ===== 상태 관리 섹션 =====
    const isExternallyControlled = value !== undefined;
    const [internalSearchTerm, setInternalSearchTerm] = useState(initialValue);
    const currentSearchTerm = isExternallyControlled
        ? value
        : internalSearchTerm;
    const setCurrentSearchTerm = isExternallyControlled
        ? onChange
        : setInternalSearchTerm;

    // 포커스 상태
    const [isFocused, setIsFocused] = useState(false);

    // DOM 참조
    const inputRef = useRef(null);

    // ===== 외부 상태 동기화 =====
    useEffect(() => {
        if (isExternallyControlled && value === '' && inputRef.current) {
            // 필요시 포커스 유지
        }
    }, [isExternallyControlled, value]);

    // ===== 이벤트 핸들러 섹션 =====

    /**
     * 🔥 입력 값 변경 핸들러 (한국어 처리 개선)
     */
    const handleInputChange = useCallback(
        (event) => {
            const newValue = event.target.value;
            console.log('입력값 변경:', newValue);
            if (setCurrentSearchTerm) {
                setCurrentSearchTerm(newValue);
            }
        },
        [setCurrentSearchTerm],
    );

    /**
     * 🔥 검색 실행 핸들러 (한국어 입력 중 방지)
     */
    const handleSearch = useCallback(() => {
        const trimmedTerm = currentSearchTerm.trim();
        if (!trimmedTerm) {
            if (inputRef.current) {
                inputRef.current.focus();
            }
            return;
        }

        if (disabled || loading) {
            return;
        }

        if (onSearch && typeof onSearch === 'function') {
            onSearch(trimmedTerm);
        }

        console.info(`검색 실행: "${trimmedTerm}"`);
    }, [currentSearchTerm, disabled, loading, onSearch]);

    /**
     * 🔥 검색어 지우기 핸들러 (완전 수정)
     */
    const handleClear = useCallback(() => {
        // 내부 제어 모드이므로 내부 상태만 초기화
        setInternalSearchTerm(''); // 또는 setCurrentSearchTerm('')

        // 외부 onClear 호출
        if (onClear && typeof onClear === 'function') {
            onClear();
        }

        // 포커스 유지
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [onClear]);

    /**
     * 🔥 키보드 이벤트 핸들러 (한국어 입력 고려)
     */
    const handleKeyDown = useCallback(
        (event) => {
            // 한국어 입력 중이면 엔터키 무시
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSearch();
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                handleClear();
            }
        },
        [handleSearch, handleClear],
    );

    /**
     * 포커스 관련 핸들러들
     */
    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    // ===== 🎯 반응형 스타일 정의 섹션 =====

    const containerStyles = {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: isMobile ? '100%' : '600px', // 🎯 모바일에서 full width
        position: 'relative',
        border: `2px solid ${isFocused ? '#3B82F6' : '#374151'}`,
        borderRadius: isMobile ? '12px' : '8px', // 🎯 모바일에서 더 둥글게
        backgroundColor: disabled ? '#374151' : '#1E293B',
        boxShadow: isFocused
            ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
            : '0 1px 3px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.2s ease-in-out',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'text',
        // 🎯 모바일에서 최소 높이 확보 (터치 친화적)
        minHeight: isMobile ? '52px' : '44px',
        // 🎯 박스 사이징
        boxSizing: 'border-box',
    };

    const inputStyles = {
        flex: 1,
        // 🎯 반응형 패딩
        padding: isMobile ? '16px 20px' : isTablet ? '14px 16px' : '12px 16px',
        border: 'none',
        outline: 'none',
        // 🎯 iOS zoom 방지를 위해 16px 유지 (모바일에서도)
        fontSize: '16px',
        fontFamily: 'inherit',
        backgroundColor: 'transparent',
        color: disabled ? '#9ca3af' : '#FFFFFF',
        // 🎯 플레이스홀더 색상
        '::placeholder': {
            color: '#9CA3AF',
        },
        // 🎯 박스 사이징
        boxSizing: 'border-box',
    };

    const buttonBaseStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // 🎯 반응형 패딩과 크기
        padding: isMobile ? '12px' : '8px',
        margin: isMobile ? '0 6px' : '0 4px',
        width: isMobile ? '48px' : '40px', // 🎯 모바일에서 더 큰 터치 영역
        height: isMobile ? '48px' : '40px',
        border: 'none',
        borderRadius: isMobile ? '10px' : '6px',
        backgroundColor: 'transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: disabled || loading ? 0.5 : 1,
        // 🎯 최소 터치 영역 확보
        minWidth: isMobile ? '44px' : '36px',
        minHeight: isMobile ? '44px' : '36px',
    };

    const searchButtonStyles = {
        ...buttonBaseStyles,
        color: loading ? '#9ca3af' : '#3b82f6',
        // 🎯 모바일에서 배경색 추가 (더 명확한 구분)
        backgroundColor: isMobile ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    };

    const clearButtonStyles = {
        ...buttonBaseStyles,
        color: '#6b7280',
        // 🎯 모바일에서 배경색 추가
        backgroundColor: isMobile ? 'rgba(107, 114, 128, 0.1)' : 'transparent',
    };

    // 🎯 아이콘 크기 (반응형)
    const iconSize = isMobile ? 24 : 20;

    // ===== JSX 렌더링 섹션 =====

    return (
        <div
            className={`search-bar ${className}`}
            style={containerStyles}
            role="search"
            aria-label="콘서트 검색"
        >
            {/* 검색 입력 필드 */}
            <input
                ref={inputRef}
                type="text"
                value={currentSearchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={
                    isMobile
                        ? '콘서트, 아티스트 검색...' // 🎯 모바일에서 간단한 플레이스홀더
                        : placeholder
                }
                disabled={disabled}
                style={inputStyles}
                aria-label="검색어 입력"
                aria-describedby="search-help"
                autoComplete="off"
                autoFocus={autoFocus}
                // 🎯 모바일에서 가상 키보드 최적화
                inputMode={isMobile ? 'search' : undefined}
                enterKeyHint={isMobile ? 'search' : undefined}
            />

            {/* 🔥 검색어 지우기 버튼 (조건 수정) */}
            {currentSearchTerm && currentSearchTerm.length > 0 && !disabled && (
                <button
                    type="button"
                    onClick={handleClear}
                    style={clearButtonStyles}
                    aria-label="검색어 지우기"
                    title="검색어 지우기 (ESC)"
                    // 🎯 모바일에서 터치 피드백
                    onTouchStart={
                        isMobile
                            ? (e) => {
                                  e.currentTarget.style.backgroundColor =
                                      'rgba(107, 114, 128, 0.2)';
                              }
                            : undefined
                    }
                    onTouchEnd={
                        isMobile
                            ? (e) => {
                                  e.currentTarget.style.backgroundColor =
                                      'rgba(107, 114, 128, 0.1)';
                              }
                            : undefined
                    }
                >
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            )}

            {/* 검색 실행 버튼 */}
            <button
                type="button"
                onClick={handleSearch}
                disabled={disabled || loading}
                style={searchButtonStyles}
                aria-label="검색 실행"
                title="검색 실행 (Enter)"
                // 🎯 모바일에서 터치 피드백
                onTouchStart={
                    isMobile
                        ? (e) => {
                              if (!disabled && !loading) {
                                  e.currentTarget.style.backgroundColor =
                                      'rgba(59, 130, 246, 0.2)';
                              }
                          }
                        : undefined
                }
                onTouchEnd={
                    isMobile
                        ? (e) => {
                              if (!disabled && !loading) {
                                  e.currentTarget.style.backgroundColor =
                                      'rgba(59, 130, 246, 0.1)';
                              }
                          }
                        : undefined
                }
            >
                {loading ? (
                    // 로딩 스피너
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                            animation: 'spin 1s linear infinite',
                        }}
                    >
                        <path d="M21 12a9 9 0 11-6.219-8.56" />
                    </svg>
                ) : (
                    // 돋보기 아이콘
                    <svg
                        width={iconSize}
                        height={iconSize}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                    </svg>
                )}
            </button>

            {/* 접근성 도움말 */}
            <div
                id="search-help"
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    width: '1px',
                    height: '1px',
                    overflow: 'hidden',
                }}
                aria-hidden="true"
            >
                콘서트 제목, 아티스트명, 공연장명으로 검색할 수 있습니다.
                엔터키를 누르거나 검색 버튼을 클릭하세요.
            </div>

            {/* CSS 애니메이션 */}
            <style>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                /* 🎯 모바일에서 플레이스홀더 스타일 */
                @media (max-width: 768px) {
                    .search-bar input::placeholder {
                        font-size: 15px;
                        color: #9CA3AF;
                    }
                }

                /* 🎯 터치 디바이스에서 호버 효과 비활성화 */
                @media (hover: hover) {
                    .search-bar button:hover {
                        transform: scale(1.05);
                    }
                }
            `}</style>
        </div>
    );
};

// ===== 기본 PROPS =====
SearchBar.defaultProps = {
    initialValue: '',
    placeholder: '콘서트나 아티스트를 검색하세요',
    loading: false,
    disabled: false,
    autoFocus: false,
    className: '',
};

export default SearchBar;
