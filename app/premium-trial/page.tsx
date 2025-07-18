'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, RefreshCw, CreditCard, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function PremiumTrialPage() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trialStarted, setTrialStarted] = useState(false);
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: '',
    city: '',
    postalCode: '',
  });

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardData({
      ...cardData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate payment processing
    setTimeout(() => {
      setTrialStarted(true);
      setIsSubmitting(false);
    }, 2000);
  };

  const getInputClass = () => {
    return "w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-4 left-4 right-4 z-50 px-4 sm:px-6 py-2 sm:py-4 rounded-full bg-white/20 backdrop-blur-lg border border-white/10">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
              <Image 
                src="/images/xscard-logo.png" 
                alt="XS Card Logo" 
                width={200} 
                height={67} 
                className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto" 
                priority
              />
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 text-white/90 hover:text-white transition-colors font-medium text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Website</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-lg border border-white/20">
            <CardContent className="p-8">
              {!trialStarted ? (
                <>
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Start Your Premium Trial</h1>
                    <p className="text-white/80">Welcome, {user?.displayName || user?.email}!</p>
                    <p className="text-white/60 text-sm mt-2">Complete your setup to start your 7-day free trial</p>
                  </div>

                  {/* Trial Benefits */}
                  <div className="mb-8 p-6 bg-white/5 rounded-lg border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">What's Included in Your Trial:</h3>
                    <ul className="space-y-3 text-white/80">
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        <span>Premium QR code designs with brand colors</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        <span>Advanced analytics and insights</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        <span>Custom branding and white-label options</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        <span>Priority customer support</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                        <span>Team sharing (up to 5 members)</span>
                      </li>
                    </ul>
                  </div>

                  {/* Payment Form */}
                  <form onSubmit={handleCardSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium text-white mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        required
                        value={cardData.cardNumber}
                        onChange={handleCardChange}
                        className={getInputClass()}
                        placeholder="1234 5678 9012 3456"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium text-white mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          required
                          value={cardData.expiryDate}
                          onChange={handleCardChange}
                          className={getInputClass()}
                          placeholder="MM/YY"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium text-white mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          required
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          className={getInputClass()}
                          placeholder="123"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cardholderName" className="block text-sm font-medium text-white mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        id="cardholderName"
                        name="cardholderName"
                        required
                        value={cardData.cardholderName}
                        onChange={handleCardChange}
                        className={getInputClass()}
                        placeholder="John Doe"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label htmlFor="billingAddress" className="block text-sm font-medium text-white mb-2">
                        Billing Address *
                      </label>
                      <input
                        type="text"
                        id="billingAddress"
                        name="billingAddress"
                        required
                        value={cardData.billingAddress}
                        onChange={handleCardChange}
                        className={getInputClass()}
                        placeholder="123 Main Street"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-white mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          required
                          value={cardData.city}
                          onChange={handleCardChange}
                          className={getInputClass()}
                          placeholder="Cape Town"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label htmlFor="postalCode" className="block text-sm font-medium text-white mb-2">
                          Postal Code *
                        </label>
                        <input
                          type="text"
                          id="postalCode"
                          name="postalCode"
                          required
                          value={cardData.postalCode}
                          onChange={handleCardChange}
                          className={getInputClass()}
                          placeholder="8001"
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <p className="text-blue-400 text-sm">
                        💳 Your card won't be charged during the 7-day trial. Cancel anytime before the trial ends.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      disabled={
                        isSubmitting ||
                        !cardData.cardNumber ||
                        !cardData.expiryDate ||
                        !cardData.cvv ||
                        !cardData.cardholderName ||
                        !cardData.billingAddress ||
                        !cardData.city ||
                        !cardData.postalCode
                      }
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Starting Your Trial...</span>
                        </div>
                      ) : (
                        "Start 7-Day Free Trial"
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                /* Success State */
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Trial Started Successfully!</h2>
                  <p className="text-white/80 mb-6">
                    Your 7-day premium trial is now active. You have full access to all premium features.
                  </p>
                  <div className="space-y-4">
                    <Button
                      onClick={() => window.open('https://xscard-app.onrender.com/download-apk', '_blank')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                    >
                      Download Mobile App
                    </Button>
                    <Link href="/">
                      <Button variant="outline" className="w-full border-white/40 text-white hover:bg-white/10">
                        Back to Website
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 