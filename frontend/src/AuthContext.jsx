import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore user session from localStorage
    const storedUser = localStorage.getItem('aiocc_user');
    const storedToken = localStorage.getItem('aiocc_token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('aiocc_user');
        localStorage.removeItem('aiocc_token');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('aiocc_user', JSON.stringify(userData));
    localStorage.setItem('aiocc_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('aiocc_user');
    localStorage.removeItem('aiocc_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: user?.role, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
