import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearCustomerToken,
  fetchCustomerProfile,
  getCustomerToken,
  loginCustomerAccount,
  registerCustomerAccount,
  setCustomerToken,
} from '../api/customerAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [customer, setCustomer] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const stored = getCustomerToken();
      if (!stored) {
        if (!cancelled) {
          setToken('');
          setCustomer(null);
          setReady(true);
        }
        return;
      }

      try {
        const profile = await fetchCustomerProfile(stored);
        if (cancelled) return;
        setToken(stored);
        setCustomer(profile);
      } catch {
        if (cancelled) return;
        clearCustomerToken();
        setToken('');
        setCustomer(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const applyAuth = useCallback((result) => {
    const nextToken = result?.token || '';
    const nextCustomer = result?.customer || null;
    setCustomerToken(nextToken);
    setToken(nextToken);
    setCustomer(nextCustomer);
    return nextCustomer;
  }, []);

  const register = useCallback(
    async ({ email, password, firstName, lastName }) => {
      const result = await registerCustomerAccount({
        email,
        password,
        firstName,
        lastName,
      });
      return applyAuth(result);
    },
    [applyAuth],
  );

  const login = useCallback(
    async ({ email, password }) => {
      const result = await loginCustomerAccount({ email, password });
      return applyAuth(result);
    },
    [applyAuth],
  );

  const logout = useCallback(() => {
    clearCustomerToken();
    setToken('');
    setCustomer(null);
  }, []);

  const value = useMemo(
    () => ({
      ready,
      token,
      customer,
      isLoggedIn: Boolean(token && customer),
      register,
      login,
      logout,
    }),
    [ready, token, customer, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
