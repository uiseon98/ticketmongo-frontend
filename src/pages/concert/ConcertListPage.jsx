import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  fetchConcerts,
  searchConcerts,
  filterConcerts
} from '../../features/concert/services/concertService';
import ConcertCard from '../../features/concert/components/ConcertCard';

function ConcertListPage() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('query') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    const getConcerts = async () => {
      setLoading(true);
      setError(null);
      try {
        let response;
        if (query) {
          response = await searchConcerts(query);
        } else if (startDate || endDate || minPrice || maxPrice) {
          const filterDTO = {
            startDate,
            endDate,
            minPrice: minPrice ? parseInt(minPrice) : null,
            maxPrice: maxPrice ? parseInt(maxPrice) : null
          };
          response = await filterConcerts(filterDTO);
        } else {
          response = await fetchConcerts();
        }
        setConcerts(response.content || response);
      } catch (err) {
        console.error('콘서트 목록을 가져오는 데 실패했습니다:', err);
        setError(err.message || '콘서트 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    getConcerts();
  }, [query, startDate, endDate, minPrice, maxPrice]);

  const handleSearch = (e) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams();
    if (e.target.query.value)
      newSearchParams.set('query', e.target.query.value);
    setSearchParams(newSearchParams);
  };

  const handleFilter = (e) => {
    e.preventDefault();
    const newSearchParams = new URLSearchParams();
    if (e.target.startDate.value)
      newSearchParams.set('startDate', e.target.startDate.value);
    if (e.target.endDate.value)
      newSearchParams.set('endDate', e.target.endDate.value);
    if (e.target.minPrice.value)
      newSearchParams.set('minPrice', e.target.minPrice.value);
    if (e.target.maxPrice.value)
      newSearchParams.set('maxPrice', e.target.maxPrice.value);
    setSearchParams(newSearchParams);
  };

  if (loading) {
    return <div className="text-center py-8">콘서트 목록 로딩 중...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">에러: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        모든 콘서트
      </h1>

      {/* 검색 폼 */}
      <form
        onSubmit={handleSearch}
        className="mb-6 bg-white p-4 rounded-lg shadow-md flex gap-2"
      >
        <input
          type="text"
          name="query"
          defaultValue={query}
          placeholder="콘서트 제목, 아티스트, 장소 검색..."
          className="flex-grow p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
        >
          검색
        </button>
      </form>

      {/* 필터 폼 */}
      <form
        onSubmit={handleFilter}
        className="mb-6 bg-white p-4 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div>
          <label
            htmlFor="startDate"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            시작 날짜:
          </label>
          <input
            type="date"
            name="startDate"
            defaultValue={startDate}
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div>
          <label
            htmlFor="endDate"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            종료 날짜:
          </label>
          <input
            type="date"
            name="endDate"
            defaultValue={endDate}
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div>
          <label
            htmlFor="minPrice"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            최소 가격:
          </label>
          <input
            type="number"
            name="minPrice"
            defaultValue={minPrice}
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div>
          <label
            htmlFor="maxPrice"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            최대 가격:
          </label>
          <input
            type="number"
            name="maxPrice"
            defaultValue={maxPrice}
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="md:col-span-2 lg:col-span-4 flex justify-center">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 w-full md:w-auto"
          >
            필터 적용
          </button>
        </div>
      </form>

      {concerts.length === 0 ? (
        <p className="text-center text-gray-600">
          검색/필터링 결과가 없습니다.
        </p>
      ) : (
        <ul className="space-y-6">
          {concerts.map((concert) => (
            <ConcertCard key={concert.concertId} concert={concert} />
          ))}
        </ul>
      )}
    </div>
  );
}

export default ConcertListPage;
