# Advocata Admin Panel - Technical Specification

**Version:** 1.0  
**Date:** November 18, 2025  
**Status:** Design Phase (Priority 7)

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Routing Configuration](#routing-configuration)
3. [State Management](#state-management)
4. [API Integration Patterns](#api-integration-patterns)
5. [Security Implementation](#security-implementation)
6. [Performance Optimization](#performance-optimization)
7. [Error Handling](#error-handling)
8. [Testing Strategy](#testing-strategy)
9. [Build & Deployment](#build--deployment)
10. [Code Standards](#code-standards)

---

## Project Structure

### Complete File & Folder Structure

```
apps/admin/
├── .env.local                    # Local environment variables
├── .env.example                  # Environment template
├── .eslintrc.json                # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS configuration
├── Dockerfile                    # Docker container config
├── .dockerignore                 # Docker ignore file
│
├── public/                       # Static assets
│   ├── images/
│   │   ├── logo.svg
│   │   ├── logo-dark.svg
│   │   └── placeholder-avatar.png
│   ├── icons/
│   │   └── favicon.ico
│   └── fonts/
│
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout
│   │   ├── error.tsx             # Global error boundary
│   │   ├── loading.tsx           # Global loading state
│   │   ├── not-found.tsx         # 404 page
│   │   ├── page.tsx              # Root redirect
│   │   │
│   │   ├── (auth)/               # Authentication route group
│   │   │   ├── layout.tsx        # Auth layout (centered, no sidebar)
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   └── loading.tsx
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx
│   │   │   └── reset-password/
│   │   │       └── page.tsx
│   │   │
│   │   ├── (dashboard)/          # Main dashboard route group
│   │   │   ├── layout.tsx        # Dashboard layout (sidebar + header)
│   │   │   ├── page.tsx          # Dashboard home
│   │   │   ├── loading.tsx       # Dashboard loading
│   │   │   │
│   │   │   ├── lawyers/          # MODULE A
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx      # Lawyers directory
│   │   │   │   ├── pending/
│   │   │   │   │   ├── page.tsx  # Pending verifications
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx  # Verification detail
│   │   │   │   │       └── loading.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx  # Lawyer profile
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── loading.tsx
│   │   │   │   └── performance/
│   │   │   │       └── page.tsx  # Performance dashboard
│   │   │   │
│   │   │   ├── users/            # MODULE B
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx      # Users directory
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx  # User profile
│   │   │   │   │   ├── subscriptions/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── loading.tsx
│   │   │   │   └── loading.tsx
│   │   │   │
│   │   │   ├── consultations/    # MODULE C
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx      # Consultations history
│   │   │   │   ├── live/
│   │   │   │   │   └── page.tsx  # Live monitor
│   │   │   │   ├── disputes/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── emergency-calls/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx  # Consultation detail
│   │   │   │   │   └── loading.tsx
│   │   │   │   └── loading.tsx
│   │   │   │
│   │   │   ├── analytics/        # MODULE D
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx      # Analytics overview
│   │   │   │   ├── revenue/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── lawyers/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── reports/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── content/          # MODULE E
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── documents/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx
│   │   │   │   ├── pages/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── faq/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── onboarding/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [slideId]/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── financial/        # MODULE F
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── payouts/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── refunds/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── transactions/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── settings/         # MODULE G
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── general/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── features/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── notifications/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── api/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── admins/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── support/          # MODULE H
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   ├── tickets/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── moderation/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── messages/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── reviews/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── complaints/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   └── unauthorized/
│   │   │       └── page.tsx      # 403 page
│   │   │
│   │   └── api/                  # API routes (if needed)
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── card.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── popover.tsx
│   │   │   ├── alert-dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── calendar.tsx
│   │   │   └── command.tsx
│   │   │
│   │   ├── layouts/              # Layout components
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   ├── breadcrumbs.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   └── user-menu.tsx
│   │   │
│   │   ├── lawyers/              # Lawyer-specific components
│   │   │   ├── lawyer-table.tsx
│   │   │   ├── lawyer-card.tsx
│   │   │   ├── lawyer-filters.tsx
│   │   │   ├── verification-form.tsx
│   │   │   ├── verification-workflow.tsx
│   │   │   ├── document-viewer.tsx
│   │   │   ├── document-list.tsx
│   │   │   ├── lawyer-stats.tsx
│   │   │   ├── lawyer-stats-card.tsx
│   │   │   ├── performance-chart.tsx
│   │   │   ├── specialization-badge.tsx
│   │   │   └── lawyer-status-badge.tsx
│   │   │
│   │   ├── users/                # User-specific components
│   │   │   ├── user-table.tsx
│   │   │   ├── user-card.tsx
│   │   │   ├── user-filters.tsx
│   │   │   ├── user-profile.tsx
│   │   │   ├── subscription-card.tsx
│   │   │   ├── subscription-manager.tsx
│   │   │   ├── user-stats.tsx
│   │   │   ├── activity-timeline.tsx
│   │   │   └── user-status-badge.tsx
│   │   │
│   │   ├── consultations/        # Consultation components
│   │   │   ├── consultation-table.tsx
│   │   │   ├── consultation-card.tsx
│   │   │   ├── consultation-filters.tsx
│   │   │   ├── live-monitor.tsx
│   │   │   ├── live-consultation-card.tsx
│   │   │   ├── consultation-detail.tsx
│   │   │   ├── consultation-timeline.tsx
│   │   │   ├── dispute-card.tsx
│   │   │   ├── dispute-resolution-form.tsx
│   │   │   ├── emergency-call-card.tsx
│   │   │   ├── emergency-call-map.tsx
│   │   │   ├── chat-transcript.tsx
│   │   │   ├── video-player.tsx
│   │   │   └── consultation-status-badge.tsx
│   │   │
│   │   ├── analytics/            # Analytics components
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── user-growth-chart.tsx
│   │   │   ├── lawyer-performance-chart.tsx
│   │   │   ├── kpi-card.tsx
│   │   │   ├── stat-card.tsx
│   │   │   ├── comparison-card.tsx
│   │   │   ├── trend-indicator.tsx
│   │   │   ├── period-selector.tsx
│   │   │   ├── chart-legend.tsx
│   │   │   ├── report-generator.tsx
│   │   │   └── export-button.tsx
│   │   │
│   │   ├── financial/            # Financial components
│   │   │   ├── payout-table.tsx
│   │   │   ├── payout-card.tsx
│   │   │   ├── refund-form.tsx
│   │   │   ├── refund-table.tsx
│   │   │   ├── transaction-list.tsx
│   │   │   ├── transaction-detail.tsx
│   │   │   ├── payment-method-card.tsx
│   │   │   ├── commission-calculator.tsx
│   │   │   └── financial-summary.tsx
│   │   │
│   │   ├── content/              # Content management components
│   │   │   ├── document-template-editor.tsx
│   │   │   ├── template-list.tsx
│   │   │   ├── rich-text-editor.tsx
│   │   │   ├── variable-inserter.tsx
│   │   │   ├── page-editor.tsx
│   │   │   ├── faq-editor.tsx
│   │   │   ├── onboarding-slide-editor.tsx
│   │   │   └── content-preview.tsx
│   │   │
│   │   ├── support/              # Support components
│   │   │   ├── ticket-table.tsx
│   │   │   ├── ticket-card.tsx
│   │   │   ├── ticket-detail.tsx
│   │   │   ├── ticket-reply-form.tsx
│   │   │   ├── message-moderation-card.tsx
│   │   │   ├── review-moderation-card.tsx
│   │   │   ├── complaint-card.tsx
│   │   │   └── priority-badge.tsx
│   │   │
│   │   └── common/               # Shared components
│   │       ├── data-table.tsx
│   │       ├── data-table-pagination.tsx
│   │       ├── data-table-toolbar.tsx
│   │       ├── search-input.tsx
│   │       ├── filter-popover.tsx
│   │       ├── date-range-picker.tsx
│   │       ├── date-picker.tsx
│   │       ├── time-picker.tsx
│   │       ├── status-badge.tsx
│   │       ├── priority-badge.tsx
│   │       ├── avatar-with-fallback.tsx
│   │       ├── empty-state.tsx
│   │       ├── loading-spinner.tsx
│   │       ├── loading-skeleton.tsx
│   │       ├── error-boundary.tsx
│   │       ├── confirmation-dialog.tsx
│   │       ├── form-wrapper.tsx
│   │       ├── page-header.tsx
│   │       ├── page-title.tsx
│   │       ├── stats-grid.tsx
│   │       ├── action-menu.tsx
│   │       ├── file-upload.tsx
│   │       ├── image-upload.tsx
│   │       └── currency-input.tsx
│   │
│   ├── lib/                      # Business logic & utilities
│   │   ├── api/                  # API client
│   │   │   ├── client.ts         # Axios instance
│   │   │   ├── auth.ts           # Auth endpoints
│   │   │   ├── lawyers.ts        # Lawyer endpoints
│   │   │   ├── users.ts          # User endpoints
│   │   │   ├── consultations.ts  # Consultation endpoints
│   │   │   ├── analytics.ts      # Analytics endpoints
│   │   │   ├── payments.ts       # Payment endpoints
│   │   │   ├── financial.ts      # Financial endpoints
│   │   │   ├── content.ts        # Content endpoints
│   │   │   ├── settings.ts       # Settings endpoints
│   │   │   ├── support.ts        # Support endpoints
│   │   │   └── types.ts          # API types
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── use-lawyers.ts
│   │   │   ├── use-users.ts
│   │   │   ├── use-consultations.ts
│   │   │   ├── use-analytics.ts
│   │   │   ├── use-financial.ts
│   │   │   ├── use-content.ts
│   │   │   ├── use-settings.ts
│   │   │   ├── use-support.ts
│   │   │   ├── use-auth.ts
│   │   │   ├── use-permissions.ts
│   │   │   ├── use-pagination.ts
│   │   │   ├── use-filters.ts
│   │   │   ├── use-sorting.ts
│   │   │   ├── use-debounce.ts
│   │   │   ├── use-media-query.ts
│   │   │   ├── use-local-storage.ts
│   │   │   ├── use-toast.ts
│   │   │   └── use-websocket.ts
│   │   │
│   │   ├── stores/               # Zustand stores
│   │   │   ├── auth-store.ts
│   │   │   ├── ui-store.ts
│   │   │   ├── filter-store.ts
│   │   │   ├── sidebar-store.ts
│   │   │   └── notification-store.ts
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── date-helpers.ts
│   │   │   ├── currency-helpers.ts
│   │   │   ├── string-helpers.ts
│   │   │   ├── array-helpers.ts
│   │   │   ├── file-helpers.ts
│   │   │   ├── cn.ts
│   │   │   ├── constants.ts
│   │   │   └── errors.ts
│   │   │
│   │   ├── types/                # TypeScript types
│   │   │   ├── index.ts
│   │   │   ├── lawyer.ts
│   │   │   ├── user.ts
│   │   │   ├── consultation.ts
│   │   │   ├── payment.ts
│   │   │   ├── analytics.ts
│   │   │   ├── content.ts
│   │   │   ├── settings.ts
│   │   │   ├── support.ts
│   │   │   └── api.ts
│   │   │
│   │   ├── validations/          # Zod schemas
│   │   │   ├── lawyer.ts
│   │   │   ├── user.ts
│   │   │   ├── consultation.ts
│   │   │   ├── payment.ts
│   │   │   ├── content.ts
│   │   │   └── settings.ts
│   │   │
│   │   └── config/               # Configuration
│   │       ├── env.ts
│   │       ├── routes.ts
│   │       ├── permissions.ts
│   │       ├── query-client.ts
│   │       └── websocket.ts
│   │
│   ├── styles/
│   │   └── globals.css           # Global styles + Tailwind
│   │
│   └── middleware.ts             # Next.js middleware (auth)
│
└── tests/                        # Tests
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## Routing Configuration

### Next.js App Router Setup

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin-token');
  const { pathname } = request.nextUrl;

  // Public routes
  const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // If no token and trying to access protected route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If has token and trying to access auth routes
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|images|icons).*)',
  ],
};
```

### Route Constants

```typescript
// src/lib/config/routes.ts

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
```

### Dynamic Route Handling

```typescript
// Example: app/(dashboard)/lawyers/[id]/page.tsx
import { notFound } from 'next/navigation';
import { LawyerProfile } from '@/components/lawyers/lawyer-profile';
import { getLawyer } from '@/lib/api/lawyers';

export default async function LawyerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const lawyer = await getLawyer(params.id);
  
  if (!lawyer) {
    notFound();
  }
  
  return <LawyerProfile lawyer={lawyer} />;
}

// Generate static params for dynamic routes (optional)
export async function generateStaticParams() {
  // Only for truly static pages
  // For admin panel, usually skip this
  return [];
}

// Metadata
export async function generateMetadata({ params }: { params: { id: string } }) {
  const lawyer = await getLawyer(params.id);
  
  return {
    title: `${lawyer.fullName} - Lawyer Profile`,
  };
}
```

---

## State Management

### TanStack Query Setup

```typescript
// src/lib/config/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time by resource type
      staleTime: 5 * 60 * 1000, // 5 minutes default
      
      // Cache time
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      
      // Refetch on window focus
      refetchOnWindowFocus: true,
      
      // Retry failed requests
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Don't refetch on mount if data is fresh
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
    list: (filters: any) => [...queryKeys.lawyers.lists(), filters] as const,
    pending: () => [...queryKeys.lawyers.all, 'pending'] as const,
    detail: (id: string) => [...queryKeys.lawyers.all, 'detail', id] as const,
    performance: (period: string) => [...queryKeys.lawyers.all, 'performance', period] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.users.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    subscriptions: (id: string) => [...queryKeys.users.all, 'subscriptions', id] as const,
  },
  
  // Consultations
  consultations: {
    all: ['consultations'] as const,
    lists: () => [...queryKeys.consultations.all, 'list'] as const,
    list: (filters: any) => [...queryKeys.consultations.lists(), filters] as const,
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
    platform: (period: string) => [...queryKeys.analytics.all, 'platform', period] as const,
  },
  
  // Financial
  financial: {
    all: ['financial'] as const,
    payouts: (filters: any) => [...queryKeys.financial.all, 'payouts', filters] as const,
    refunds: (filters: any) => [...queryKeys.financial.all, 'refunds', filters] as const,
    transactions: (filters: any) => [...queryKeys.financial.all, 'transactions', filters] as const,
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
    tickets: (filters: any) => [...queryKeys.support.all, 'tickets', filters] as const,
    ticket: (id: string) => [...queryKeys.support.all, 'ticket', id] as const,
    moderation: {
      messages: (filters: any) => [...queryKeys.support.all, 'moderation', 'messages', filters] as const,
      reviews: (filters: any) => [...queryKeys.support.all, 'moderation', 'reviews', filters] as const,
    },
  },
};
```

### Custom Hooks Examples

```typescript
// src/lib/hooks/use-lawyers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLawyers, getPendingLawyers, verifyLawyer } from '@/lib/api/lawyers';
import { queryKeys } from '@/lib/config/query-client';
import { toast } from '@/lib/hooks/use-toast';

export function useLawyers(filters: any) {
  return useQuery({
    queryKey: queryKeys.lawyers.list(filters),
    queryFn: () => getLawyers(filters),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function usePendingLawyers(filters: any) {
  return useQuery({
    queryKey: queryKeys.lawyers.pending(),
    queryFn: () => getPendingLawyers(filters),
    staleTime: 1 * 60 * 1000, // 1 minute (more dynamic)
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  });
}

export function useVerifyLawyer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      verifyLawyer(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.pending() });
      queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.detail(variables.id) });
      
      toast({
        title: 'Success',
        description: 'Lawyer verified successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to verify lawyer',
        variant: 'destructive',
      });
    },
  });
}

// Optimistic update example
export function useUpdateLawyer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      updateLawyer(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.lawyers.detail(id) });
      
      // Snapshot previous value
      const previousLawyer = queryClient.getQueryData(queryKeys.lawyers.detail(id));
      
      // Optimistically update
      queryClient.setQueryData(queryKeys.lawyers.detail(id), (old: any) => ({
        ...old,
        ...data,
      }));
      
      // Return context with snapshot
      return { previousLawyer };
    },
    
    // On error, roll back
    onError: (err, { id }, context) => {
      queryClient.setQueryData(
        queryKeys.lawyers.detail(id),
        context?.previousLawyer
      );
      
      toast({
        title: 'Error',
        description: 'Failed to update lawyer',
        variant: 'destructive',
      });
    },
    
    // Always refetch after error or success
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lawyers.detail(id) });
    },
  });
}
```

### Zustand Stores

```typescript
// src/lib/stores/auth-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  permissions: string[];
  avatar?: string;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: AdminUser) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'admin-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);

// src/lib/stores/ui-store.ts
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

// src/lib/stores/filter-store.ts
import { create } from 'zustand';

interface FilterState {
  lawyerFilters: Record<string, any>;
  userFilters: Record<string, any>;
  consultationFilters: Record<string, any>;
  setLawyerFilters: (filters: Record<string, any>) => void;
  setUserFilters: (filters: Record<string, any>) => void;
  setConsultationFilters: (filters: Record<string, any>) => void;
  resetLawyerFilters: () => void;
  resetUserFilters: () => void;
  resetConsultationFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  lawyerFilters: {},
  userFilters: {},
  consultationFilters: {},
  
  setLawyerFilters: (filters) => set({ lawyerFilters: filters }),
  setUserFilters: (filters) => set({ userFilters: filters }),
  setConsultationFilters: (filters) => set({ consultationFilters: filters }),
  
  resetLawyerFilters: () => set({ lawyerFilters: {} }),
  resetUserFilters: () => set({ userFilters: {} }),
  resetConsultationFilters: () => set({ consultationFilters: {} }),
}));
```

---

## API Integration Patterns

### Axios Configuration

```typescript
// src/lib/api/client.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/lib/stores/auth-store';
import { toast } from '@/lib/hooks/use-toast';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // 401 Unauthorized - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = useAuthStore.getState().token; // Get refresh token
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/admin/auth/refresh`, {
          refreshToken,
        });
        
        const { accessToken } = response.data;
        useAuthStore.getState().setToken(accessToken);
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // 403 Forbidden - No permission
    if (error.response?.status === 403) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to perform this action.',
        variant: 'destructive',
      });
      window.location.href = '/unauthorized';
    }
    
    // 404 Not Found
    if (error.response?.status === 404) {
      toast({
        title: 'Not Found',
        description: 'The requested resource was not found.',
        variant: 'destructive',
      });
    }
    
    // 500 Server Error
    if (error.response?.status && error.response.status >= 500) {
      toast({
        title: 'Server Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper functions
export async function get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

export async function put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

export async function patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

export async function del<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}
```

### API Endpoints Implementation

```typescript
// src/lib/api/lawyers.ts
import { get, post, patch } from './client';
import type { LawyerProfile, PendingLawyer, VerificationDecision } from '@/lib/types/lawyer';

export async function getLawyers(filters: any) {
  return get<{ items: LawyerProfile[]; total: number }>('/admin/lawyers', {
    params: filters,
  });
}

export async function getPendingLawyers(filters: any) {
  return get<{ items: PendingLawyer[]; total: number }>('/admin/lawyers/pending', {
    params: filters,
  });
}

export async function getLawyer(id: string) {
  return get<LawyerProfile>(`/admin/lawyers/${id}`);
}

export async function verifyLawyer(id: string, data: VerificationDecision) {
  return post<{ success: boolean; lawyer: LawyerProfile }>(
    `/admin/lawyers/${id}/verify`,
    data
  );
}

export async function updateLawyer(id: string, data: Partial<LawyerProfile>) {
  return patch<{ success: boolean; lawyer: LawyerProfile }>(
    `/admin/lawyers/${id}`,
    data
  );
}

export async function suspendLawyer(id: string, reason: string, duration?: number) {
  return post<{ success: boolean }>(
    `/admin/lawyers/${id}/suspend`,
    { reason, duration }
  );
}

export async function banLawyer(id: string, reason: string, permanent: boolean) {
  return post<{ success: boolean }>(
    `/admin/lawyers/${id}/ban`,
    { reason, permanent }
  );
}
```

---

## Security Implementation

### Permission System

```typescript
// src/lib/config/permissions.ts
export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
  FINANCE = 'finance',
  ANALYST = 'analyst',
}

export enum Permission {
  // Lawyer permissions
  LAWYER_VIEW = 'lawyer:view',
  LAWYER_VERIFY = 'lawyer:verify',
  LAWYER_BAN = 'lawyer:ban',
  LAWYER_EDIT = 'lawyer:edit',
  
  // User permissions
  USER_VIEW = 'user:view',
  USER_BAN = 'user:ban',
  USER_EDIT_SUBSCRIPTION = 'user:edit_subscription',
  
  // Consultation permissions
  CONSULTATION_VIEW = 'consultation:view',
  CONSULTATION_INTERVENE = 'consultation:intervene',
  CONSULTATION_REFUND = 'consultation:refund',
  
  // Financial permissions
  PAYMENT_VIEW = 'payment:view',
  PAYMENT_REFUND = 'payment:refund',
  PAYOUT_PROCESS = 'payout:process',
  
  // Content permissions
  CONTENT_VIEW = 'content:view',
  CONTENT_EDIT = 'content:edit',
  
  // Settings permissions
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_EDIT = 'settings:edit',
  
  // Analytics permissions
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // Support permissions
  SUPPORT_VIEW = 'support:view',
  SUPPORT_RESPOND = 'support:respond',
  
  // Moderation permissions
  MODERATION_VIEW = 'moderation:view',
  MODERATION_ACTION = 'moderation:action',
}

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [AdminRole.SUPER_ADMIN]: Object.values(Permission),
  
  [AdminRole.ADMIN]: [
    Permission.LAWYER_VIEW,
    Permission.LAWYER_VERIFY,
    Permission.LAWYER_EDIT,
    Permission.USER_VIEW,
    Permission.USER_EDIT_SUBSCRIPTION,
    Permission.CONSULTATION_VIEW,
    Permission.CONSULTATION_INTERVENE,
    Permission.PAYMENT_VIEW,
    Permission.CONTENT_VIEW,
    Permission.CONTENT_EDIT,
    Permission.ANALYTICS_VIEW,
    Permission.SUPPORT_VIEW,
    Permission.SUPPORT_RESPOND,
    Permission.MODERATION_VIEW,
    Permission.MODERATION_ACTION,
  ],
  
  [AdminRole.MODERATOR]: [
    Permission.LAWYER_VIEW,
    Permission.USER_VIEW,
    Permission.CONSULTATION_VIEW,
    Permission.SUPPORT_VIEW,
    Permission.SUPPORT_RESPOND,
    Permission.MODERATION_VIEW,
    Permission.MODERATION_ACTION,
  ],
  
  [AdminRole.SUPPORT]: [
    Permission.USER_VIEW,
    Permission.CONSULTATION_VIEW,
    Permission.SUPPORT_VIEW,
    Permission.SUPPORT_RESPOND,
  ],
  
  [AdminRole.FINANCE]: [
    Permission.PAYMENT_VIEW,
    Permission.PAYMENT_REFUND,
    Permission.PAYOUT_PROCESS,
    Permission.ANALYTICS_VIEW,
  ],
  
  [AdminRole.ANALYST]: [
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
  ],
};

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
```

### Permission Hook

```typescript
// src/lib/hooks/use-permissions.ts
import { useAuthStore } from '@/lib/stores/auth-store';
import { Permission, hasPermission as checkPermission } from '@/lib/config/permissions';

export function usePermission(permission: Permission): boolean {
  const { user } = useAuthStore();
  
  if (!user || !user.role) {
    return false;
  }
  
  return checkPermission(user.role, permission);
}

export function usePermissions(permissions: Permission[]): boolean[] {
  const { user } = useAuthStore();
  
  if (!user || !user.role) {
    return permissions.map(() => false);
  }
  
  return permissions.map(permission => checkPermission(user.role, permission));
}

export function useHasAnyPermission(permissions: Permission[]): boolean {
  const results = usePermissions(permissions);
  return results.some(result => result);
}

export function useHasAllPermissions(permissions: Permission[]): boolean {
  const results = usePermissions(permissions);
  return results.every(result => result);
}
```

### Protected Component

```typescript
// components/common/protected.tsx
import { ReactNode } from 'react';
import { usePermission } from '@/lib/hooks/use-permissions';
import { Permission } from '@/lib/config/permissions';

interface ProtectedProps {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Protected({ permission, children, fallback = null }: ProtectedProps) {
  const hasPermission = usePermission(permission);
  
  if (!hasPermission) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Usage:
// <Protected permission={Permission.LAWYER_VERIFY}>
//   <VerifyButton />
// </Protected>
```

---

## Performance Optimization

### Code Splitting & Lazy Loading

```typescript
// Lazy load heavy components
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/common/loading-spinner';

const AnalyticsPage = lazy(() => import('./analytics/page'));
const ChartComponent = lazy(() => import('./chart-component'));

export function SomeComponent() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ChartComponent />
    </Suspense>
  );
}
```

### Virtual Scrolling for Large Tables

```typescript
// components/common/virtualized-table.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualizedTable<T>({ data, renderRow }: {
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
}) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
    overscan: 5,
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderRow(data[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Debouncing & Throttling

```typescript
// src/lib/hooks/use-debounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Usage in search
export function SearchComponent() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  
  const { data } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () => api.search(debouncedSearch),
    enabled: debouncedSearch.length > 0,
  });
  
  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
}
```

### Image Optimization

```typescript
// Always use Next.js Image component
import Image from 'next/image';

export function LawyerAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      className="rounded-full"
      placeholder="blur"
      blurDataURL="/placeholder-avatar.png"
      loading="lazy"
    />
  );
}
```

### Memoization

```typescript
import { useMemo } from 'react';

export function ExpensiveComponent({ data }: { data: any[] }) {
  const processedData = useMemo(() => {
    // Expensive computation
    return data.map(item => ({
      ...item,
      calculated: expensiveCalculation(item),
    }));
  }, [data]);
  
  return <div>{/* Render processedData */}</div>;
}
```

---

## Error Handling

### Error Boundary

```typescript
// components/common/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Log to error tracking service (Sentry, etc.)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => this.setState({ hasError: false })}>
              Try again
            </Button>
          </div>
        )
      );
    }
    
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
// src/lib/utils/errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: any): never {
  if (error.response) {
    throw new APIError(
      error.response.data.message || 'An error occurred',
      error.response.status,
      error.response.data.code
    );
  }
  
  if (error.request) {
    throw new APIError('No response from server', 0, 'NETWORK_ERROR');
  }
  
  throw new APIError(error.message || 'An unexpected error occurred', 0);
}
```

---

## Testing Strategy

### Unit Tests (Vitest)

```typescript
// tests/unit/utils/formatters.test.ts
import { describe, it, expect } from 'vitest';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';

describe('formatCurrency', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1000)).toBe('1,000 ₽');
    expect(formatCurrency(1000.50)).toBe('1,000.50 ₽');
  });
  
  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('0 ₽');
  });
  
  it('should handle negative numbers', () => {
    expect(formatCurrency(-500)).toBe('-500 ₽');
  });
});
```

### Integration Tests

```typescript
// tests/integration/api/lawyers.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import { getLawyers, verifyLawyer } from '@/lib/api/lawyers';

describe('Lawyers API', () => {
  let testLawyerId: string;
  
  beforeAll(async () => {
    // Setup test data
  });
  
  it('should fetch lawyers', async () => {
    const result = await getLawyers({ page: 1, limit: 10 });
    expect(result.items).toBeInstanceOf(Array);
    expect(result.total).toBeGreaterThan(0);
  });
  
  it('should verify lawyer', async () => {
    const result = await verifyLawyer(testLawyerId, {
      decision: 'approved',
      verifiedDocuments: [],
      verificationNotes: 'Test verification',
    });
    expect(result.success).toBe(true);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/lawyer-verification.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Lawyer Verification Workflow', () => {
  test('should verify pending lawyer', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to pending lawyers
    await page.goto('/lawyers/pending');
    await expect(page).toHaveURL('/lawyers/pending');
    
    // Click on first pending lawyer
    await page.click('.lawyer-row:first-child .view-button');
    
    // Verify lawyer
    await page.check('[name="decision"][value="approved"]');
    await page.fill('[name="verificationNotes"]', 'All documents verified');
    await page.click('button:has-text("Submit Decision")');
    
    // Verify success message
    await expect(page.locator('text=Lawyer verified successfully')).toBeVisible();
  });
});
```

---

## Build & Deployment

### Next.js Configuration

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Output standalone for Docker
  output: 'standalone',
  
  // Image domains
  images: {
    domains: [
      'localhost',
      'api.advocata.ru',
      'storage.yandexcloud.net',
    ],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
  },
  
  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  
  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;
```

### Docker Configuration

```dockerfile
# apps/admin/Dockerfile (production-optimized)

FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 4000

ENV PORT 4000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## Code Standards

### ESLint Configuration

```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### Prettier Configuration

```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Naming Conventions

- **Components**: PascalCase (`LawyerTable.tsx`)
- **Hooks**: camelCase with "use" prefix (`useLawyers.ts`)
- **Utils**: camelCase (`formatCurrency.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Types/Interfaces**: PascalCase (`LawyerProfile`)
- **Files**: kebab-case for non-components (`api-client.ts`)

---

**Document Version:** 1.0  
**Last Updated:** November 18, 2025  
**Status:** Ready for Implementation (Priority 8)
