
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth, AuthProvider } from '@/contexts/AuthContext';
import React, { ReactNode } from 'react';

// Mock Supabase Auth
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ 
        data: { session: { user: { id: 'test-user', email: 'test@example.com' } } },
        error: null 
      })),
      signInWithPassword: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user', email: 'test@example.com' } },
        error: null 
      })),
      signUp: vi.fn(() => Promise.resolve({ 
        data: { user: { id: 'test-user', email: 'test@example.com' } },
        error: null 
      })),
      signOut: vi.fn(() => Promise.resolve({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { display_name: 'Test User', photo_url: 'test.jpg' },
            error: null
          }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ error: null }))
      })),
      insert: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ error: null }))
      }))
    }))
  }
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('Auth Integration', () => {
  it('should handle user login', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      result.current.login('test@example.com', 'password');
      await waitForNextUpdate();
    });
    
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({ 
      email: 'test@example.com', 
      password: 'password' 
    });
    expect(result.current.currentUser).toBeDefined();
    expect(result.current.currentUser?.email).toBe('test@example.com');
  });
  
  it('should handle user signup', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      result.current.signup('test@example.com', 'password', 'Test User');
      await waitForNextUpdate();
    });
    
    expect(supabase.auth.signUp).toHaveBeenCalled();
    expect(supabase.from).toHaveBeenCalledWith('users');
  });
  
  it('should handle user logout', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      result.current.logout();
      await waitForNextUpdate();
    });
    
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(result.current.currentUser).toBeNull();
  });
});
