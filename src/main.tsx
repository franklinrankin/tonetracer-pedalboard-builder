import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Detect Instagram in-app browser
function isInstagramBrowser(): boolean {
  const ua = navigator.userAgent || navigator.vendor || '';
  return ua.includes('Instagram') || ua.includes('FBAN') || ua.includes('FBAV');
}

// Instagram warning banner component
function InstagramWarning() {
  const [dismissed, setDismissed] = useState(false);
  const [isInstagram, setIsInstagram] = useState(false);

  useEffect(() => {
    setIsInstagram(isInstagramBrowser());
  }, []);

  if (!isInstagram || dismissed) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#000',
      color: '#fff',
      padding: '16px 20px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{ flex: 1 }}>
        <strong style={{ display: 'block', marginBottom: '4px' }}>👋 Heads up!</strong>
        <span style={{ fontSize: '14px', opacity: 0.9 }}>
          Instagram won't allow sign-ins — open in your regular browser for the full experience big dog
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: '#fff',
          color: '#000',
          border: 'none',
          padding: '8px 16px',
          fontWeight: 'bold',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        Got it
      </button>
    </div>
  );
}

// Error boundary for catching React errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#FFFEF0',
          minHeight: '100vh'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Boardsie
          </h1>
          <p style={{ marginBottom: '16px' }}>Something went wrong loading the app.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#000', 
              color: '#fff', 
              border: 'none',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Safe render
try {
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <ErrorBoundary>
          <InstagramWarning />
          <App />
        </ErrorBoundary>
      </React.StrictMode>,
    );
  }
} catch (e) {
  console.error('Failed to render app:', e);
  // Show basic fallback
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif; background-color: #FFFEF0; min-height: 100vh;">
        <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Boardsie</h1>
        <p style="margin-bottom: 16px;">Unable to load the app in this browser.</p>
        <p style="color: #666; font-size: 14px;">Please try opening in Safari or Chrome.</p>
        <a href="https://boardsie.com" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background-color: #000; color: #fff; text-decoration: none; font-weight: bold;">
          Open in Browser
        </a>
      </div>
    `;
  }
}

// Register service worker for PWA (only in supported browsers)
try {
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
        })
        .catch((error) => {
          console.log('SW registration failed:', error);
        });
    });
  }
} catch (e) {
  // Service worker not supported
}
