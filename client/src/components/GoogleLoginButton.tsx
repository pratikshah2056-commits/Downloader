import React, { useEffect, useRef } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (credential: string) => void;
  onError: () => void;
}

declare global {
  interface Window {
    google?: any;
    __google_initialized?: boolean;
  }
}

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onSuccess, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let checkInterval: any = null;

    const initializeAndRender = () => {
      if (!window.google || !window.google.accounts?.id) return;

      const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '340196864705-9cjpo5bcjqoeq16e88qanr6ohse2aafc.apps.googleusercontent.com';

      // Ensure google.accounts.id.initialize is called exactly once globally
      if (!window.__google_initialized) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            if (response.credential) {
              onSuccess(response.credential);
            } else {
              onError();
            }
          },
        });
        window.__google_initialized = true;
      }

      // Render button inside the container element
      if (containerRef.current) {
        containerRef.current.innerHTML = ''; // Clear previous instances
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'filled_blue',
          size: 'large',
          shape: 'pill',
          width: 280,
        });
      }
    };

    const loadGoogleScript = () => {
      const scriptId = 'google-gsi-client-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement;

      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.id = scriptId;
        script.async = true;
        script.defer = true;
        script.onload = initializeAndRender;
        document.body.appendChild(script);
      } else if (window.google && window.google.accounts?.id) {
        // Script already loaded
        initializeAndRender();
      } else {
        // Script is added but still loading
        checkInterval = setInterval(() => {
          if (window.google && window.google.accounts?.id) {
            clearInterval(checkInterval);
            initializeAndRender();
          }
        }, 100);
      }
    };

    loadGoogleScript();

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [onSuccess, onError]);

  return <div ref={containerRef} style={{ width: '280px', height: '40px', display: 'flex', justifyContent: 'center' }} />;
};

export default GoogleLoginButton;
