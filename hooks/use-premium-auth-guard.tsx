'use client';

import { useState } from 'react';
import { useAuth } from './use-auth';
import { useRouter } from 'next/navigation';

interface UsePremiumAuthGuardReturn {
  isAuthenticated: boolean;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  navigateToPremiumTrial: () => void;
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

export const usePremiumAuthGuard = (): UsePremiumAuthGuardReturn => {
  const { user, loading, isAuthenticated, signIn, register, checkEmailExists } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'user-check' | 'sign-in' | 'register'>('user-check');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const navigateToPremiumTrial = () => {
    console.log('navigateToPremiumTrial called');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('loading:', loading);
    
    if (isAuthenticated) {
      console.log('User is authenticated, navigating to premium trial');
      router.push('/premium-trial');
    } else {
      console.log('User is not authenticated, showing auth modal');
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
    
    console.log('Sign in result:', result);
    
    if (result.success) {
      setShowAuthModal(false);
      router.push('/premium-trial');
    } else {
      console.log('Sign in error:', result.error);
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
      router.push('/premium-trial');
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
    navigateToPremiumTrial,
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