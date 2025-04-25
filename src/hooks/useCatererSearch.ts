
import { useState, useEffect, useCallback } from 'react';
import { getCaterers } from '@/services/catererService';
import { Caterer, CatererSearchParams } from '@/types/caterer';

export const useCatererSearch = () => {
  const [caterers, setCaterers] = useState<Caterer[]>([]);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [searchParams, setSearchParams] = useState<CatererSearchParams>({});

  const fetchCaterers = useCallback(async (reset = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const lastDoc = reset ? null : lastVisible;
      const result = await getCaterers(lastDoc);
      
      if (reset) {
        setCaterers(result.caterers);
      } else {
        setCaterers(prev => [...prev, ...result.caterers]);
      }
      
      setLastVisible(result.lastVisible);
      setHasMore(result.caterers.length >= 12);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error fetching caterers:', err);
    } finally {
      setIsLoading(false);
    }
  }, [lastVisible]);

  const updateSearch = useCallback((params: Partial<CatererSearchParams>) => {
    setSearchParams(prev => ({
      ...prev,
      ...params
    }));
    
    // Reset results when search params change
    setCaterers([]);
    setLastVisible(null);
    setHasMore(true);
    fetchCaterers(true);
  }, [fetchCaterers]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchCaterers();
    }
  }, [isLoading, hasMore, fetchCaterers]);

  // Initial load
  useEffect(() => {
    fetchCaterers(true);
  }, []);

  return {
    caterers,
    isLoading,
    error,
    hasMore,
    loadMore,
    searchParams,
    updateSearch,
  };
};
