
import { useState, useCallback, useEffect } from 'react';
import { globalSearch, SearchResults } from '@/services/searchService';
import { useDebounce } from './useDebounce';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({
    events: [],
    venues: [],
    users: [],
    podcasts: []
  });
  const [loading, setLoading] = useState(false);
  
  const debouncedQuery = useDebounce(query, 300);

  const search = useCallback(async () => {
    if (!debouncedQuery) {
      setResults({
        events: [],
        venues: [],
        users: [],
        podcasts: []
      });
      return;
    }

    setLoading(true);
    try {
      const searchResults = await globalSearch(debouncedQuery);
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    search();
  }, [search]);

  return {
    query,
    setQuery,
    results,
    loading,
    search
  };
};

export default useSearch;
