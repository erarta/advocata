import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark' | 'system';
  locale: 'ru' | 'en';
  toggleSidebar: () => void;
  collapseSidebar: (collapsed: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  setLocale: (locale: 'ru' | 'en') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  theme: 'system',
  locale: 'ru',

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  collapseSidebar: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setTheme: (theme) => set({ theme }),
  setLocale: (locale) => set({ locale }),
}));
