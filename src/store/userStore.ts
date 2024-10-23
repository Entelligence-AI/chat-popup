import { create } from 'zustand';
import { User } from '@/types';

interface UserState {
  user: Partial<User> | null;
  setUser: (user: Partial<User> | null) => void;  
}

const useUserStore = create<UserState>((set: (state: Partial<UserState>) => void) => ({
  user: null,
  setUser: (user: Partial<User> | null) => set({ user }),
}));

export default useUserStore;
