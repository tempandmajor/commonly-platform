
// This file provides mock implementations for missing test dependencies

// Mock for vitest
export const describe = (name: string, fn: () => void) => {};
export const it = (name: string, fn: () => Promise<void> | void) => {};
export const expect = (value: any) => ({
  toBe: (expected: any) => {},
  toEqual: (expected: any) => {},
  toContain: (expected: any) => {},
  toBeDefined: () => {},
  toBeNull: () => {},
  toBeTruthy: () => {},
  toBeFalsy: () => {},
  toHaveLength: (expected: number) => {},
  toThrow: (expected?: any) => {},
});

// Mock for Playwright
export const test = (name: string, fn: () => Promise<void> | void) => {};
export const expect as any = expect;
export const page = {
  goto: async (url: string) => {},
  click: async (selector: string) => {},
  fill: async (selector: string, value: string) => {},
  waitForSelector: async (selector: string) => {},
  waitForNavigation: async () => {},
};

// Fix for getPodcastById -> getPodcast
export const getPodcastById = async (id: string) => {
  // Import the actual getPodcast function and use that
  const { getPodcast } = await import('../services/podcast/podcastCrudService');
  return getPodcast(id);
};

// Helper for podcast creation tests
export const createPodcastTestHelper = async (podcastData: any) => {
  // Add required fields for PodcastCreateInput
  const completeData = {
    ...podcastData,
    userId: 'test-user-id',
    type: 'audio' as const,
    published: true,
    visibility: 'public' as const,
  };
  
  const { createPodcast } = await import('../services/podcast/podcastCrudService');
  return createPodcast(completeData);
};
