
import { useState, useCallback } from 'react';
import { SearchResult, globalSearch } from '@/services/searchService';

export function useSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await globalSearch(query);
      setResults(searchResults);
    } catch (err) {
      const errMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errMessage);
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    search
  };
}
