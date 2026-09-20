import { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await client.get('/me');
          if (res.data.success) {
            setUser(res.data.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.data.user));
          }
        } catch (err) {
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await client.post('/login', { email, password });
    if (res.data.success) {
      const { user, token } = res.data.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return res.data;
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    const res = await client.post('/register', {
      name,
      email,
      password,
      password_confirmation,
    });
    if (res.data.success) {
      const { user, token } = res.data.data;
      setUser(user);
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return res.data;
    }
  };

  const logout = async () => {
    try {
      if (token) await client.post('/logout');
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
