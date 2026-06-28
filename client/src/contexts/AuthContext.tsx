import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  role?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const mockAdminUser: User = {
    id: 'mock-admin-id',
    username: 'pratikadmin',
    email: 'pratikshah2056@gmail.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    isVerified: true
  };

  const [user, setUser] = useState<User | null>(mockAdminUser);
  const [token, setToken] = useState<string | null>('mock-bypass-token');
  const [isLoading, setIsLoading] = useState(false);

  // Load auth state from localStorage on mount (disabled for bypass)
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    // Keep logged in as mock admin on logout
    setToken('mock-bypass-token');
    setUser(mockAdminUser);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('umd_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
