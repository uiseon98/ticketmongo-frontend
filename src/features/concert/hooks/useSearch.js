// src/features/concert/hooks/useSearch.js

// React에서 제공하는 기본 훅들을 import
// useState: 컴포넌트의 상태(데이터)를 관리하는 훅
// useCallback: 함수를 메모이제이션(캐싱)해서 불필요한 재생성을 방지하는 훅
import { useState, useCallback, useRef } from 'react';

// 우리가 만든 콘서트 서비스 import (실제 API 호출 로직이 들어있음)
import { concertService } from '../services/concertService.js';

/**
 * 콘서트 검색 기능을 관리하는 커스텀 React 훅 (기본 버전)
 *
 * 🎯 이 훅이 하는 일:
 * 1. 검색 키워드 상태 관리 (searchTerm)
 * 2. 검색 결과 상태 관리 (searchResults 배열)
 * 3. 검색 상태 관리 (로딩, 에러)
 * 4. 검색 실행 함수 제공 (performSearch)
 * 5. 검색 초기화 함수 제공 (clearSearch)
 *
 * 🔄 사용 방법:
 * const { searchTerm, setSearchTerm, searchResults, isSearching, performSearch, clearSearch } = useSearch();
 *
 * 💡 특징:
 * - 버튼 클릭이나 엔터키로 검색 실행
 * - 간단하고 직관적인 검색 기능
 * - 최소한의 상태 관리
 *
 * @returns {Object} 검색 관련 상태와 함수들이 담긴 객체
 */
export const useSearch = () => {
  // ===== 상태(State) 정의 =====
  // React의 useState 훅을 사용해서 컴포넌트의 상태를 정의

  // 현재 입력된 검색 키워드
  // 초기값: 빈 문자열 ''
  const [searchTerm, setSearchTerm] = useState('');

  // 검색 결과 목록
  // 초기값: 빈 배열 []
  const [searchResults, setSearchResults] = useState([]);

  // 검색 중인지 여부를 나타내는 상태
  // 초기값: false (검색 중이 아님)
  const [isSearching, setIsSearching] = useState(false);

  // 검색 에러 발생 시 에러 정보를 저장하는 상태
  // 초기값: null (에러 없음)
  const [searchError, setSearchError] = useState(null);

  const debouneTimerRef = useRef(null);

  // ===== 함수 정의 =====

  /**
   * 검색을 수행하는 함수
   * useCallback으로 감싸서 불필요한 함수 재생성을 방지
   *
   * @param {string} keyword - 검색할 키워드 (선택사항, 기본값은 현재 searchTerm)
   */
  const performSearch = useCallback(async (keyword = searchTerm) => {
      // 이전 타이머가 있으면 취소
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
     }

      // 새로운 타이머 설정 (300ms 디바운스)
      debounceTimerRef.current = setTimeout(async () => {
    try {
      // 키워드가 없거나 공백만 있으면 검색하지 않음
      const trimmedKeyword = keyword.trim();
      if (!trimmedKeyword) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }

      // 검색 시작: 로딩 상태 활성화
      setIsSearching(true);

      // 이전 에러 상태 초기화: 새로운 검색이므로 기존 에러 제거
      setSearchError(null);

      // 실제 API 호출: concertService의 searchConcerts 메서드 사용
      const response = await concertService.searchConcerts(trimmedKeyword);

      // 검색 성공 시 결과 처리
      if (response && response.data) {
        const results = response.data;
        setSearchResults(results);

        // 개발/디버깅용 로그: 검색 결과 개수 확인
        console.info(`검색 완료: "${trimmedKeyword}" → ${results.length}개 결과`);
      } else {
        // API 응답은 성공했지만 데이터 형식이 예상과 다른 경우
        setSearchResults([]);
        setSearchError('검색 결과를 불러올 수 없습니다.');
      }

    } catch (error) {
      // API 호출 실패 시 에러 처리
      console.error(`검색 실패: "${keyword}":`, error);

      // 사용자에게 보여줄 친화적인 에러 메시지 설정
      setSearchError(error.message || '검색 중 오류가 발생했습니다.');
      setSearchResults([]);

    } finally {
      // 성공/실패 상관없이 로딩 상태 해제
      setIsSearching(false);
    }
      }, 300);
  }, [searchTerm]); // searchTerm이 변경되면 함수 재생성

  /**
   * 검색 상태를 모두 초기화하는 함수
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchError(null);
    setIsSearching(false);

    console.info('검색 상태가 초기화되었습니다.');
  }, []); // 의존성 없는 순수 함수

  /**
   * 검색어만 초기화하는 함수 (검색 결과는 유지)
   */
  const clearSearchTerm = useCallback(() => {
    setSearchTerm('');
  }, []); // 의존성 없는 순수 함수

  /**
   * 검색 결과만 초기화하는 함수 (검색어는 유지)
   */
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
    setSearchError(null);
  }, []); // 의존성 없는 순수 함수

  // ===== 반환값 =====

  /**
   * 이 훅을 사용하는 컴포넌트에게 제공할 상태와 함수들
   * 컴포넌트에서 구조 분해 할당으로 필요한 것만 가져다 쓸 수 있음
   */
  return {
    // 📊 검색 상태
    searchTerm,           // 현재 입력된 검색어
    searchResults,        // 검색 결과 목록 배열
    isSearching,          // 검색 중인지 여부 (true/false)
    searchError,          // 검색 에러 메시지 (문자열 또는 null)

    // 🔧 액션 함수들 (컴포넌트에서 호출해서 상태 변경)
    setSearchTerm,        // 검색어 변경 함수
    performSearch,        // 검색 실행 함수
    clearSearch,          // 검색 상태 모두 초기화
    clearSearchTerm,      // 검색어만 초기화
    clearSearchResults,   // 검색 결과만 초기화

    // 🎛️ 편의 기능들
    hasResults: searchResults.length > 0,                    // 검색 결과가 있는지 여부
    hasError: !!searchError,                                 // 에러가 있는지 여부
    isEmpty: searchResults.length === 0 && !isSearching,     // 검색 결과가 비어있는지 (검색 중이 아닐 때)

    // 검색 관련 편의 속성들
    resultCount: searchResults.length,                       // 검색 결과 개수
    isEmptySearch: !searchTerm.trim(),                      // 검색어가 비어있는지 여부
    canSearch: searchTerm.trim().length > 0 && !isSearching // 검색 가능한 상태인지 여부 (검색어 있고 검색 중이 아닐 때)
  };
};