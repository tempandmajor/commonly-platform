
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getPodcast, getPodcasts, incrementListenCount } from '@/services/podcastService';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              single: vi.fn(() => Promise.resolve({
                data: {
                  id: '123',
                  title: 'Test Podcast',
                  description: 'Test Description',
                  image_url: 'test.jpg',
                  audio_url: 'test.mp3',
                  duration: 300,
                  created_at: '2023-01-01',
                  user_id: 'user123',
                  users: {
                    display_name: 'Test User',
                    photo_url: 'user.jpg'
                  },
                  like_count: 10,
                  view_count: 100,
                  share_count: 5,
                  published: true,
                  type: 'audio',
                  visibility: 'public',
                  listens: 50,
                  tags: ['test', 'podcast']
                },
                error: null
              })),
              then: vi.fn(() => Promise.resolve({
                data: [{
                  id: '123',
                  title: 'Test Podcast',
                  description: 'Test Description',
                  image_url: 'test.jpg',
                  audio_url: 'test.mp3',
                  duration: 300,
                  created_at: '2023-01-01',
                  user_id: 'user123',
                  users: {
                    display_name: 'Test User',
                    photo_url: 'user.jpg'
                  },
                  like_count: 10,
                  view_count: 100,
                  share_count: 5,
                  published: true,
                  type: 'audio',
                  visibility: 'public',
                  listens: 50,
                  tags: ['test', 'podcast']
                }],
                error: null
              }))
            }))
          }))
        })),
        order: vi.fn(() => ({
          eq: vi.fn(() => ({
            limit: vi.fn(() => ({
              then: vi.fn(() => Promise.resolve({
                data: [{
                  id: '123',
                  title: 'Test Podcast'
                }],
                error: null
              }))
            }))
          }))
        })),
        or: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        in: vi.fn().mockReturnThis(),
      }))
    }),
    rpc: vi.fn(() => Promise.resolve({ error: null })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: { path: 'test-path' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com/test.mp3' } })),
        remove: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }
  }
}));

describe('Podcast Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch a podcast by ID', async () => {
    const podcast = await getPodcast('123');
    
    expect(podcast).toBeDefined();
    expect(podcast?.id).toBe('123');
    expect(podcast?.title).toBe('Test Podcast');
    expect(supabase.from).toHaveBeenCalledWith('podcasts');
  });

  it('should fetch a list of podcasts', async () => {
    const result = await getPodcasts(10);
    
    expect(result.podcasts).toHaveLength(1);
    expect(result.podcasts[0].id).toBe('123');
    expect(supabase.from).toHaveBeenCalledWith('podcasts');
  });

  it('should increment podcast listen count', async () => {
    await incrementListenCount('123');
    
    expect(supabase.rpc).toHaveBeenCalledWith('increment_podcast_listens', { podcast_id_param: '123' });
  });
});
