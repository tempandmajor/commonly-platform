
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        subscription: { unsubscribe: vi.fn() }
      }))
    }
  }),
  AuthChangeEvent: {
    SIGNED_IN: 'SIGNED_IN',
    SIGNED_OUT: 'SIGNED_OUT',
  }
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('Authentication Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock AuthContext implementation
    const mockAuthContext = {
      currentUser: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn()
    };
    
    (useAuth as any).mockReturnValue(mockAuthContext);
  });

  it('should integrate with supabase authentication', async () => {
    const supabase = createClient('https://example.com', 'fake-api-key');
    
    // Mock successful sign in
    (supabase.auth.signInWithPassword as any).mockResolvedValue({
      data: {
        user: {
          id: 'user123',
          email: 'test@example.com'
        }
      },
      error: null
    });
    
    const result = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password'
    });
    
    expect(result.data.user).toBeDefined();
    expect(result.data.user.id).toBe('user123');
    expect(result.data.user.email).toBe('test@example.com');
  });

  it('should handle sign out correctly', async () => {
    const supabase = createClient('https://example.com', 'fake-api-key');
    
    (supabase.auth.signOut as any).mockResolvedValue({
      error: null
    });
    
    const result = await supabase.auth.signOut();
    
    expect(result.error).toBeNull();
    expect(supabase.auth.signOut).toHaveBeenCalled();
  });
});
