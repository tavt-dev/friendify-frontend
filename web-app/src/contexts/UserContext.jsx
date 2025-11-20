import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getMyInfo } from '../services/userService';
import { isAuthenticated, logOut } from '../services/identityService';
import { getToken, TOKEN_CHANGED_EVENT } from '../services/localStorageService';

const UserContext = createContext(null);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    if (!isAuthenticated()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getMyInfo();
      if (response.data?.result) {
        setUser(response.data.result);
      } else {
        console.warn('User data format unexpected:', response.data);
        setUser(null);
      }
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError(err);
      if (err?.response?.status === 401) {
        logOut();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = (userData) => {
    setUser(userData);
  };

  const clearUser = () => {
    setUser(null);
    setError(null);
  };

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Listen for token changes (e.g., after login)
  useEffect(() => {
    const handleTokenChange = (event) => {
      const token = event.detail?.token || getToken();
      if (token && !user) {
        // Token exists but user not loaded, reload user
        loadUser();
      } else if (!token && user) {
        // Token removed but user still exists, clear user
        setUser(null);
        setLoading(false);
      }
    };

    // Listen to custom token change event
    window.addEventListener(TOKEN_CHANGED_EVENT, handleTokenChange);

    // Also listen to storage events (for cross-tab sync)
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        const token = getToken();
        if (token && !user) {
          loadUser();
        } else if (!token && user) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(TOKEN_CHANGED_EVENT, handleTokenChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, loadUser]);

  const value = {
    user,
    loading,
    error,
    loadUser,
    updateUser,
    clearUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

