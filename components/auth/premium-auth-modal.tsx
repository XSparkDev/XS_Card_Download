'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface PremiumAuthModalProps {
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
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
  cardData?: {
    accountNumber: string;
    bankCode: string;
    bankName: string;
    accountHolderName: string;
    billingAddress: string;
    city: string;
    postalCode: string;
  };
  setCardData?: (data: any) => void;
  handleSignIn: (e: React.FormEvent) => Promise<void>;
  handleRegister: (e: React.FormEvent) => Promise<void>;
  handleCardSubmit?: (e: React.FormEvent) => Promise<void>;
  userData?: any;
  isOverLightSection?: boolean;
}

export const PremiumAuthModal: React.FC<PremiumAuthModalProps> = ({
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
  cardData,
  setCardData,
  handleSignIn,
  handleRegister,
  handleCardSubmit,
  userData,
  isOverLightSection = false
}) => {
  console.log('PremiumAuthModal render - showAuthModal:', showAuthModal, 'authStep:', authStep);

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
          <h3 className="text-2xl font-bold text-white mb-2">Start Your Premium Trial</h3>
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
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
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
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-white">
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
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-2 text-white">
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
                <label htmlFor="lastName" className="block text-sm font-medium mb-2 text-white">
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
                <label htmlFor="email" className="block text-sm font-medium mb-2 text-white">
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
                <label htmlFor="password" className="block text-sm font-medium mb-2 text-white">
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
                <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2 text-white">
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
                <label htmlFor="company" className="block text-sm font-medium mb-2 text-white">
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

                {(() => {
          console.log('🔍 DEBUG: Checking subscription status condition - authStep:', authStep, 'userData exists:', !!userData);
          return null;
        })()}
        {authStep === 'subscription-status' && userData && (
          <div className="space-y-4 text-center">
            {(() => {
              console.log('🔍 DEBUG: Rendering subscription status step with userData:', userData);
              return null;
            })()}
            <div className="mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Premium Subscription Active</h4>
              <p className="mb-4 text-white/80">
                {userData.subscription?.data?.subscriptionStatus === 'active' ? (
                  `You have an active ${userData.subscription.data.subscriptionPlan?.replace('_', ' ').toLowerCase()} subscription.`
                ) : (
                  `Your subscription is currently ${userData.subscription?.data?.subscriptionStatus}.`
                )}
                {userData.subscription?.data?.trialStartDate && (
                  <span className="block mt-1">
                    Started on {new Date(userData.subscription.data.trialStartDate).toLocaleDateString()}
                  </span>
                )}
              </p>
              
              <div className={`rounded-lg p-4 mb-4 ${isOverLightSection ? "bg-slate-800/90" : "bg-white/10"}`}>
                <div className="text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/80">Plan:</span>
                    <span className="font-medium text-white">{userData.plan || 'Premium'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Status:</span>
                    <span className="text-green-400 font-medium">{userData.subscription?.data?.subscriptionStatus || 'Active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/80">Subscription Plan:</span>
                    <span className="font-medium text-white">{userData.subscription?.data?.subscriptionPlan || 'Premium'}</span>
                  </div>
                  {userData.subscription?.data?.trialStartDate && (
                    <div className="flex justify-between">
                      <span className="text-white/80">Trial Start:</span>
                      <span className="text-white">{new Date(userData.subscription.data.trialStartDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  {userData.subscription?.data?.trialEndDate && (
                    <div className="flex justify-between">
                      <span className="text-white/80">Trial End:</span>
                      <span className="text-white">{new Date(userData.subscription.data.trialEndDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-white/80">Active:</span>
                    <span className="font-medium text-green-400">
                      {userData.subscription?.data?.isActive ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setShowAuthModal(false)}
              className="bg-custom-btn-gradient hover:opacity-90 text-white px-8 transition-opacity"
            >
              Close
            </Button>
          </div>
        )}

        {authStep === 'card-details' && cardData && setCardData && handleCardSubmit && (
          <div className="space-y-4">
            <Button
              onClick={() => setAuthStep('user-check')}
              className="w-full mb-4 bg-transparent border border-white/60 text-white hover:bg-white/20 hover:border-white/80 font-medium"
            >
              ← Back
            </Button>
            <form onSubmit={handleCardSubmit} className="space-y-4">
              <div>
                <label htmlFor="accountHolderName" className="block text-sm font-medium mb-2 text-white">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  id="accountHolderName"
                  name="accountHolderName"
                  required
                  value={cardData.accountHolderName}
                  onChange={(e) => setCardData({ ...cardData, accountHolderName: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Name on bank account"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium mb-2 text-white">
                  Account Number *
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="accountNumber"
                  required
                  value={cardData.accountNumber}
                  onChange={(e) => setCardData({ ...cardData, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Enter account number"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bankCode" className="block text-sm font-medium mb-2 text-white">
                    Bank Code *
                  </label>
                  <input
                    type="text"
                    id="bankCode"
                    name="bankCode"
                    required
                    value={cardData.bankCode}
                    onChange={(e) => setCardData({ ...cardData, bankCode: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="e.g., 632005"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="bankName" className="block text-sm font-medium mb-2 text-white">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    id="bankName"
                    name="bankName"
                    required
                    value={cardData.bankName}
                    onChange={(e) => setCardData({ ...cardData, bankName: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="e.g., Standard Bank"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="billingAddress" className="block text-sm font-medium mb-2 text-white">
                  Billing Address *
                </label>
                <input
                  type="text"
                  id="billingAddress"
                  name="billingAddress"
                  required
                  value={cardData.billingAddress}
                  onChange={(e) => setCardData({ ...cardData, billingAddress: e.target.value })}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Street address"
                  disabled={isSubmitting}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-2 text-white">
                    City *
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    required
                    value={cardData.city}
                    onChange={(e) => setCardData({ ...cardData, city: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="City"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium mb-2 text-white">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    required
                    value={cardData.postalCode}
                    onChange={(e) => setCardData({ ...cardData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-white placeholder-gray-400"
                    placeholder="12345"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !cardData.accountHolderName ||
                  !cardData.accountNumber ||
                  !cardData.bankCode ||
                  !cardData.bankName ||
                  !cardData.billingAddress ||
                  !cardData.city ||
                  !cardData.postalCode
                }
                className="w-full bg-custom-btn-gradient hover:opacity-90 text-white py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "Submit Banking Information"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}; 