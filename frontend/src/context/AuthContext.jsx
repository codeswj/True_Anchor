import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api/services';

const AuthContext = createContext(null);

const normalizeUser = (userData) => {
  if (!userData) return null;
  const fullName = userData.fullName ?? userData.full_name;
  const memberNumber = userData.memberNumber ?? userData.member_number;
  const idNumber = userData.idNumber ?? userData.id_number;
  const accountId = userData.accountId ?? userData.account_id;
  const accountNumber = userData.accountNumber ?? userData.account_number;
  const createdAt = userData.createdAt ?? userData.created_at;

  return {
    ...userData,
    fullName,
    full_name: fullName,
    memberNumber,
    member_number: memberNumber,
    idNumber,
    id_number: idNumber,
    accountId,
    account_id: accountId,
    accountNumber,
    account_number: accountNumber,
    createdAt,
    created_at: createdAt,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return normalizeUser(JSON.parse(localStorage.getItem('user'))); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then((res) => {
          const normalized = normalizeUser(res.data.data);
          localStorage.setItem('user', JSON.stringify(normalized));
          setUser(normalized);
        })
        .catch(() => { localStorage.removeItem('token'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = (token, userData) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  };

  const updateUser = (userData) => {
    const normalized = normalizeUser(userData);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, logoutUser, setUser: updateUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
