
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { LoggedInUser, DocumentDepartment } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: LoggedInUser | null;
  login: (userData: LoggedInUser) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const localStorageUserKey = "docflow-logged-in-user";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoggedInUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(localStorageUserKey);
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem(localStorageUserKey); // Clear corrupted data
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((userData: LoggedInUser) => {
    localStorage.setItem(localStorageUserKey, JSON.stringify(userData));
    setUser(userData);
    router.push('/'); // Redirect to home after login
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(localStorageUserKey);
    setUser(null);
    router.push('/login'); // Redirect to login after logout
  }, [router]);

  // Route protection
  useEffect(() => {
    if (!isLoading) {
      const isAuthPage = pathname === '/login';
      if (!user && !isAuthPage) {
        router.push('/login');
      } else if (user && isAuthPage) {
        router.push('/');
      }
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
