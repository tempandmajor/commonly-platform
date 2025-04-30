
import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { globalSearch, SearchResult } from '@/services/searchService';
import { useDebounce } from '@/hooks/useDebounce';

export const useSearch = (initialQuery: string = '') => {
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);
  
  const { data: results, isLoading, error, refetch } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => globalSearch(debouncedQuery),
    enabled: debouncedQuery.length > 2, // Only search when query has at least 3 characters
  });

  // Reset search when query is empty
  useEffect(() => {
    if (!debouncedQuery) {
      refetch();
    }
  }, [debouncedQuery, refetch]);

  return { 
    query,
    setQuery,
    results: results || [],
    isLoading,
    error,
    isSearching: debouncedQuery.length > 2 && isLoading
  };
};
