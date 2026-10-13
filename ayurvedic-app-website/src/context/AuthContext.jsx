import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, adminApi, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(
    () => typeof window !== 'undefined' && !!sessionStorage.getItem('super_admin_restore_token')
  );

  // Initialize auth state from stored token
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authApi.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          setAuthToken(null);
        }
      } catch (err) {
        console.warn('Session restoration failed:', err.message);
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Listen for 401 session expiration from apiFetch
  useEffect(() => {
    const handleAuthExpired = (e) => {
      console.warn('Authentication expired:', e.detail?.message);
      logout();
    };
    window.addEventListener('ayurveda:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('ayurveda:auth-expired', handleAuthExpired);
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const registerPatient = async (data) => {
    const res = await authApi.registerPatient(data);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const registerDoctor = async (data) => {
    const res = await authApi.registerDoctor(data);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const registerFarmer = async (data) => {
    const res = await authApi.registerFarmer(data);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    sessionStorage.removeItem('super_admin_restore_token');
    sessionStorage.removeItem('impersonated_target_name');
    sessionStorage.removeItem('impersonated_target_role');
    setIsImpersonating(false);
    setAuthToken(null);
    setUser(null);
  };

  const startImpersonation = async (targetUserId) => {
    const currentAdminToken = getAuthToken();
    const res = await adminApi.impersonateUser(targetUserId);
    if (res.success && res.token) {
      sessionStorage.setItem('super_admin_restore_token', currentAdminToken);
      sessionStorage.setItem('impersonated_target_name', res.user.name);
      sessionStorage.setItem('impersonated_target_role', res.user.role);
      setAuthToken(res.token);
      setUser(res.user);
      setIsImpersonating(true);
      return res.user;
    }
    throw new Error(res.message || 'Impersonation failed');
  };

  const exitImpersonation = async () => {
    const adminToken = sessionStorage.getItem('super_admin_restore_token');
    if (!adminToken) return '/admin';
    setAuthToken(adminToken);
    sessionStorage.removeItem('super_admin_restore_token');
    sessionStorage.removeItem('impersonated_target_name');
    sessionStorage.removeItem('impersonated_target_role');
    setIsImpersonating(false);
    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (e) {
      console.warn('Restore admin user note:', e);
    }
    return '/admin';
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (e) {
      console.error('Refresh user error:', e);
    }
  };

  const value = {
    user,
    role: user?.role || null,
    status: user?.status || null,
    isAuthenticated: !!user,
    loading,
    isImpersonating,
    impersonatedName: typeof window !== 'undefined' ? sessionStorage.getItem('impersonated_target_name') : null,
    login,
    registerPatient,
    // NOTE: Farmer and Seller are the exact same entity in this codebase (farmer hi seller hai).
    registerFarmer,
    registerSeller: registerFarmer,
    logout,
    refreshUser,
    startImpersonation,
    exitImpersonation
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
