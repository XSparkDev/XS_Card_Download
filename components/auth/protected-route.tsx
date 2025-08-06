'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback,
  requireAuth = true 
}) => {
  const { user, loading, isAuthenticated, signIn, register, checkEmailExists } = useAuth();
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

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is not required, render children
  if (!requireAuth) {
    return <>{children}</>;
  }

  // If user is not authenticated, show auth modal directly
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    // Show auth modal directly
    return (
      <>
        {children}
        
        {/* Auth Modal - Direct overlay */}
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-sm animate-fade-in-scale safari-blur bg-black/50"
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white/25 backdrop-blur-lg border border-white/30 rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto modal-scroll animate-fade-in-scale animation-delay-200">
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Authentication Required</h3>
              <p className="text-white/80">Sign in to access this page</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-center font-medium">{error}</p>
              </div>
            )}

            {/* Auth Steps */}
            {authStep === 'user-check' && (
              <div className="space-y-4">
                <p className="text-white/80 text-center">Are you an existing user?</p>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setAuthStep('sign-in')}
                    className="flex-1 bg-custom-btn-gradient hover:opacity-90 text-white transition-opacity"
                  >
                    Yes, Sign In
                  </Button>
                  <Button
                    onClick={() => setAuthStep('register')}
                    className="flex-1 bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium"
                  >
                    No, Register
                  </Button>
                </div>
              </div>
            )}

            {authStep === 'sign-in' && (
              <div className="space-y-4">
                <Button
                  onClick={() => setAuthStep('user-check')}
                  className="w-full mb-4 bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium"
                >
                  ← Back
                </Button>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSubmitting(true);
                  setError(null);

                  const result = await signIn(signInData);
                  
                  if (result.success) {
                    setShowAuthModal(false);
                  } else {
                    setError(result.error?.userFriendlyMessage || 'Login failed');
                  }
                  
                  setIsSubmitting(false);
                }} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="your.email@company.com"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      value={signInData.password}
                      onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !signInData.email || !signInData.password}
                    className="w-full bg-custom-btn-gradient hover:opacity-90 text-white transition-opacity"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </div>
            )}

            {authStep === 'register' && (
              <div className="space-y-4">
                <Button
                  onClick={() => setAuthStep('user-check')}
                  className="w-full mb-4 bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium"
                >
                  ← Back
                </Button>
                <form onSubmit={async (e) => {
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
                  } else {
                    setError(result.error?.userFriendlyMessage || 'Registration failed');
                  }

                  setIsSubmitting(false);
                }} className="space-y-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-white mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your first name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-white mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your last name"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="your.email@company.com"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      required
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Enter your password"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      required
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Confirm your password"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-white mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={registerData.company}
                      onChange={(e) => setRegisterData({ ...registerData, company: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500"
                      placeholder="Your Company"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={
                      isSubmitting ||
                      !registerData.firstName ||
                      !registerData.lastName ||
                      !registerData.email ||
                      !registerData.password ||
                      !registerData.confirmPassword
                    }
                    className="w-full bg-custom-btn-gradient hover:opacity-90 text-white transition-opacity"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Registering...</span>
                      </div>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </form>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}; 