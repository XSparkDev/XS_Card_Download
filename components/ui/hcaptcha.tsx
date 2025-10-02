'use client';

import React, { useRef, useEffect } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { Shield } from 'lucide-react';

interface HCaptchaComponentProps {
  onVerify: (verified: boolean, token?: string) => void;
  isOverLightSection?: boolean;
  siteKey?: string;
}

export const HCaptchaComponent: React.FC<HCaptchaComponentProps> = ({
  onVerify,
  isOverLightSection = false,
  siteKey = process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001' // Replace with your real site key
}) => {
  const captchaRef = useRef<HCaptcha>(null);

  const handleVerify = (token: string, ekey: string) => {
    console.log('hCaptcha verified with token:', token);
    onVerify(true, token);
  };

  const handleError = (err: string) => {
    console.error('hCaptcha error:', err);
    // Provide more specific error messages
    if (err.includes('network')) {
      console.error('Network error - please check your connection');
    } else if (err.includes('invalid')) {
      console.error('Invalid site key - please check configuration');
    } else {
      console.error('hCaptcha verification failed:', err);
    }
    onVerify(false);
  };

  const handleExpire = () => {
    console.log('hCaptcha expired');
    onVerify(false);
  };

  const handleReset = () => {
    if (captchaRef.current) {
      captchaRef.current.resetCaptcha();
    }
    onVerify(false);
  };

  return (
    <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 w-full min-w-0 ${
      isOverLightSection ? 'bg-white/20' : 'bg-white/10'
    }`}>
      <div className="flex items-center space-x-2 sm:space-x-3">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
          <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className={`text-xs sm:text-sm font-semibold ${isOverLightSection ? 'text-white' : 'text-gray-700'}`}>Security Verification</h4>
          <p className={`text-xs ${isOverLightSection ? 'text-white/70' : 'text-gray-700'}`}>Complete the challenge to continue</p>
        </div>
      </div>

      <div className="flex justify-center overflow-hidden captcha-container">
        <div className="w-full max-w-xs sm:max-w-sm">
          <HCaptcha
            ref={captchaRef}
            sitekey={siteKey}
            onVerify={handleVerify}
            onError={handleError}
            onExpire={handleExpire}
            theme={isOverLightSection ? 'light' : 'dark'}
            size="normal"
          />
        </div>
      </div>

      <div className="flex items-center justify-center space-x-2 pt-2 border-t border-white/10">
        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">XS</span>
        </div>
        <span className={`text-xs ${isOverLightSection ? 'text-white/60' : 'text-gray-700'}`}>Protected by hCaptcha</span>
      </div>
    </div>
  );
}; 