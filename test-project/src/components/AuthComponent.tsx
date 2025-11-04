import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Authentication component that handles user login/logout
 * Provides authentication context for the entire application
 */
export const AuthComponent: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  /**
   * Initialize authentication state on component mount
   * Checks for existing session in localStorage
   */
  useEffect(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      validateToken(savedToken);
    }
  }, []);

  /**
   * Validate existing JWT token with backend
   * @param token JWT token to validate
   */
  const validateToken = async (token: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));

      const response = await axios.post('/api/auth/validate', { token });

      if (response.data.valid) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: true,
          loading: false,
          error: null
        });
      } else {
        localStorage.removeItem('authToken');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('authToken');
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'Session expired. Please login again.'
      }));
    }
  };

  /**
   * Handle user login with email and password
   * Authenticates with backend and stores JWT token
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setAuthState(prev => ({
        ...prev,
        error: 'Please enter both email and password'
      }));
      return;
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const response = await axios.post('/api/auth/login', {
        email,
        password
      });

      const { user, token } = response.data;

      // Store JWT token
      localStorage.setItem('authToken', token);

      setAuthState({
        user,
        isAuthenticated: true,
        loading: false,
        error: null
      });

      // Reset form
      setEmail('');
      setPassword('');

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  };

  /**
   * Handle user logout
   * Clears local storage and authentication state
   */
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  };

  if (authState.loading) {
    return <div>Loading...</div>;
  }

  if (authState.isAuthenticated && authState.user) {
    return (
      <div className="auth-component">
        <h2>Welcome, {authState.user.name}!</h2>
        <p>Email: {authState.user.email}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="auth-component">
      <h2>Login</h2>
      {authState.error && (
        <div className="error-message">{authState.error}</div>
      )}

      <form onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={authState.loading}>
          {authState.loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};
