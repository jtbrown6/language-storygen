// Authentication utilities for simple password protection

const SESSION_KEY = 'language_storygen_session';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

/**
 * Simple hash function for basic obfuscation
 * @param {string} str - String to hash
 * @returns {string} Hashed string
 */
const simpleHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Get the configured password from environment variables
 * @returns {string} The configured password
 */
export const getConfiguredPassword = () => {
  return process.env.REACT_APP_PASSWORD || 'demo123';
};

/**
 * Validate the provided password against the configured password
 * @param {string} password - Password to validate
 * @returns {boolean} True if password is correct
 */
export const validatePassword = (password) => {
  const configuredPassword = getConfiguredPassword();
  return password === configuredPassword;
};

/**
 * Create a session token
 * @returns {string} Session token
 */
const createSessionToken = () => {
  const timestamp = Date.now();
  const randomValue = Math.random().toString(36);
  const tokenData = `${timestamp}_${randomValue}`;
  return simpleHash(tokenData);
};

/**
 * Store authentication session
 * @returns {void}
 */
export const storeAuthSession = () => {
  const sessionData = {
    token: createSessionToken(),
    timestamp: Date.now(),
    expires: Date.now() + SESSION_DURATION
  };
  
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  } catch (error) {
    console.error('Failed to store auth session:', error);
  }
};

/**
 * Check if there's a valid authentication session
 * @returns {boolean} True if session is valid
 */
export const isAuthenticated = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return false;
    
    const session = JSON.parse(sessionData);
    const now = Date.now();
    
    // Check if session has expired
    if (now > session.expires) {
      clearAuthSession();
      return false;
    }
    
    // Session is valid
    return true;
  } catch (error) {
    console.error('Failed to check auth session:', error);
    clearAuthSession();
    return false;
  }
};

/**
 * Clear the authentication session
 * @returns {void}
 */
export const clearAuthSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Failed to clear auth session:', error);
  }
};

/**
 * Get session info for debugging
 * @returns {Object|null} Session information
 */
export const getSessionInfo = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData);
    return {
      hasSession: true,
      expires: new Date(session.expires).toLocaleString(),
      isValid: Date.now() < session.expires
    };
  } catch (error) {
    return null;
  }
};

/**
 * Rate limiting for login attempts
 */
const RATE_LIMIT_KEY = 'language_storygen_attempts';
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Check if rate limit is exceeded
 * @returns {boolean} True if rate limited
 */
export const isRateLimited = () => {
  try {
    const attemptsData = localStorage.getItem(RATE_LIMIT_KEY);
    if (!attemptsData) return false;
    
    const attempts = JSON.parse(attemptsData);
    const now = Date.now();
    
    // Clear old attempts
    const recentAttempts = attempts.filter(timestamp => 
      now - timestamp < RATE_LIMIT_DURATION
    );
    
    // Update stored attempts
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recentAttempts));
    
    return recentAttempts.length >= MAX_ATTEMPTS;
  } catch (error) {
    return false;
  }
};

/**
 * Record a failed login attempt
 * @returns {void}
 */
export const recordFailedAttempt = () => {
  try {
    const attemptsData = localStorage.getItem(RATE_LIMIT_KEY);
    const attempts = attemptsData ? JSON.parse(attemptsData) : [];
    
    attempts.push(Date.now());
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(attempts));
  } catch (error) {
    console.error('Failed to record attempt:', error);
  }
};

/**
 * Get remaining rate limit time
 * @returns {number} Seconds until rate limit expires
 */
export const getRateLimitTimeRemaining = () => {
  try {
    const attemptsData = localStorage.getItem(RATE_LIMIT_KEY);
    if (!attemptsData) return 0;
    
    const attempts = JSON.parse(attemptsData);
    if (attempts.length === 0) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const timeRemaining = RATE_LIMIT_DURATION - (Date.now() - oldestAttempt);
    
    return Math.max(0, Math.ceil(timeRemaining / 1000));
  } catch (error) {
    return 0;
  }
};
