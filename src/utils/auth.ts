import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminProfile {
  totalEarnings: number;
  totalCustomers: number;
  totalWorkers: number;
  displayName: string;
  email: string;
  phoneNumber: string | null;
  address: string;
  cityName: string;
  age: number | null;
  profilePictureUrl: string | null;
  token: string;
}

interface AuthState {
  profile: AdminProfile | null;
  token: string | null;
  setAuth: (profile: AdminProfile) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      profile: null,
      token: null,
      setAuth: (profile) => set({ profile, token: profile.token }),
      logout: () => set({ profile: null, token: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);