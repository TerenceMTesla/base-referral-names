import { createRoot } from 'react-dom/client'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import App from './App.tsx'
import './index.css'

const DYNAMIC_ENVIRONMENT_ID = "1e1d5fb2-1fec-43b3-a497-04cfb4e7427f";

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
      walletConnectors: [EthereumWalletConnectors],
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
