import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: true,
      toggle: () => set((state) => {
        const isDark = !state.isDark;
        document.documentElement.classList.toggle('dark', isDark);
        return { isDark };
      }),
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          document.documentElement.classList.toggle('dark', state.isDark);
        }
      },
    }
  )
);