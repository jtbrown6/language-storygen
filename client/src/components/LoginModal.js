import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

const LoginModal = () => {
  const { login } = useAuth();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const passwordInputRef = useRef(null);

  // Auto-focus password input when modal opens
  useEffect(() => {
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(password);
      // Success - context will handle state updates
    } catch (err) {
      setError(err.message);
      setPassword(''); // Clear password on error
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError(''); // Clear error when user starts typing
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal">
        <div className="login-header">
          <div className="login-icon">
            <FaLock />
          </div>
          <h1>Language Story Generator</h1>
          <p>Please enter the password to access the application</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="password-input-container">
            <input
              ref={passwordInputRef}
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter password"
              className={`password-input ${error ? 'error' : ''}`}
              disabled={loading}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading || !password.trim()}
          >
            {loading ? (
              <>
                <FaSpinner className="fa-spin" />
                Verifying...
              </>
            ) : (
              'Access Application'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Secure access to protect API resources</p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
