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
    <div className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 space-y-4 ${
      isOverLightSection ? 'bg-white/20' : 'bg-white/10'
    }`}>
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Security Verification</h4>
          <p className="text-xs text-white/70">Complete the challenge to continue</p>
        </div>
      </div>

      <div className="flex justify-center">
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

      <div className="flex items-center justify-center space-x-2 pt-2 border-t border-white/10">
        <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-sm flex items-center justify-center">
          <span className="text-white text-xs font-bold">XS</span>
        </div>
        <span className="text-xs text-white/60">Protected by hCaptcha</span>
      </div>
    </div>
  );
}; 