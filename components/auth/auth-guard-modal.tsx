'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface AuthGuardModalProps {
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
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
  isOverLightSection?: boolean;
}

export const AuthGuardModal: React.FC<AuthGuardModalProps> = ({
  showAuthModal,
  setShowAuthModal,
  authStep,
  setAuthStep,
  isSubmitting,
  error,
  signInData,
  setSignInData,
  registerData,
  setRegisterData,
  handleSignIn,
  handleRegister,
  isOverLightSection = false
}) => {
  console.log('AuthGuardModal render - showAuthModal:', showAuthModal);

  if (!showAuthModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 backdrop-blur-sm animate-fade-in-scale safari-blur ${
          isOverLightSection ? "bg-black/70" : "bg-black/50"
        }`}
        onClick={() => setShowAuthModal(false)}
      ></div>

      {/* Modal Content */}
      <div className={`relative ${isOverLightSection ? "bg-slate-900/90 backdrop-blur-lg border border-slate-700/50" : "bg-white/25 backdrop-blur-lg border border-white/30"} rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto modal-scroll animate-fade-in-scale animation-delay-200`}>
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">Authentication Required</h3>
          <p className="text-white/80">Sign in or create an account to continue</p>
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
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
              >
                Yes, Sign In
              </Button>
              <Button
                onClick={() => setAuthStep('register')}
                variant="outline"
                className="flex-1 border-blue-400/60 text-blue-300 hover:bg-blue-400/20"
              >
                No, Register
              </Button>
            </div>
          </div>
        )}

        {authStep === 'sign-in' && (
          <div>
            <Button
              onClick={() => setAuthStep('user-check')}
              variant="outline"
              className="w-full mb-4 bg-transparent border-white/40 text-white hover:bg-white/10"
            >
              ← Back
            </Button>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={signInData.email}
                  onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-white">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  value={signInData.password}
                  onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </div>
        )}

        {authStep === 'register' && (
          <div>
            <Button
              onClick={() => setAuthStep('user-check')}
              variant="outline"
              className="w-full mb-4 bg-transparent border-white/40 text-white hover:bg-white/10"
            >
              ← Back
            </Button>
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-white">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={registerData.firstName}
                  onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-white">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={registerData.lastName}
                  onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Enter your last name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-white">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-white">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <div>
                <label htmlFor="company" className="block text-sm font-medium mb-2 text-white">
                  Company Name
                </label>
                <input
                  type="text"
                  id="company"
                  value={registerData.company}
                  onChange={(e) => setRegisterData({ ...registerData, company: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Enter your company name (optional)"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}; 