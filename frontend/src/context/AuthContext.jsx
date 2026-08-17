// frontend/src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

  // Auto-login if token exists
  useEffect(() => {
    if (token) {
      api.get('auth/me/')
        .then((res) => {
          setUser(res.data);
          setLoading(false);
        })
        .catch(() => {
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

 
  const login = async (username, password) => {
    // Step 1: Get tokens
    const loginRes = await api.post('auth/login/', { username, password });
    const { access } = loginRes.data;
    
    // Step 2: Store token
    localStorage.setItem('accessToken', access);
    setToken(access);

    // Step 3: Fetch user data (role, etc.)
    const meRes = await api.get('auth/me/', {
      headers: { Authorization: `Bearer ${access}` }
    });
    
    setUser(meRes.data);
    return meRes.data; // Return user so LoginPage can read role
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);