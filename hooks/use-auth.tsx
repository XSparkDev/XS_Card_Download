'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AuthErrorType, RegisterData, LoginData, registerUser, signInUser, signOutUser, resetPassword, checkEmailExists } from '@/lib/auth';

// Authentication context interface
interface AuthContextType {
  user: User | null;
  loading: boolean;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: AuthErrorType }>;
  signIn: (data: LoginData) => Promise<{ success: boolean; error?: AuthErrorType }>;
  signOut: () => Promise<{ success: boolean; error?: AuthErrorType }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: AuthErrorType }>;
  checkEmailExists: (email: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // Register new user
  const register = async (data: RegisterData) => {
    const result = await registerUser(data);
    return {
      success: result.success,
      error: result.error
    };
  };

  // Sign in user
  const signIn = async (data: LoginData) => {
    const result = await signInUser(data);
    return {
      success: result.success,
      error: result.error
    };
  };

  // Sign out user
  const signOut = async () => {
    const result = await signOutUser();
    return {
      success: result.success,
      error: result.error
    };
  };

  // Reset password
  const resetPasswordHandler = async (email: string) => {
    const result = await resetPassword(email);
    return {
      success: result.success,
      error: result.error
    };
  };

  // Check if email exists
  const checkEmailExistsHandler = async (email: string) => {
    return await checkEmailExists(email);
  };

  const value: AuthContextType = {
    user,
    loading,
    register,
    signIn,
    signOut,
    resetPassword: resetPasswordHandler,
    checkEmailExists: checkEmailExistsHandler,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 