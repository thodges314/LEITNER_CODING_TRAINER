import React, { useState } from 'react';
import { Monitor, X } from 'lucide-react';

const STORAGE_KEY = 'leitner_mobile_banner_dismissed';

export const MobileDeviceBanner: React.FC = () => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore sessionStorage errors
    }
  };

  if (isDismissed) return null;

  return (
    <aside
      className="mobile-device-banner"
      role="status"
      aria-label="Desktop experience recommendation"
    >
      <div className="mobile-device-banner-inner">
        <div className="mobile-device-banner-icon" aria-hidden="true">
          <Monitor size={15} />
        </div>
        <div className="mobile-device-banner-text">
          <strong>Desktop Recommended:</strong> Leitner Coding Trainer is optimized for a full-sized screen and keyboard. We recommend using a desktop or laptop if possible.
        </div>
        <button
          type="button"
          className="mobile-device-banner-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss desktop recommendation"
          title="Dismiss"
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
};
