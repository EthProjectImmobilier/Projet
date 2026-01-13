import { AuthService } from '@/services/auth.api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  role: "ROLE_TENANT" | "ROLE_OWNER" | "ROLE_ADMIN";
  enabled?: boolean;
  description?: string;
  dateNaissance?: string;
  phone?: string;
  country?: string;
  city?: string;
  photoUrl?: string;
  kycRectoUrl?: string;
  kycVersoUrl?: string;
}

interface AuthState {
  token: string | null;
  refreshToken?: string | null;
  isAuthenticated: boolean;
  user?: User;
  emailVerified?: boolean;
  walletVerified?: boolean;
  walletAddress?: string;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loginWithWallet: (address: string, message: string, signature: string) => Promise<void>;
  loadUser: () => Promise<void>;
}

export const authStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      user: undefined,
      login: async (email, password) => {
        const response = await AuthService.login(email, password);
        const token = response.data.token;
        const refreshToken = response.data.refreshToken;
        const user = { email: response.data.email, firstName: response.data.firstName, lastName: response.data.lastName, role: response.data.role };
        const emailVerified = response.data.emailVerified;
        const walletVerified = response.data.walletVerified;
        const walletAddress = response.data.walletAddress;
        set({ token, refreshToken, isAuthenticated: true, user, emailVerified, walletVerified, walletAddress });
      },
      
      logout: () => {
        set({ token: null, refreshToken: null, isAuthenticated: false, user: undefined , emailVerified: false, walletVerified: false, walletAddress: undefined});
      },
      loginWithWallet: async (address, message, signature) => {
        const response = await AuthService.loginWithWallet({ address, message, signature });
        const token = response.data.token;
        const refreshToken = response.data.refreshToken;
        const user = { email: response.data.email, firstName: response.data.firstName, lastName: response.data.lastName, role: response.data.role };
        const emailVerified = response.data.emailVerified;
        const walletVerified = response.data.walletVerified;
        const walletAddress = response.data.walletAddress;
        set({ token, refreshToken, isAuthenticated: true, user, emailVerified, walletVerified, walletAddress });
      },
      loadUser: async () => {
        const response = await AuthService.me();
        const user = { 
          email: response.data.email, 
          firstName: response.data.firstName, 
          lastName: response.data.lastName, 
          role: response.data.role, 
          enabled: response.data.enabled, 
          description: response.data.description, 
          dateNaissance: response.data.dateNaissance, 
          phone: response.data.phone, 
          country: response.data.country, 
          city: response.data.city, 
          photoUrl: response.data.photoUrl, 
          kycRectoUrl: response.data.kycRectoUrl, 
          kycVersoUrl: response.data.kycVersoUrl };
        const emailVerified = response.data.emailVerified;
        const walletVerified = response.data.walletVerified;
        const walletAddress = response.data.walletAddress;
        set({ user, emailVerified, walletVerified, walletAddress });
      },
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        emailVerified: state.emailVerified,
        walletVerified: state.walletVerified,
        walletAddress: state.walletAddress,
      }),
    }
  )
);