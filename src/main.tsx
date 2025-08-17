import { createRoot } from 'react-dom/client'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum'
import App from './App.tsx'
import './index.css'

// Use the Dynamic Environment ID from secrets or fallback
const DYNAMIC_ENVIRONMENT_ID = "b7d5ad65-b40b-414c-8f92-e95c4e98ba8b"; // This is the correct production environment ID

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
      appLogoUrl: 'https://753ea4ce-e011-471d-9783-2f916efecf4d.lovableproject.com/favicon.ico',
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
