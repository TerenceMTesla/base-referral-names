import { createRoot } from 'react-dom/client'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import App from './App.tsx'
import './index.css'

const DYNAMIC_ENVIRONMENT_ID = "fe84593e-fefc-4303-aed9-099ee46cf8a9";

createRoot(document.getElementById("root")!).render(
  <DynamicContextProvider
    settings={{
      environmentId: DYNAMIC_ENVIRONMENT_ID,
    }}
  >
    <App />
  </DynamicContextProvider>
);
