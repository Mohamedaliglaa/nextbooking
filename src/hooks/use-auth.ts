// hooks/use-auth.ts
import { useAuthStore } from '@/lib/store/auth-store';
import { useUIStore } from '@/lib/store/ui-store';

export const useAuth = () => {
  const { 
    user, 
    token, 
    isAuthenticated, 
    isLoading, 
    login, 
    register, 
    logout, 
    fetchUser,
    updateUser 
  } = useAuthStore();
  
  const { setLoading, addToast } = useUIStore();

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      setLoading('global', true);
      await login(credentials);
      addToast({
        type: 'success',
        title: 'Connexion réussie',
        description: 'Bienvenue !',
      });
    } catch (error: any) {
      const msg = error?.errors
        ? Object.values(error.errors).flat()[0]
        : error?.message || 'Email ou mot de passe incorrect';
      addToast({ type: 'error', title: 'Erreur de connexion', description: msg });
      throw error;
    }
 finally {
      setLoading('global', false);
    }
  };

  const handleRegister = async (userData: any) => {
    try {
      setLoading('global', true);
      await register(userData);
      addToast({
        type: 'success',
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur d\'inscription',
        description: error.message || 'Une erreur est survenue',
      });
      throw error;
    } finally {
      setLoading('global', false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading('global', true);
      await logout();
      addToast({
        type: 'success',
        title: 'Déconnexion réussie',
        description: 'À bientôt !',
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Erreur de déconnexion',
        description: error.message || 'Une erreur est survenue',
      });
    } finally {
      setLoading('global', false);
    }
  };

  const refreshUser = async () => {
    try {
      await fetchUser();
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,
    
    // Actions
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
    updateUser,
    
    // Computed
    isDriver: user?.role === 'driver',
    isPassenger: user?.role === 'passenger' || !user?.role,
  };
};