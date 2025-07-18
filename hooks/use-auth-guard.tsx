'use client';

import { useState } from 'react';
import { useAuth } from './use-auth';
import { useRouter } from 'next/navigation';

interface UseAuthGuardReturn {
  isAuthenticated: boolean;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  navigateToProtectedRoute: (route: string) => void;
  authStep: 'user-check' | 'sign-in' | 'register';
  setAuthStep: (step: 'user-check' | 'sign-in' | 'register') => void;
  isSubmitting: boolean;
  error: string | null;
  signInData: { email: string; password: string };
  setSignInData: (data: { email: string; password: string }) => void;
  registerData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    company: string;
  };
  setRegisterData: (data: any) => void;
  handleSignIn: (e: React.FormEvent) => Promise<void>;
  handleRegister: (e: React.FormEvent) => Promise<void>;
}

export const useAuthGuard = (): UseAuthGuardReturn => {
  const { user, loading, isAuthenticated, signIn, register, checkEmailExists } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'user-check' | 'sign-in' | 'register'>('user-check');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);

  // Form states
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });

  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: ''
  });

  const navigateToProtectedRoute = (route: string) => {
    console.log('navigateToProtectedRoute called with:', route);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('loading:', loading);
    
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to:', route);
      router.push(route);
    } else {
      console.log('User is not authenticated, showing auth modal');
      setPendingRoute(route);
      setShowAuthModal(true);
      setAuthStep('user-check');
      setError(null);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await signIn(signInData);
    
    if (result.success) {
      setShowAuthModal(false);
      if (pendingRoute) {
        router.push(pendingRoute);
        setPendingRoute(null);
      }
    } else {
      setError(result.error?.userFriendlyMessage || 'Login failed');
    }
    
    setIsSubmitting(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate passwords match
    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(registerData.email);
    if (emailExists) {
      setError('An account with this email already exists. Please sign in instead.');
      setIsSubmitting(false);
      return;
    }

    const result = await register({
      email: registerData.email,
      password: registerData.password,
      displayName: `${registerData.firstName} ${registerData.lastName}`.trim()
    });

    if (result.success) {
      setShowAuthModal(false);
      if (pendingRoute) {
        router.push(pendingRoute);
        setPendingRoute(null);
      }
    } else {
      setError(result.error?.userFriendlyMessage || 'Registration failed');
    }

    setIsSubmitting(false);
  };

  return {
    isAuthenticated,
    loading,
    showAuthModal,
    setShowAuthModal,
    navigateToProtectedRoute,
    authStep,
    setAuthStep,
    isSubmitting,
    error,
    signInData,
    setSignInData,
    registerData,
    setRegisterData,
    handleSignIn,
    handleRegister
  };
}; 