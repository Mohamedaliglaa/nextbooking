import { useUIStore } from '@/lib/store/ui-store';

export const useToast = () => {
  const { addToast, removeToast, toasts } = useUIStore();

  const toast = {
    success: (title: string, description?: string) => 
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) => 
      addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) => 
      addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) => 
      addToast({ type: 'info', title, description }),
  };

  return {
    toast,
    removeToast,
    toasts,
  };
};