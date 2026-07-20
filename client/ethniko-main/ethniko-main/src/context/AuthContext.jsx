import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../firebase/firebase';
import api from '../api/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if we are running with placeholder Firebase Auth credentials locally
  const isMockAuth = !import.meta.env.VITE_FIREBASE_API_KEY || 
                     import.meta.env.VITE_FIREBASE_API_KEY.includes('placeholder') || 
                     import.meta.env.VITE_FIREBASE_API_KEY === 'mock-api-key-placeholder';

  // Sync profile details from backend using active ID Token credentials
  const syncProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response && response.success) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Sync Profile error:', err.message);
      setUser(null);
    }
  };

  useEffect(() => {
    if (isMockAuth) {
      // Offline Local Mock-Token Session Sync
      const syncMockSession = async () => {
        setLoading(true);
        const storedToken = localStorage.getItem('etniko_firebase_id_token');
        if (storedToken) {
          await syncProfile();
        } else {
          setUser(null);
        }
        setLoading(false);
      };
      syncMockSession();
      
      const handleSessionExpired = () => {
        setUser(null);
        localStorage.removeItem('etniko_firebase_id_token');
        toast.error('Session expired. Please log in again.');
      };

      window.addEventListener('auth_session_expired', handleSessionExpired);
      return () => {
        window.removeEventListener('auth_session_expired', handleSessionExpired);
      };
    } else {
      // 1. Subscribe to Firebase Auth state transitions
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setLoading(true);
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            localStorage.setItem('etniko_firebase_id_token', idToken);
            await syncProfile();
          } catch (err) {
            console.error('Auth state initialization failed:', err);
            setUser(null);
          }
        } else {
          setUser(null);
          localStorage.removeItem('etniko_firebase_id_token');
        }
        setLoading(false);
      });

      // 2. Listen to Axios 401 token decay events
      const handleSessionExpired = () => {
        setUser(null);
        toast.error('Session expired. Please log in again.');
        signOut(auth).catch(console.error);
      };

      window.addEventListener('auth_session_expired', handleSessionExpired);

      return () => {
        unsubscribe();
        window.removeEventListener('auth_session_expired', handleSessionExpired);
      };
    }
  }, []);

  /**
   * Log in user using Firebase email/password and verify via the backend
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      let idToken;
      if (isMockAuth) {
        // Generate simulated credentials payload
        idToken = JSON.stringify({ email, password, mock: true });
        localStorage.setItem('etniko_firebase_id_token', idToken);
      } else {
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        idToken = await credentials.user.getIdToken();
        localStorage.setItem('etniko_firebase_id_token', idToken);
      }

      // Exchange ID token for custom HTTP-only JWT cookie
      const response = await api.post('/auth/login', { idToken });
      
      if (response && response.success) {
        setUser(response.data.user);
        toast.success(`Welcome back, ${response.data.user.name || 'Client'}!`);
        return response.data.user;
      }
      throw new Error('Login failed on backend verification.');
    } catch (err) {
      let errMsg = err.message || 'Failed to authenticate credentials.';
      if (err.message && err.message.includes('api-key-not-valid')) {
        errMsg = 'Firebase client API Key is invalid. Falling back to local offline mock authentication.';
      }
      setError(errMsg);
      toast.error(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register new customer and initialize profile document
   */
  const register = async (email, password, name, phone) => {
    setLoading(true);
    setError(null);
    try {
      let idToken;
      if (isMockAuth) {
        // Generate simulated credentials payload
        idToken = JSON.stringify({ email, password, mock: true });
        localStorage.setItem('etniko_firebase_id_token', idToken);
      } else {
        const credentials = await createUserWithEmailAndPassword(auth, email, password);
        idToken = await credentials.user.getIdToken();
        localStorage.setItem('etniko_firebase_id_token', idToken);
      }

      // Initialize Firestore document and secure session cookie
      const response = await api.post('/auth/register', { idToken, name, phone });

      if (response && response.success) {
        setUser(response.data.user);
        toast.success(`Account registered! Welcome to ETNIKO, ${name}.`);
        return response.data.user;
      }
      throw new Error('Registration failed on backend initialization.');
    } catch (err) {
      let errMsg = err.message || 'Failed to complete registration.';
      if (err.message && err.message.includes('api-key-not-valid')) {
        errMsg = 'Firebase client API Key is invalid. Check client .env configurations.';
      }
      setError(errMsg);
      toast.error(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out from Firebase and clear backend session cookie
   */
  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
      if (!isMockAuth) {
        await signOut(auth);
      }
      setUser(null);
      localStorage.removeItem('etniko_firebase_id_token');
      toast.success('Logged out successfully.');
    } catch (err) {
      console.error('Logout error:', err);
      toast.error('Failed to log out cleanly.');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be consumed within an AuthProvider.');
  }
  return context;
};

export default AuthContext;
