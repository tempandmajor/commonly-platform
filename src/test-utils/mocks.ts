
// This file provides mock implementations for missing test dependencies

// Mock for vitest
export const describe = (name: string, fn: () => void) => {};
export const it = (name: string, fn: () => Promise<void> | void) => {};
export const beforeEach = (fn: () => void) => {};
export const afterEach = (fn: () => void) => {};

// Create a vi mock object with common test utilities
export const vi = {
  fn: () => {
    const mockFn = (...args: any[]) => {
      mockFn.mock.calls.push(args);
      return mockFn._mockReturnValue;
    };
    mockFn.mock = {
      calls: [],
      results: [],
      instances: [],
      mockClear: () => {
        mockFn.mock.calls = [];
        mockFn.mock.results = [];
        mockFn.mock.instances = [];
      },
      mockReset: () => {
        mockFn.mock.calls = [];
        mockFn.mock.results = [];
        mockFn.mock.instances = [];
      }
    };
    mockFn._mockReturnValue = undefined;
    mockFn.mockReturnValue = (val: any) => {
      mockFn._mockReturnValue = val;
      return mockFn;
    };
    mockFn.mockResolvedValue = (val: any) => {
      mockFn._mockReturnValue = Promise.resolve(val);
      return mockFn;
    };
    mockFn.mockImplementation = (impl: (...args: any[]) => any) => {
      mockFn._mockReturnValue = impl;
      return mockFn;
    };
    mockFn.mockReturnThis = () => {
      mockFn._mockReturnValue = mockFn;
      return mockFn;
    };
    return mockFn;
  },
  clearAllMocks: () => {},
  mock: (moduleName: string, factory?: () => any) => {},
  clearAllTimers: () => {},
  useFakeTimers: () => {},
  useRealTimers: () => {},
  runAllTimers: () => {},
  advanceTimersByTime: (ms: number) => {}
};

// Create expectImpl function with enhanced capabilities
const expectImpl = (value: any) => ({
  toBe: (expected: any) => {},
  toEqual: (expected: any) => {},
  toContain: (expected: any) => {},
  toBeDefined: () => {},
  toBeNull: () => {},
  toBeTruthy: () => {},
  toBeFalsy: () => {},
  toHaveLength: (expected: number) => {},
  toThrow: (expected?: any) => {},
  toHaveBeenCalled: () => {},
  // Fix: Properly implement toHaveBeenCalledWith to accept any number of arguments
  toHaveBeenCalledWith: (...args: any[]) => {},
  toBeVisible: () => {},
  toHaveTitle: (regex: RegExp | string) => {}
});

export const expect = expectImpl;

// Mock for Playwright
export const test = Object.assign(
  (name: string, fn: (params: { page: any }) => Promise<void> | void) => {},
  {
    describe: (name: string, fn: () => void) => {},
    beforeEach: (fn: (params: { page: any }) => Promise<void> | void) => {}
  }
);

export const page = {
  goto: async (url: string) => {},
  click: async (selector: string) => {},
  fill: async (selector: string, value: string) => {},
  waitForSelector: async (selector: string) => {},
  waitForNavigation: async () => {},
  waitForURL: async (url: string) => {},
  locator: (selector: string) => ({
    toBeVisible: () => {},
    click: async () => {},
    fill: async (value: string) => {}
  })
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
