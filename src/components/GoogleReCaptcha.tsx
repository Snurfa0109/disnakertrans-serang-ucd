"use client";

import React, { useEffect, useRef } from "react";
import Script from "next/script";

interface GoogleReCaptchaProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  theme?: "light" | "dark";
  resetSignal?: number; // Increment this to reset the widget
}

// Google official test key (safe for localhost and testing)
const DEFAULT_SITE_KEY = "6LeIxacZAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe";

declare global {
  interface Window {
    grecaptcha: any;
    onGoogleReCaptchaLoad?: () => void;
  }
}

export default function GoogleReCaptcha({
  onVerify,
  onExpire,
  theme = "light",
  resetSignal,
}: GoogleReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || DEFAULT_SITE_KEY;

  const renderCaptcha = () => {
    if (typeof window !== "undefined" && window.grecaptcha && containerRef.current) {
      if (widgetIdRef.current === null) {
        try {
          widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
            sitekey: siteKey,
            theme: theme,
            callback: (token: string) => {
              onVerify(token);
            },
            "expired-callback": () => {
              if (onExpire) onExpire();
            },
          });
        } catch (e) {
          // Already rendered or in progress
        }
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.grecaptcha && window.grecaptcha.render) {
      renderCaptcha();
    } else {
      window.onGoogleReCaptchaLoad = renderCaptcha;
    }
  }, []);

  // Reset if requested by parent form
  useEffect(() => {
    if (resetSignal !== undefined && resetSignal > 0 && widgetIdRef.current !== null) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
      } catch (e) {
        // ignore
      }
    }
  }, [resetSignal]);

  return (
    <div className="flex flex-col items-start py-1">
      <Script
        src="https://www.google.com/recaptcha/api.js?onload=onGoogleReCaptchaLoad&render=explicit"
        strategy="afterInteractive"
      />
      <div ref={containerRef} className="min-h-[78px] flex items-center" />
    </div>
  );
}
