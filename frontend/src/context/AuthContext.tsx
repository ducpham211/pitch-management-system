import React, { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const hasHydratedRef = useRef(false);

  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    const hydrateUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
          const res = await axios.get(`${API_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const fetchedUser = {
            id: res.data.id,
            email: res.data.email,
            fullName: res.data.fullName,
            role: res.data.role || 'PLAYER',
          };
          setUser(fetchedUser);
          localStorage.setItem('userData', JSON.stringify(fetchedUser));
        } catch (error) {
          // Fallback to offline parsing if API fails
          try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
            setUser({
              id: decoded.id || decoded.sub || '',
              email: decoded.email || '',
              fullName: decoded.fullName || '',
              role: decoded.role || decoded.roles?.[0] || 'PLAYER',
            });
          } catch (e) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('userData');
            setUser(null);
          }
        }
      }
      setIsLoading(false);
    };
    
    hydrateUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userData', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...userData };
      localStorage.setItem('userData', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
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