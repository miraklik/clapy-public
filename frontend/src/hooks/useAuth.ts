'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  id: string;
  email: string;
  isVerified: boolean;
};

export function useAuth() {
  const [user, _setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
  try {
    const res = await fetch('/api/user/me', {
      method: 'GET',
      credentials: 'include',
    });

    if (res.ok) {
      const data = await res.json();
      _setUser({
        id: data.id,
        email: data.email,
        isVerified: data.is_verified,
      });
    } else {
      _setUser(null);
    }
  } catch (err) {
    console.error('Failed to fetch user:', err);
    _setUser(null);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    setLoading(true);
    await fetchUser();
  };

  const logout = async () => {
    await fetch('/logout', { method: 'POST', credentials: 'include' });
    _setUser(null);
    router.push('/login');
  };

  const setUser = (user: User | null) => {
    _setUser(user);
    setLoading(false);
  };

  return { user, loading, refreshUser, logout, setUser };
}