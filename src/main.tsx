import { createRoot } from 'react-dom/client'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import App from './App.tsx'
import './index.css'

// You need to replace this with your own Dynamic Labs environment ID
// Get it from: https://app.dynamic.xyz/dashboard/developer
const DYNAMIC_ENVIRONMENT_ID = "fe84593e-fefc-4303-aed9-099ee46cf8a9";

// Enhanced error handling for Dynamic SDK
const handleDynamicError = (error: any) => {
  console.error('[Dynamic] Authentication error:', error);
  console.error('[Dynamic] Error details:', {
    message: error?.message,
    code: error?.code,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });
};

const handleDynamicSuccess = (event: any) => {
  console.log('[Dynamic] Authentication success:', event);
};

createRoot(document.getElementById("root")!).render(
  <DynamicContextProvider
    settings={{
      environmentId: DYNAMIC_ENVIRONMENT_ID,
      appLogoUrl: '/favicon.ico',
      appName: 'ENS Referrals',
      privacyPolicyUrl: '/privacy',
      termsOfServiceUrl: '/terms',
      debugError: true,
      
      // Enhanced configuration for better error handling
      initialAuthenticationMode: 'connect-only'
    }}
  >
    <App />
  </DynamicContextProvider>
);
