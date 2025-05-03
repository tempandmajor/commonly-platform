
import { describe, it, expect, vi } from '../test-utils/mocks';
import { createNotification, getNotifications } from '@/services/notificationService';

// Mock Firebase services
vi.mock('@/lib/firebase', () => ({
  db: {
    collection: vi.fn().mockReturnThis(),
    doc: vi.fn().mockReturnThis(),
    addDoc: vi.fn().mockResolvedValue({ id: 'test-notification-id' }),
    getDocs: vi.fn().mockResolvedValue({
      docs: [
        {
          id: '1',
          data: () => ({
            type: 'message',
            title: 'New Message',
            body: 'You have a new message',
            createdAt: { toDate: () => new Date() },
            read: false
          })
        }
      ]
    }),
    orderBy: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    query: vi.fn().mockReturnThis(),
    serverTimestamp: vi.fn().mockReturnValue(new Date())
  }
}));

describe('Notification Service', () => {
  it('should create a notification', async () => {
    const result = await createNotification(
      'user123',
      'message',
      'New Message',
      'You have a new message',
      'image-url', // Pass a string instead of object
      'action-url',
      { chatId: 'chat123' } // Pass data object correctly
    );
    
    expect(result).toBe('test-notification-id');
  });
  
  it('should retrieve user notifications', async () => {
    const notifications = await getNotifications('user123');
    
    expect(notifications).toHaveLength(1);
    expect(notifications[0].type).toBe('message');
    expect(notifications[0].title).toBe('New Message');
  });
});
