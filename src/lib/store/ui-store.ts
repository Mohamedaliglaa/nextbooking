// lib/store/ui-store.ts
import { create } from 'zustand';

interface UIState {
  // Sidebar states
  isSidebarOpen: boolean;
  // Modal states
  modals: {
    login: boolean;
    register: boolean;
    payment: boolean;
    rating: boolean;
    emergency: boolean;
  };
  // Loading states
  loading: {
    global: boolean;
    ride: boolean;
    payment: boolean;
  };
  // Toast notifications
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
    duration?: number;
  }>;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  openModal: (modal: keyof UIState['modals']) => void;
  closeModal: (modal: keyof UIState['modals']) => void;
  closeAllModals: () => void;
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void;
  addToast: (toast: Omit<UIState['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  isSidebarOpen: false,
  modals: {
    login: false,
    register: false,
    payment: false,
    rating: false,
    emergency: false,
  },
  loading: {
    global: false,
    ride: false,
    payment: false,
  },
  toasts: [],

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  
  openModal: (modal) => set((state) => ({ 
    modals: { ...state.modals, [modal]: true } 
  })),
  
  closeModal: (modal) => set((state) => ({ 
    modals: { ...state.modals, [modal]: false } 
  })),
  
  closeAllModals: () => set({ 
    modals: {
      login: false,
      register: false,
      payment: false,
      rating: false,
      emergency: false,
    }
  }),
  
  setLoading: (key, loading) => set((state) => ({
    loading: { ...state.loading, [key]: loading }
  })),
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({ 
      toasts: [...state.toasts, { ...toast, id }] 
    }));
    
    // Auto remove after duration
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 5000);
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter((toast) => toast.id !== id)
  })),
}));