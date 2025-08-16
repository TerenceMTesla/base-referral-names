import { create } from 'zustand';

interface AppState {
  // Loading states
  isLoading: boolean;
  loadingMessage: string;
  
  // Error states
  error: string | null;
  
  // Actions
  setLoading: (loading: boolean, message?: string) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAppState = create<AppState>((set) => ({
  isLoading: false,
  loadingMessage: '',
  error: null,
  
  setLoading: (loading: boolean, message = '') => 
    set({ isLoading: loading, loadingMessage: message }),
  
  setError: (error: string | null) => 
    set({ error, isLoading: false }),
  
  clearError: () => 
    set({ error: null }),
}));