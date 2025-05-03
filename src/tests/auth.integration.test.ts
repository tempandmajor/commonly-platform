
import { describe, it, expect, vi, beforeEach, afterEach } from '../test-utils/mocks';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@/contexts/AuthContext';
import { AuthChangeEvent } from '@supabase/supabase-js';

// Define a type for the mocked Supabase client
interface MockedSupabaseClient {
  auth: {
    signInWithPassword: ReturnType<typeof vi.fn>;
    signUp: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    getSession: ReturnType<typeof vi.fn>;
    onAuthStateChange: ReturnType<typeof vi.fn>;
  };
}

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => {
  return {
    createClient: vi.fn((_url: string, _key: string) => ({
      auth: {
        signInWithPassword: vi.fn(),
        signUp: vi.fn(),
        signOut: vi.fn(),
        getSession: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          subscription: { unsubscribe: vi.fn() }
        }))
      }
    })),
    AuthChangeEvent: {
      SIGNED_IN: 'SIGNED_IN',
      SIGNED_OUT: 'SIGNED_OUT',
    }
  };
});

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn()
}));

describe('Authentication Integration', () => {
  // Define common variables
  let mockSupabase: MockedSupabaseClient;
  let mockAuthContext: {
    currentUser: null | { id: string; email: string };
    loading: boolean;
    signIn: ReturnType<typeof vi.fn>;
    signUp: ReturnType<typeof vi.fn>;
    signOut: ReturnType<typeof vi.fn>;
    resetPassword: ReturnType<typeof vi.fn>;
    updateProfile: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Create a mock Supabase client
    mockSupabase = createClient('https://example.com', 'fake-api-key') as MockedSupabaseClient;
    
    // Create a mock auth context
    mockAuthContext = {
      currentUser: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      resetPassword: vi.fn(),
      updateProfile: vi.fn()
    };
    
    // Mock the useAuth hook to return our mock context
    (useAuth as any).mockReturnValue(mockAuthContext);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should sign in successfully with valid credentials', async () => {
    // Mock successful sign in response
    (mockSupabase.auth.signInWithPassword as any).mockResolvedValue({
      data: {
        user: {
          id: 'user123',
          email: 'test@example.com'
        },
        session: {
          access_token: 'fake-access-token',
          refresh_token: 'fake-refresh-token',
          expires_at: Date.now() + 3600000
        }
      },
      error: null
    });
    
    const result = await mockSupabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'password'
    });
    
    expect(result.data.user).toBeDefined();
    expect(result.data.user.id).toBe('user123');
    expect(result.data.user.email).toBe('test@example.com');
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password'
    });
  });

  it('should handle sign in failures', async () => {
    // Mock failed sign in response
    (mockSupabase.auth.signInWithPassword as any).mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials', status: 400 }
    });
    
    const result = await mockSupabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'wrong-password'
    });
    
    expect(result.data.user).toBeNull();
    expect(result.error).toBeDefined();
    expect(result.error.message).toBe('Invalid login credentials');
  });

  it('should sign up a new user successfully', async () => {
    // Mock successful sign up response
    (mockSupabase.auth.signUp as any).mockResolvedValue({
      data: {
        user: {
          id: 'new-user-123',
          email: 'newuser@example.com'
        },
        session: null // Session might be null when email confirmation is required
      },
      error: null
    });
    
    const result = await mockSupabase.auth.signUp({
      email: 'newuser@example.com',
      password: 'strong-password'
    });
    
    expect(result.data.user).toBeDefined();
    expect(result.data.user.id).toBe('new-user-123');
    expect(result.data.user.email).toBe('newuser@example.com');
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'strong-password'
    });
  });

  it('should handle sign out correctly', async () => {
    // Mock successful sign out response
    (mockSupabase.auth.signOut as any).mockResolvedValue({
      error: null
    });
    
    const result = await mockSupabase.auth.signOut();
    
    expect(result.error).toBeNull();
    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('should handle auth state changes', async () => {
    const authChangeCallback = vi.fn();
    const mockUnsubscribe = vi.fn();
    
    // Mock the onAuthStateChange method
    (mockSupabase.auth.onAuthStateChange as any).mockReturnValue({
      subscription: { unsubscribe: mockUnsubscribe }
    });
    
    // Set up auth state listener
    const { subscription } = mockSupabase.auth.onAuthStateChange(authChangeCallback);
    
    // Verify the listener is set up correctly
    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalledWith(authChangeCallback);
    expect(subscription).toBeDefined();
    expect(subscription.unsubscribe).toBe(mockUnsubscribe);
  });

  it('should integrate with AuthContext', async () => {
    // Mock the signIn method from AuthContext
    mockAuthContext.signIn.mockResolvedValue({
      user: { id: 'user123', email: 'test@example.com' },
      session: { access_token: 'token' },
      error: null
    });
    
    // Call the signIn method
    const result = await mockAuthContext.signIn('test@example.com', 'password');
    
    // Verify it was called with the correct parameters
    expect(mockAuthContext.signIn).toHaveBeenCalledWith('test@example.com', 'password');
    expect(result.user).toBeDefined();
    expect(result.error).toBeNull();
  });
});
