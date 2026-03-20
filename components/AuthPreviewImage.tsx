'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const AuthPreviewImage = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="auth-preview-shell">
      <div
        aria-hidden
        className={`auth-preview-skeleton ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
      />

      <Image
        src="/assets/images/dashboard.png"
        alt="Dashboard Preview"
        width={1440}
        height={1150}
        priority
        sizes="55vw"
        onLoad={() => setIsLoaded(true)}
        className={[
          'auth-dashboard-preview',
          isVisible ? 'translate-x-0 translate-y-0 opacity-100' : 'translate-x-12 opacity-0',
          isLoaded ? 'scale-100 blur-0' : 'scale-[1.03] blur-sm',
        ].join(' ')}
      />
    </div>
  );
};

export default AuthPreviewImage;
