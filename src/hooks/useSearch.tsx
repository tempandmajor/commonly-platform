
import { useState, useCallback } from 'react';
import { SearchResult, globalSearch } from '@/services/searchService';

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setQuery(searchQuery);
    setLoading(true);
    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await globalSearch(searchQuery);
      setResults(searchResults);
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errMessage);
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    search,
    query,
    setQuery,
    isSearching
  };
}
