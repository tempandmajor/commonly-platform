
import { describe, it, expect } from '../test-utils/mocks';
import { 
  createPodcast,
  getPodcasts,
  getPodcast
} from '@/services/podcast/podcastCrudService';

// Create vi object for mocking
const vi = {
  mock: (path: string, factory?: any) => {},
  fn: () => {
    return function mockFn() {
      return { id: 'test-podcast-id' };
    };
  }
};

// Mock Firebase services
vi.mock('@/lib/firebase', () => ({
  db: {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    addDoc: vi.fn().mockResolvedValue({ id: 'test-podcast-id' }),
    getDoc: vi.fn().mockResolvedValue({
      exists: () => true,
      data: () => ({
        title: 'Test Podcast',
        description: 'This is a test podcast',
        audioUrl: 'https://example.com/audio.mp3',
        imageUrl: 'https://example.com/image.jpg',
        duration: 1200,
        createdBy: 'user123',
        createdAt: { toDate: () => new Date() }
      }),
      id: 'test-podcast-id'
    }),
    getDocs: vi.fn().mockResolvedValue({
      docs: [
        {
          id: '1',
          data: () => ({
            title: 'Podcast 1',
            description: 'Description 1',
            createdAt: { toDate: () => new Date() }
          })
        },
        {
          id: '2',
          data: () => ({
            title: 'Podcast 2',
            description: 'Description 2',
            createdAt: { toDate: () => new Date() }
          })
        }
      ]
    }),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    query: vi.fn().mockReturnThis(),
    serverTimestamp: vi.fn().mockReturnValue(new Date())
  },
  storage: {
    ref: vi.fn(),
    uploadBytes: vi.fn(),
    getDownloadURL: vi.fn()
  }
}));

describe('Podcast Service', () => {
  it('should create a podcast', async () => {
    const podcastData = {
      title: 'Test Podcast',
      description: 'This is a test podcast',
      audioUrl: 'https://example.com/audio.mp3',
      imageUrl: 'https://example.com/image.jpg',
      duration: 1200,
      categoryId: 'category1',
      userId: 'user123',
      type: 'audio' as const,
      published: true,
      visibility: 'public' as const
    };
    
    const result = await createPodcast(podcastData);
    
    expect(result).toBe('test-podcast-id');
  });
  
  it('should retrieve podcasts', async () => {
    const podcasts = await getPodcasts();
    
    expect(podcasts).toHaveLength(2);
    expect(podcasts[0].title).toBe('Podcast 1');
    expect(podcasts[1].description).toBe('Description 2');
  });
  
  it('should retrieve a podcast by ID', async () => {
    const podcast = await getPodcast('test-podcast-id');
    
    expect(podcast).toBeDefined();
    expect(podcast?.title).toBe('Test Podcast');
    expect(podcast?.description).toBe('This is a test podcast');
  });
});
