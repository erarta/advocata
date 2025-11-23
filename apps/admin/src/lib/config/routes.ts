export const ROUTES = {
  // Auth
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  // Dashboard
  DASHBOARD: '/dashboard',

  // Lawyers
  LAWYERS: '/lawyers',
  LAWYERS_PENDING: '/lawyers/pending',
  LAWYERS_PENDING_DETAIL: (id: string) => `/lawyers/pending/${id}`,
  LAWYERS_DETAIL: (id: string) => `/lawyers/${id}`,
  LAWYERS_EDIT: (id: string) => `/lawyers/${id}/edit`,
  LAWYERS_PERFORMANCE: '/lawyers/performance',

  // Users
  USERS: '/users',
  USERS_DETAIL: (id: string) => `/users/${id}`,
  USERS_SUBSCRIPTIONS: (id: string) => `/users/${id}/subscriptions`,

  // Consultations
  CONSULTATIONS: '/consultations',
  CONSULTATIONS_LIVE: '/consultations/live',
  CONSULTATIONS_DISPUTES: '/consultations/disputes',
  CONSULTATIONS_DISPUTE_DETAIL: (id: string) => `/consultations/disputes/${id}`,
  CONSULTATIONS_EMERGENCY: '/consultations/emergency-calls',
  CONSULTATIONS_EMERGENCY_DETAIL: (id: string) => `/consultations/emergency-calls/${id}`,
  CONSULTATIONS_DETAIL: (id: string) => `/consultations/${id}`,

  // Analytics
  ANALYTICS: '/analytics',
  ANALYTICS_REVENUE: '/analytics/revenue',
  ANALYTICS_USERS: '/analytics/users',
  ANALYTICS_LAWYERS: '/analytics/lawyers',
  ANALYTICS_REPORTS: '/analytics/reports',
  ANALYTICS_REPORT_DETAIL: (id: string) => `/analytics/reports/${id}`,

  // Content
  CONTENT: '/content',
  CONTENT_DOCUMENTS: '/content/documents',
  CONTENT_DOCUMENT_DETAIL: (id: string) => `/content/documents/${id}`,
  CONTENT_PAGES: '/content/pages',
  CONTENT_FAQ: '/content/faq',
  CONTENT_ONBOARDING: '/content/onboarding',

  // Financial
  FINANCIAL: '/financial',
  FINANCIAL_PAYOUTS: '/financial/payouts',
  FINANCIAL_PAYOUT_DETAIL: (id: string) => `/financial/payouts/${id}`,
  FINANCIAL_REFUNDS: '/financial/refunds',
  FINANCIAL_TRANSACTIONS: '/financial/transactions',
  FINANCIAL_SETTINGS: '/financial/settings',

  // Settings
  SETTINGS: '/settings',
  SETTINGS_GENERAL: '/settings/general',
  SETTINGS_FEATURES: '/settings/features',
  SETTINGS_NOTIFICATIONS: '/settings/notifications',
  SETTINGS_API: '/settings/api',
  SETTINGS_ADMINS: '/settings/admins',
  SETTINGS_ADMIN_DETAIL: (id: string) => `/settings/admins/${id}`,

  // Support
  SUPPORT: '/support',
  SUPPORT_TICKETS: '/support/tickets',
  SUPPORT_TICKET_DETAIL: (id: string) => `/support/tickets/${id}`,
  SUPPORT_MODERATION: '/support/moderation',
  SUPPORT_MODERATION_MESSAGES: '/support/moderation/messages',
  SUPPORT_MODERATION_REVIEWS: '/support/moderation/reviews',
  SUPPORT_COMPLAINTS: '/support/complaints',

  // Other
  UNAUTHORIZED: '/unauthorized',
} as const;
