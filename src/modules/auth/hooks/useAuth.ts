'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { isAxiosError } from 'axios';
import { authApi } from '../api/authApi';
import { useAuthStore } from '@/store/authStore';
import type { LoginRequest, RegisterRequest } from '../types/auth.types';

// ─── Query Keys ──────────────────────────────────────────────────────────────

export const authKeys = {
  me: ['auth', 'me'] as const,
};

// ─── useAuth ─────────────────────────────────────────────────────────────────

export function useAuth() {
  const { user, isAuthenticated, accessToken, logout: storeLogout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // silently fail — token may already be expired
    } finally {
      storeLogout();
      queryClient.clear();
      router.push('/login');
    }
  }, [storeLogout, queryClient, router]);

  return { user, isAuthenticated, accessToken, logout };
}

// ─── useLogin ────────────────────────────────────────────────────────────────

export function useLogin() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const r = await authApi.login(credentials);
      // Handle TransformInterceptor envelope { data: T, timestamp } if not already unwrapped
      const body = r.data as any;
      return (body && 'timestamp' in body && 'data' in body) ? body.data : body;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken, data.company);
      toast.success(`Welcome back, ${data.user.firstName}!`);
      window.location.href = '/dashboard';
    },
    onError: (error) => {
      // Log full error to console so we can diagnose the real cause
      console.error('[useLogin] error:', error);
      if (isAxiosError(error)) {
        console.error('[useLogin] response status:', error.response?.status);
        console.error('[useLogin] response data:', error.response?.data);
        const status = error.response?.status;
        if (status === 0 || !error.response) {
          toast.error('Cannot reach the server. Check NEXT_PUBLIC_API_URL and that the backend is running.');
          return;
        }
        if (status === 401 || status === 400) {
          toast.error('Invalid email or password.');
          return;
        }
        toast.error(`Server error ${status}. Check the browser console for details.`);
        return;
      }
      // Non-axios error — likely a JS error in onSuccess (e.g. wrong response shape)
      toast.error(`Unexpected error: ${(error as Error).message}. Check the browser console.`);
    },
  });
}

// ─── useRegister ─────────────────────────────────────────────────────────────

export function useRegister() {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: RegisterRequest) => {
      const r = await authApi.register(credentials);
      const body = r.data as any;
      return (body && 'timestamp' in body && 'data' in body) ? body.data : body;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.tokens.accessToken, data.tokens.refreshToken, data.company);
      toast.success('Account created successfully!');
      window.location.href = '/dashboard';
    },
    onError: () => {
      toast.error('Could not create account. Please try again.');
    },
  });
}

// ─── useCurrentUser ───────────────────────────────────────────────────────────

export function useCurrentUser() {
  const { isAuthenticated, setUser } = useAuthStore();

  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authApi.getMe().then((r) => r.data),
    enabled: isAuthenticated,
    onSuccess: (user: import('@/types').User) => setUser(user),
  } as Parameters<typeof useQuery>[0]);
}
