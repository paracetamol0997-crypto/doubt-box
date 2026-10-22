import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api } from '../services/api';
import { wsClient } from '../services/websocket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isApprovedTeacher: boolean;
  loginStudent: (email: string, password: string) => Promise<User>;
  loginTeacher: (email: string, password: string) => Promise<{ user: User; is_approved: boolean; approval_note?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('doubtbox_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isApprovedTeacher, setIsApprovedTeacher] = useState<boolean>(false);

  const refreshUser = useCallback(async () => {
    const savedToken = localStorage.getItem('doubtbox_token');
    if (!savedToken) {
      setUser(null);
      setIsApprovedTeacher(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getCurrentUser();
      setUser(response.user);
      setIsApprovedTeacher(response.is_approved);
      wsClient.connect();
    } catch (err) {
      console.error('Failed to restore session:', err);
      api.clearToken();
      setToken(null);
      setUser(null);
      setIsApprovedTeacher(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
    return () => {
      wsClient.disconnect();
    };
  }, [refreshUser]);

  const loginStudent = async (email: string, password: string) => {
    const res = await api.loginStudent({ email, password });
    api.setToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setIsApprovedTeacher(false);
    wsClient.connect();
    return res.user;
  };

  const loginTeacher = async (email: string, password: string) => {
    const res = await api.loginTeacher({ email, password });
    api.setToken(res.token);
    setToken(res.token);
    setUser(res.user);
    setIsApprovedTeacher(res.is_approved);
    wsClient.connect();
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      api.clearToken();
      setToken(null);
      setUser(null);
      setIsApprovedTeacher(false);
      wsClient.disconnect();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isApprovedTeacher,
        loginStudent,
        loginTeacher,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
