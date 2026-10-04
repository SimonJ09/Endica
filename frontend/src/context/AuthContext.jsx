import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [chargement, setChargement] = useState(true);

  // Configurer axios avec le token à chaque changement
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Vérifier le token au démarrage
  useEffect(() => {
    if (!token) {
      setChargement(false);
      return;
    }

    api.get('/auth/me')
      .then((res) => setAdmin(res.data.admin))
      .catch(() => {
        // Token invalide/expiré → on nettoie
        localStorage.removeItem('admin_token');
        setToken(null);
        setAdmin(null);
      })
      .finally(() => setChargement(false));
  }, [token]);

  const login = async (email, motDePasse) => {
    const res = await api.post('/auth/login', { email, motDePasse });
    localStorage.setItem('admin_token', res.data.token);
    setToken(res.data.token);
    setAdmin(res.data.admin);
    return res.data.admin;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, token, chargement, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}