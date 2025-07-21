'use client';

import { useState } from 'react';
import { useAuth } from './use-auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { API_BASE_URL } from '@/utils/api';

interface UsePremiumAuthGuardReturn {
  isAuthenticated: boolean;
  loading: boolean;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  navigateToPremiumTrial: () => void;
  authStep: 'user-check' | 'sign-in' | 'register' | 'card-details' | 'subscription-status';
  setAuthStep: (step: 'user-check' | 'sign-in' | 'register' | 'card-details' | 'subscription-status') => void;
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
  cardData: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    accountHolderName: string;
    billingAddress: string;
    city: string;
    postalCode: string;
  };
  setCardData: (data: any) => void;
  userData: any;
  setUserData: (data: any) => void;
  handleSignIn: (e: React.FormEvent) => Promise<void>;
  handleRegister: (e: React.FormEvent) => Promise<void>;
  handleCardSubmit: (e: React.FormEvent) => Promise<void>;
}

export const usePremiumAuthGuard = (): UsePremiumAuthGuardReturn => {
  const { user, loading, isAuthenticated, signIn, register, checkEmailExists } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authStep, setAuthStep] = useState<'user-check' | 'sign-in' | 'register' | 'card-details' | 'subscription-status'>('user-check');
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

  const [cardData, setCardData] = useState({
    accountNumber: '',
    bankCode: '',
    bankName: '',
    accountHolderName: '',
    billingAddress: '',
    city: '',
    postalCode: ''
  });

  const [userData, setUserData] = useState(null);

  const navigateToPremiumTrial = async () => {
    console.log('navigateToPremiumTrial called');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('loading:', loading);
    
    if (isAuthenticated) {
      console.log('User is authenticated, checking subscription status');
      setShowAuthModal(true);
      setIsSubmitting(true);
      setError(null);
      
      try {
        // Get the current user and ID token
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError('User not found');
          setIsSubmitting(false);
          return;
        }

        const idToken = await currentUser.getIdToken();
        
        // Fetch user data from API
        const response = await fetch(`${API_BASE_URL}/Users/${currentUser.uid}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUserData(userData);
          
          // Check user's subscription plan
          console.log('🔍 DEBUG: Premium Auth - User data received:', userData);
          console.log('🔍 DEBUG: Premium Auth - User plan is:', userData.plan);
          
          if (userData.plan === 'premium') {
            // User already has premium plan, fetch subscription status and show it
            try {
              const subscriptionResponse = await fetch(`${API_BASE_URL}/subscription/status`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${idToken}`,
                  'Content-Type': 'application/json'
                }
              });

              if (subscriptionResponse.ok) {
                const subscriptionData = await subscriptionResponse.json();
                setUserData({ ...userData, subscription: subscriptionData });
              }
            } catch (error) {
              console.error('Error fetching subscription status:', error);
            }
            
            console.log('🔍 DEBUG: Setting auth step to subscription-status');
            setAuthStep('subscription-status');
          } else {
            // User has free plan or no plan, go to card details
            console.log('🔍 DEBUG: Setting auth step to card-details');
            setAuthStep('card-details');
          }
        } else {
          console.error('Failed to fetch user data:', response.status);
          // If API call fails, assume free plan and go to card details
          setAuthStep('card-details');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If API call fails, assume free plan and go to card details
        setAuthStep('card-details');
      } finally {
        setIsSubmitting(false);
      }
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
      try {
        // Get the current user and ID token
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setError('User not found after sign in');
          setIsSubmitting(false);
          return;
        }

        const idToken = await currentUser.getIdToken();
        
        // Debug: Log the API URL being used
        console.log('🔍 DEBUG: API_BASE_URL:', API_BASE_URL);
        console.log('🔍 DEBUG: Full API URL:', `${API_BASE_URL}/Users/${currentUser.uid}`);
        
        // Fetch user data from API
        const response = await fetch(`${API_BASE_URL}/Users/${currentUser.uid}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setUserData(userData);
          
          // Check user's subscription plan
          console.log('🔍 DEBUG: Premium Auth - User data received:', userData);
          console.log('🔍 DEBUG: Premium Auth - User plan is:', userData.plan);
          if (userData.plan === 'premium') {
            // User already has premium plan, fetch subscription status and show it
            try {
              const subscriptionResponse = await fetch(`${API_BASE_URL}/subscription/status`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${idToken}`,
                  'Content-Type': 'application/json'
                }
              });

              if (subscriptionResponse.ok) {
                const subscriptionData = await subscriptionResponse.json();
                setUserData({ ...userData, subscription: subscriptionData });
              }
            } catch (error) {
              console.error('Error fetching subscription status:', error);
            }
            
            console.log('🔍 DEBUG: Setting auth step to subscription-status');
            setAuthStep('subscription-status');
          } else {
            // User has free plan or no plan, go to card details
            console.log('🔍 DEBUG: Setting auth step to card-details');
            setAuthStep('card-details');
          }
        } else {
          console.error('Failed to fetch user data:', response.status);
          // If API call fails, assume free plan and go to card details
          setAuthStep('card-details');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If API call fails, assume free plan and go to card details
        setAuthStep('card-details');
      }
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
      // Go directly to card details
      setAuthStep('card-details');
    } else {
      setError(result.error?.userFriendlyMessage || 'Registration failed');
    }

    setIsSubmitting(false);
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Get the current user's ID token
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated. Please sign in again.');
        setIsSubmitting(false);
        return;
      }

      const idToken = await user.getIdToken();
      
      // Prepare the banking data payload
      const bankingData = {
        accountNumber: cardData.accountNumber,
        bankCode: cardData.bankCode,
        bankName: cardData.bankName,
        accountHolderName: cardData.accountHolderName,
        billingAddress: cardData.billingAddress,
        city: cardData.city,
        postalCode: cardData.postalCode
      };

      // Make API call to save banking data
      const response = await fetch(`${API_BASE_URL}/subscription/trial/initialize-with-banking`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify(bankingData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.status === true && result.data?.authorization_url) {
        // Open the Paystack authorization URL in a new window/tab
        window.open(result.data.authorization_url, '_blank');
        
        // Close modal and show success message
        setShowAuthModal(false);
        console.log('Paystack authorization URL opened:', result.data.authorization_url);
        console.log('Access code:', result.data.access_code);
        console.log('Reference:', result.data.reference);
      } else {
        throw new Error(result.message || 'Failed to create authorization URL');
      }
      
    } catch (error) {
      console.error('Card submission error:', error);
      setError(error instanceof Error ? error.message : 'Payment processing failed. Please try again.');
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
    cardData,
    setCardData,
    userData,
    setUserData,
    handleSignIn,
    handleRegister,
    handleCardSubmit
  };
}; 