
interface CacheItem<T> {
  data: T;
  timestamp: number;
}

class ApiCache {
  private cache: Map<string, CacheItem<any>>;
  private ttl: number;  // Time to live in milliseconds

  constructor(ttlInSeconds = 300) {
    this.cache = new Map();
    this.ttl = ttlInSeconds * 1000;
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns Cached data or null if expired/missing
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if cache is still valid
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data as T;
  }

  /**
   * Store a value in the cache
   * @param key Cache key
   * @param data Data to store
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Delete a value from the cache
   * @param key Cache key
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cached data or fetch it if not available
   * @param key Cache key
   * @param fetchFn Function to call if cache miss
   * @returns The requested data
   */
  async getOrFetch<T>(key: string, fetchFn: () => Promise<T>): Promise<T> {
    const cachedData = this.get<T>(key);
    if (cachedData) return cachedData;

    const data = await fetchFn();
    this.set(key, data);
    return data;
  }
}

export const apiCache = new ApiCache();
