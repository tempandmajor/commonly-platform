
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/services/notificationService';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            then: vi.fn(() => Promise.resolve({
              data: [
                {
                  id: '123',
                  title: 'Test Notification',
                  body: 'This is a test notification',
                  type: 'system',
                  read: false,
                  created_at: '2023-01-01T00:00:00Z'
                }
              ],
              error: null
            }))
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            then: vi.fn(() => Promise.resolve({ error: null }))
          }))
        }))
      }))
    })
  }
}));

describe('Notification Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch notifications for a user', async () => {
    const notifications = await fetchNotifications('user123');
    
    expect(notifications).toHaveLength(1);
    expect(notifications[0].id).toBe('123');
    expect(notifications[0].title).toBe('Test Notification');
    expect(supabase.from).toHaveBeenCalledWith('notifications');
  });

  it('should mark notification as read', async () => {
    await markNotificationAsRead('123', 'user123');
    
    expect(supabase.from).toHaveBeenCalledWith('notifications');
    expect(supabase.from().update).toHaveBeenCalledWith({ read: true });
  });

  it('should mark all notifications as read', async () => {
    await markAllNotificationsAsRead('user123');
    
    expect(supabase.from).toHaveBeenCalledWith('notifications');
    expect(supabase.from().update).toHaveBeenCalledWith({ read: true });
  });
});
