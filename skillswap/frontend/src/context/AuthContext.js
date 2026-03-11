import React, { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('skillswap_token'));

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('skillswap_token');
      if (savedToken) {
        try {
          const { data } = await getMe();
          setUser(data.user);
        } catch {
          localStorage.removeItem('skillswap_token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginUser = (userData, userToken) => {
    localStorage.setItem('skillswap_token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('skillswap_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedUser) => setUser((prev) => ({ ...prev, ...updatedUser }));

  return (
    <AuthContext.Provider value={{ user, token, loading, loginUser, logoutUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
