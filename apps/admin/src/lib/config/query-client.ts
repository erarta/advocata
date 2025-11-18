import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: true,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query keys factory
export const queryKeys = {
  // Lawyers
  lawyers: {
    all: ['lawyers'] as const,
    lists: () => [...queryKeys.lawyers.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.lawyers.lists(), filters] as const,
    pending: () => [...queryKeys.lawyers.all, 'pending'] as const,
    detail: (id: string) => [...queryKeys.lawyers.all, 'detail', id] as const,
    performance: (period: string) =>
      [...queryKeys.lawyers.all, 'performance', period] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.users.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    subscriptions: (id: string) => [...queryKeys.users.all, 'subscriptions', id] as const,
    consultations: (id: string, params: unknown) =>
      [...queryKeys.users.all, 'consultations', id, params] as const,
    payments: (id: string, params: unknown) =>
      [...queryKeys.users.all, 'payments', id, params] as const,
    activity: (id: string, params: unknown) =>
      [...queryKeys.users.all, 'activity', id, params] as const,
    stats: () => [...queryKeys.users.all, 'stats'] as const,
  },

  // Consultations
  consultations: {
    all: ['consultations'] as const,
    lists: () => [...queryKeys.consultations.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.consultations.lists(), filters] as const,
    live: () => [...queryKeys.consultations.all, 'live'] as const,
    disputes: () => [...queryKeys.consultations.all, 'disputes'] as const,
    emergencyCalls: () => [...queryKeys.consultations.all, 'emergency-calls'] as const,
    detail: (id: string) => [...queryKeys.consultations.all, 'detail', id] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    revenue: (period: string) => [...queryKeys.analytics.all, 'revenue', period] as const,
    users: (period: string) => [...queryKeys.analytics.all, 'users', period] as const,
    lawyers: (period: string) => [...queryKeys.analytics.all, 'lawyers', period] as const,
    platform: (period: string) =>
      [...queryKeys.analytics.all, 'platform', period] as const,
  },

  // Financial
  financial: {
    all: ['financial'] as const,
    payouts: (filters: unknown) => [...queryKeys.financial.all, 'payouts', filters] as const,
    refunds: (filters: unknown) => [...queryKeys.financial.all, 'refunds', filters] as const,
    transactions: (filters: unknown) =>
      [...queryKeys.financial.all, 'transactions', filters] as const,
    settings: () => [...queryKeys.financial.all, 'settings'] as const,
  },

  // Content
  content: {
    all: ['content'] as const,
    documents: () => [...queryKeys.content.all, 'documents'] as const,
    pages: () => [...queryKeys.content.all, 'pages'] as const,
    faq: () => [...queryKeys.content.all, 'faq'] as const,
    onboarding: () => [...queryKeys.content.all, 'onboarding'] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    platform: () => [...queryKeys.settings.all, 'platform'] as const,
    features: () => [...queryKeys.settings.all, 'features'] as const,
    notifications: () => [...queryKeys.settings.all, 'notifications'] as const,
    admins: () => [...queryKeys.settings.all, 'admins'] as const,
  },

  // Support
  support: {
    all: ['support'] as const,
    tickets: (filters: unknown) => [...queryKeys.support.all, 'tickets', filters] as const,
    ticket: (id: string) => [...queryKeys.support.all, 'ticket', id] as const,
    moderation: {
      messages: (filters: unknown) =>
        [...queryKeys.support.all, 'moderation', 'messages', filters] as const,
      reviews: (filters: unknown) =>
        [...queryKeys.support.all, 'moderation', 'reviews', filters] as const,
    },
  },
};
