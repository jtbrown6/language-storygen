import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  isAuthenticated, 
  storeAuthSession, 
  clearAuthSession,
  validatePassword,
  isRateLimited,
  recordFailedAttempt,
  getRateLimitTimeRemaining
} from '../utils/authUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      setShowLogin(!isAuth);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (password) => {
    // Check rate limiting
    if (isRateLimited()) {
      const timeRemaining = getRateLimitTimeRemaining();
      throw new Error(`Too many attempts. Please wait ${Math.ceil(timeRemaining / 60)} minutes.`);
    }

    // Validate password
    if (!validatePassword(password)) {
      recordFailedAttempt();
      throw new Error('Invalid password. Please try again.');
    }

    // Store session and update state
    storeAuthSession();
    setAuthenticated(true);
    setShowLogin(false);
    
    return true;
  };

  const logout = () => {
    clearAuthSession();
    setAuthenticated(false);
    setShowLogin(true);
  };

  const value = {
    authenticated,
    loading,
    showLogin,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
