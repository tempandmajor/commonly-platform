
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { getPodcast, getPodcasts, createPodcast, updatePodcast, deletePodcast } from '@/services/podcast/podcastCrudService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'podcast123',
              title: 'Test Podcast',
              description: 'This is a test podcast',
              image_url: 'https://example.com/image.jpg',
              audio_url: 'https://example.com/audio.mp3',
              duration: 300,
              user_id: 'user123',
              created_at: '2023-01-01T00:00:00Z',
              published: true,
              users: {
                display_name: 'Test User',
                photo_url: 'https://example.com/user.jpg'
              }
            },
            error: null
          }),
          order: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue({
              data: [{
                id: 'podcast123',
                title: 'Test Podcast',
                description: 'This is a test podcast',
                image_url: 'https://example.com/image.jpg',
                audio_url: 'https://example.com/audio.mp3',
                duration: 300,
                user_id: 'user123',
                created_at: '2023-01-01T00:00:00Z',
                published: true,
                users: {
                  display_name: 'Test User',
                  photo_url: 'https://example.com/user.jpg'
                }
              }],
              error: null
            })
          }))
        })),
        lt: vi.fn(() => ({
          limit: vi.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })),
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() => ({
                limit: vi.fn().mockResolvedValue({
                  data: [],
                  error: null
                })
              }))
            }))
          }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'newpodcast123'
            },
            error: null
          })
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      })),
      delete: vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      }))
    }),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn(() => ({
          data: {
            publicUrl: 'https://example.com/storage/file.mp3'
          }
        }))
      }))
    }
  }
}));

describe('Podcast Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch a podcast by id', async () => {
    const podcast = await getPodcast('podcast123');
    
    expect(podcast).toBeDefined();
    expect(podcast?.id).toBe('podcast123');
    expect(podcast?.title).toBe('Test Podcast');
    expect(supabase.from).toHaveBeenCalledWith('podcasts');
  });

  it('should fetch podcasts with pagination', async () => {
    const result = await getPodcasts(10);
    
    expect(result.podcasts).toHaveLength(1);
    expect(result.podcasts[0].id).toBe('podcast123');
    expect(supabase.from).toHaveBeenCalledWith('podcasts');
  });

  it('should create a new podcast', async () => {
    const podcastData = {
      title: 'New Podcast',
      description: 'A new podcast description',
      userId: 'user123',
      published: true
    };
    
    const id = await createPodcast(podcastData);
    
    expect(id).toBe('newpodcast123');
    expect(supabase.from).toHaveBeenCalledWith('podcasts');
  });

  it('should update a podcast', async () => {
    await updatePodcast('podcast123', {
      title: 'Updated Title',
      description: 'Updated description'
    });
    
    expect(supabase.from).toHaveBeenCalledWith('podcasts');
    expect(supabase.from().update).toHaveBeenCalled();
  });

  it('should delete a podcast', async () => {
    await deletePodcast('podcast123');
    
    expect(supabase.from).toHaveBeenCalledWith('podcasts');
    expect(supabase.from().delete).toHaveBeenCalled();
  });
});
