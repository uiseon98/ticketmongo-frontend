// src/features/concert/components/SearchBar.jsx

// ===== IMPORT 섹션 =====
import React, { useState, useRef, useCallback, useEffect } from 'react';
// 새로 추가된 훅:
// - useCallback: 함수 최적화 (props로 전달되는 함수의 불필요한 재생성 방지)
// - useEffect: 외부 상태와 내부 상태 동기화

/**
 * ===== SearchBar 컴포넌트 (useSearch Hook 연동 최적화 버전) =====
 *
 * 🎯 주요 개선사항:
 * 1. useSearch Hook과 완벽한 연동 지원
 * 2. 외부 제어 모드와 내부 제어 모드 지원
 * 3. 성능 최적화 (useCallback 활용)
 * 3. 성능 최적화 (useCallback 활용)
 * 4. 상태 동기화 로직 개선
 *
 * 🔄 두 가지 사용 모드:
 * - 외부 제어: value + onChange props 사용 (useSearch Hook과 연동)
 * - 내부 제어: initialValue만 사용 (독립적 사용)
 */
const SearchBar = ({
  // ===== 필수 props =====
  onSearch,                    // 검색 실행 함수 (필수)

  // ===== 상태 제어 관련 props =====
  value,                       // 🆕 외부에서 관리하는 검색어 (useSearch.searchTerm)
  onChange,                    // 🆕 검색어 변경 함수 (useSearch.setSearchTerm)

  // ===== 기존 props (선택적) =====
  initialValue = '',           // 내부 제어 모드에서의 초기값
  placeholder = '콘서트나 아티스트를 검색하세요',
  loading = false,             // useSearch.isSearching과 연동
  disabled = false,
  autoFocus = false,
  onClear,                     // useSearch.clearSearch와 연동
  className = ''
}) => {

  // ===== 상태 관리 섹션 (핵심 개선 부분) =====

  /**
   * 🔥 핵심: 외부 제어 vs 내부 제어 판단
   * - value prop이 있으면 → 외부 제어 모드 (useSearch Hook 연동)
   * - value prop이 없으면 → 내부 제어 모드 (독립 사용)
   */
  const isExternallyControlled = value !== undefined;

  /**
   * 내부 상태 (내부 제어 모드에서만 사용)
   * 외부 제어 모드에서는 사용되지 않음
   */
  const [internalSearchTerm, setInternalSearchTerm] = useState(initialValue);

  /**
   * 🎯 현재 검색어 값 결정 로직
   * - 외부 제어: value prop 사용
   * - 내부 제어: internalSearchTerm 사용
   */
  const currentSearchTerm = isExternallyControlled ? value : internalSearchTerm;

  /**
   * 🎯 검색어 변경 함수 결정 로직
   * - 외부 제어: onChange prop 사용 (useSearch.setSearchTerm)
   * - 내부 제어: setInternalSearchTerm 사용
   */
  const setCurrentSearchTerm = isExternallyControlled ? onChange : setInternalSearchTerm;

  // 포커스 상태 (항상 내부에서 관리)
  const [isFocused, setIsFocused] = useState(false);

  // DOM 참조
  const inputRef = useRef(null);

  // ===== 외부 상태 동기화 =====

  /**
   * 외부 제어 모드에서 value가 변경되었을 때 내부 로직 동기화
   * 예: useSearch Hook에서 clearSearch() 호출 시 value가 ''로 변경됨
   */
  useEffect(() => {
    if (isExternallyControlled && value === '' && inputRef.current) {
      // 외부에서 검색어가 지워졌을 때 포커스 유지 (사용자 편의)
      // inputRef.current.focus(); // 필요시 주석 해제
    }
  }, [isExternallyControlled, value]);

  // ===== 이벤트 핸들러 섹션 (성능 최적화) =====

  /**
   * 입력 값 변경 핸들러 (useCallback으로 최적화)
   * 외부 제어 모드에서는 부모의 onChange를 직접 호출
   */
  const handleInputChange = useCallback((event) => {
    const newValue = event.target.value;

    // 검색어 상태 업데이트 (외부/내부 제어 모드에 따라 다름)
    if (setCurrentSearchTerm) {
      setCurrentSearchTerm(newValue);
    }

    // 개발자 디버깅용 로그
    console.debug('검색어 변경:', newValue, isExternallyControlled ? '(외부 제어)' : '(내부 제어)');
  }, [setCurrentSearchTerm, isExternallyControlled]);

  /**
   * 검색 실행 핸들러 (useCallback으로 최적화)
   * useSearch.performSearch와 연동
   */
  const handleSearch = useCallback(() => {
    // 검색어 정리 (앞뒤 공백 제거)
    const trimmedTerm = currentSearchTerm.trim();

    // 빈 검색어 검증
    if (!trimmedTerm) {
      // 포커스를 주어 사용자에게 입력 유도
      if (inputRef.current) {
        inputRef.current.focus();
      }
      return;
    }

    // 비활성화 상태 또는 로딩 중일 때 실행 방지
    if (disabled || loading) {
      return;
    }

    // 부모 컴포넌트의 검색 함수 호출 (useSearch.performSearch)
    if (onSearch && typeof onSearch === 'function') {
      onSearch(trimmedTerm);
    }

    console.info(`검색 실행: "${trimmedTerm}"`);
  }, [currentSearchTerm, disabled, loading, onSearch]);

  /**
   * 검색어 지우기 핸들러 (useCallback으로 최적화)
   * useSearch.clearSearch와 연동
   */
  const handleClear = useCallback(() => {
    // 외부 제어 모드: 부모의 onClear 호출 (useSearch.clearSearch)
    if (isExternallyControlled && onClear) {
      onClear();
    }
    // 내부 제어 모드: 직접 상태 초기화
    else if (!isExternallyControlled) {
      setInternalSearchTerm('');
    }

    // 포커스 유지 (사용자 편의)
    if (inputRef.current) {
      inputRef.current.focus();
    }

    console.info('검색어 지워짐');
  }, [isExternallyControlled, onClear]);

  /**
   * 키보드 이벤트 핸들러 (useCallback으로 최적화)
   */
  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      handleClear();
    }
  }, [handleSearch, handleClear]);

  /**
   * 포커스 관련 핸들러들 (useCallback으로 최적화)
   */
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // ===== 스타일 정의 섹션 =====

  /**
   * 컨테이너 스타일 (기존과 동일)
   */
  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    maxWidth: '600px',
    position: 'relative',
    border: `2px solid ${isFocused ? '#3b82f6' : '#d1d5db'}`,
    borderRadius: '8px',
    backgroundColor: disabled ? '#f3f4f6' : '#ffffff',
    boxShadow: isFocused
      ? '0 0 0 3px rgba(59, 130, 246, 0.1)'
      : '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease-in-out',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'text'
  };

  /**
   * 입력 필드 스타일 (기존과 동일)
   */
  const inputStyles = {
    flex: 1,
    padding: '12px 16px',
    border: 'none',
    outline: 'none',
    fontSize: '16px',
    fontFamily: 'inherit',
    backgroundColor: 'transparent',
    color: disabled ? '#9ca3af' : '#1f2937'
  };

  /**
   * 버튼 스타일들 (기존과 동일)
   */
  const buttonBaseStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    margin: '0 4px',
    width: '40px',
    height: '40px',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.5 : 1
  };

  const searchButtonStyles = {
    ...buttonBaseStyles,
    color: loading ? '#9ca3af' : '#3b82f6'
  };

  const clearButtonStyles = {
    ...buttonBaseStyles,
    color: '#6b7280'
  };

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
        value={currentSearchTerm}           // 🔥 외부/내부 제어에 따라 결정
        onChange={handleInputChange}        // 🔥 최적화된 핸들러
        onKeyPress={handleKeyPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        style={inputStyles}
        aria-label="검색어 입력"
        aria-describedby="search-help"
        autoComplete="off"
        autoFocus={autoFocus}
      />

      {/* 검색어 지우기 버튼 */}
      {currentSearchTerm && !disabled && (   // 🔥 currentSearchTerm 사용
        <button
          type="button"
          onClick={handleClear}              // 🔥 최적화된 핸들러
          style={clearButtonStyles}
          aria-label="검색어 지우기"
          title="검색어 지우기 (ESC)"
        >
          <svg
            width="20" height="20"
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
        onClick={handleSearch}               // 🔥 최적화된 핸들러
        disabled={disabled || loading}
        style={searchButtonStyles}
        aria-label="검색 실행"
        title="검색 실행 (Enter)"
      >
        {loading ? (
          // 로딩 스피너
          <svg
            width="20" height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              animation: 'spin 1s linear infinite'
            }}
          >
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        ) : (
          // 돋보기 아이콘
          <svg
            width="20" height="20"
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
          overflow: 'hidden'
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
  className: ''
};

export default SearchBar;