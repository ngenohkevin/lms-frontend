import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Theme, SidebarState } from '@/types'

interface UIState {
  theme: Theme
  sidebar: SidebarState
  searchQuery: string
  notifications: {
    isOpen: boolean
    unreadCount: number
  }
  modals: {
    [key: string]: boolean
  }
}

interface UIActions {
  // Theme actions
  setTheme: (theme: Theme['mode']) => void
  toggleTheme: () => void
  
  // Sidebar actions
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarMobile: (isMobile: boolean) => void
  
  // Search actions
  setSearchQuery: (query: string) => void
  clearSearchQuery: () => void
  
  // Notification actions
  setNotificationsOpen: (isOpen: boolean) => void
  setUnreadCount: (count: number) => void
  
  // Modal actions
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  toggleModal: (modalId: string) => void
  closeAllModals: () => void
}

export const useUIStore = create<UIState & UIActions>()(
  persist(
    immer((set, get) => ({
      // Initial state
      theme: { mode: 'system' },
      sidebar: {
        isCollapsed: false,
        isMobile: false,
      },
      searchQuery: '',
      notifications: {
        isOpen: false,
        unreadCount: 0,
      },
      modals: {},

      // Theme actions
      setTheme: (mode) =>
        set((state) => {
          state.theme.mode = mode
        }),

      toggleTheme: () =>
        set((state) => {
          const currentMode = state.theme.mode
          if (currentMode === 'light') {
            state.theme.mode = 'dark'
          } else if (currentMode === 'dark') {
            state.theme.mode = 'system'
          } else {
            state.theme.mode = 'light'
          }
        }),

      // Sidebar actions
      toggleSidebar: () =>
        set((state) => {
          state.sidebar.isCollapsed = !state.sidebar.isCollapsed
        }),

      setSidebarCollapsed: (collapsed) =>
        set((state) => {
          state.sidebar.isCollapsed = collapsed
        }),

      setSidebarMobile: (isMobile) =>
        set((state) => {
          state.sidebar.isMobile = isMobile
        }),

      // Search actions
      setSearchQuery: (query) =>
        set((state) => {
          state.searchQuery = query
        }),

      clearSearchQuery: () =>
        set((state) => {
          state.searchQuery = ''
        }),

      // Notification actions
      setNotificationsOpen: (isOpen) =>
        set((state) => {
          state.notifications.isOpen = isOpen
        }),

      setUnreadCount: (count) =>
        set((state) => {
          state.notifications.unreadCount = count
        }),

      // Modal actions
      openModal: (modalId) =>
        set((state) => {
          state.modals[modalId] = true
        }),

      closeModal: (modalId) =>
        set((state) => {
          state.modals[modalId] = false
        }),

      toggleModal: (modalId) =>
        set((state) => {
          state.modals[modalId] = !state.modals[modalId]
        }),

      closeAllModals: () =>
        set((state) => {
          Object.keys(state.modals).forEach((key) => {
            state.modals[key] = false
          })
        }),
    })),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebar: {
          isCollapsed: state.sidebar.isCollapsed,
        },
      }),
    }
  )
)

// Selectors for optimized re-renders
export const useTheme = () => useUIStore((state) => state.theme)
export const useSidebar = () => useUIStore((state) => state.sidebar)
export const useSearchQuery = () => useUIStore((state) => state.searchQuery)
export const useNotifications = () => useUIStore((state) => state.notifications)
export const useModal = (modalId: string) => useUIStore((state) => state.modals[modalId] || false)