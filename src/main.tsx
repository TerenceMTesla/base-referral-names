import { createRoot } from 'react-dom/client'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import App from './App.tsx'
import './index.css'

const DYNAMIC_ENVIRONMENT_ID = "01938c9a-d0bb-7d61-9155-5c7f8b5f5c7b";

createRoot(document.getElementById("root")!).render(
  <DynamicContextProvider
    settings={{
      environmentId: DYNAMIC_ENVIRONMENT_ID,
    }}
  >
    <App />
  </DynamicContextProvider>
);
