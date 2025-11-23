# Advocata Admin Panel - System Architecture

**Version:** 1.0  
**Date:** November 18, 2025  
**Status:** Design Phase (Priority 7)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack](#technology-stack)
3. [System Architecture Overview](#system-architecture-overview)
4. [Module Breakdown](#module-breakdown)
5. [Component Hierarchy](#component-hierarchy)
6. [Data Flow Architecture](#data-flow-architecture)
7. [Security Architecture](#security-architecture)
8. [Performance & Scalability](#performance--scalability)
9. [Integration Architecture](#integration-architecture)
10. [Deployment Architecture](#deployment-architecture)

---

## Executive Summary

The Advocata Admin Panel is a comprehensive web-based administration system designed to manage all aspects of the lawyer marketplace platform. It serves as the central control center for:

- **Lawyer verification and management** (highest priority workflow)
- **User and consultation oversight**
- **Financial operations and commission tracking**
- **Content management and platform configuration**
- **Real-time monitoring and analytics**

### Key Design Goals

1. **Efficiency**: Streamline lawyer verification and approval workflows
2. **Scalability**: Handle 10,000+ users and 1,000+ lawyers
3. **Security**: Role-based access control with comprehensive audit logging
4. **Compliance**: Full 152-ФЗ compliance for Russian data localization
5. **Performance**: Sub-2-second page loads, real-time updates where critical
6. **Usability**: Intuitive interface for admin operations

---

## Technology Stack

### Frontend Framework & Core Libraries

```typescript
// Core Framework
Next.js 14.1.0          // App Router (RSC + Server Actions)
React 18.2.0            // UI library
TypeScript 5.3.3        // Type safety

// Already Installed (from package.json analysis)
├─ @tanstack/react-query 5.17.19    // Server state management
├─ @tanstack/react-table 8.11.2     // Data tables
├─ zustand 4.4.7                     // Client state management
├─ axios 1.6.5                       // HTTP client
├─ recharts 2.10.3                   // Data visualization
├─ lucide-react 0.309.0              // Icon library
├─ react-hook-form 7.49.3            // Form management
├─ @hookform/resolvers 3.3.4         // Form validation
└─ zod 3.22.4                        // Schema validation
```

### Additional Required Dependencies

```json
{
  "dependencies": {
    // UI Components (Shadcn UI - already configured with Tailwind)
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-tooltip": "^1.0.7",
    
    // Data & State
    "immer": "^10.0.3",                    // Immutable updates
    "react-use": "^17.4.2",                // React hooks collection
    
    // Real-time
    "socket.io-client": "^4.6.1",          // WebSocket client
    
    // Date/Time
    "date-fns": "^3.0.6",                  // Already installed
    "date-fns-tz": "^2.0.0",               // Timezone support
    
    // File handling
    "react-dropzone": "^14.2.3",           // File uploads
    "file-saver": "^2.0.5",                // File downloads
    
    // Export/Reports
    "xlsx": "^0.18.5",                     // Excel export
    "jspdf": "^2.5.1",                     // PDF generation
    "jspdf-autotable": "^3.8.0",           // PDF tables
    
    // Rich Text Editor
    "@tiptap/react": "^2.1.13",            // Rich text editor
    "@tiptap/starter-kit": "^2.1.13",
    
    // Utilities
    "clsx": "^2.1.0",                      // Already installed
    "tailwind-merge": "^2.2.0",            // Already installed
    "class-variance-authority": "^0.7.0",  // Already installed
    "nanoid": "^5.0.4",                    // ID generation
    "currency.js": "^2.0.4"                // Currency handling
  },
  "devDependencies": {
    "@types/file-saver": "^2.0.7",
    "@types/node": "^20.10.6"              // Already installed
  }
}
```

### Technology Justification

#### Why Next.js 14 App Router?

1. **Server Components**: Reduce client bundle, fetch data on server
2. **Server Actions**: Type-safe mutations without API routes
3. **Streaming**: Progressive rendering for large datasets
4. **Built-in Optimization**: Image, font, script optimization
5. **File-based Routing**: Intuitive structure matching features

#### Why TanStack Query (React Query)?

1. **Caching Strategy**: Automatic background refetching
2. **Optimistic Updates**: Instant UI feedback
3. **Pagination & Infinite Scroll**: Built-in support
4. **Mutation Management**: Error handling, retry logic
5. **DevTools**: Excellent debugging experience

#### Why Zustand over Redux?

1. **Simplicity**: Minimal boilerplate
2. **Performance**: Selective re-renders
3. **Size**: ~1KB vs Redux ~10KB
4. **TypeScript**: Excellent TS support
5. **Use Case**: Perfect for UI state (filters, modals, etc.)

#### Why Shadcn UI?

1. **Copy-paste Components**: No dependency bloat
2. **Customizable**: Full control over code
3. **Accessible**: Built on Radix UI primitives
4. **Tailwind-native**: Consistent styling
5. **Production-ready**: Used by Vercel, Cal.com

#### Why Recharts?

1. **React-first**: Declarative API
2. **Responsive**: Mobile-friendly
3. **Customizable**: Full control over appearance
4. **Performance**: Handles large datasets
5. **TypeScript**: Full type support

---

## System Architecture Overview

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ADMIN PANEL CLIENT                            │
│                        (Next.js 14 - RSC)                            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    PRESENTATION LAYER                           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │Dashboard │  │ Lawyers  │  │  Users   │  │Analytics │       │ │
│  │  │  Pages   │  │  Pages   │  │  Pages   │  │  Pages   │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │ │
│  │                                                                 │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │Consults  │  │ Content  │  │Financial │  │ Support  │       │ │
│  │  │  Pages   │  │  Pages   │  │  Pages   │  │  Pages   │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                     UI COMPONENT LAYER                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │  Tables  │  │  Forms   │  │  Charts  │  │  Modals  │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │  Cards   │  │  Badges  │  │  Alerts  │  │  Loaders │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                    STATE MANAGEMENT LAYER                       │ │
│  │                                                                 │ │
│  │  ┌──────────────────┐              ┌─────────────────────┐     │ │
│  │  │  TanStack Query  │              │      Zustand        │     │ │
│  │  │  (Server State)  │              │   (Client State)    │     │ │
│  │  │                  │              │                     │     │ │
│  │  │ • Lawyers        │              │ • UI Filters        │     │ │
│  │  │ • Users          │              │ • Modal State       │     │ │
│  │  │ • Consultations  │              │ • Sidebar State     │     │ │
│  │  │ • Analytics      │              │ • Theme/Locale      │     │ │
│  │  │ • Payments       │              │ • Current Admin     │     │ │
│  │  └──────────────────┘              └─────────────────────┘     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      API CLIENT LAYER                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │ │
│  │  │    Axios     │  │  WebSocket   │  │    Utils     │         │ │
│  │  │   Instance   │  │   Client     │  │ (Formatters) │         │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘         │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTPS + JWT Auth
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND API (NestJS)                            │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      API GATEWAY LAYER                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │   Auth   │  │  RBAC    │  │   Rate   │  │  Request │       │ │
│  │  │  Guard   │  │  Guard   │  │  Limit   │  │  Logger  │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      CONTROLLER LAYER                           │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │  Lawyer  │  │   User   │  │  Consult │  │ Payment  │       │ │
│  │  │   REST   │  │   REST   │  │   REST   │  │   REST   │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │ Document │  │Emergency │  │ Analytics│  │  Admin   │       │ │
│  │  │   REST   │  │   REST   │  │   REST   │  │   REST   │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                   APPLICATION LAYER (CQRS)                      │ │
│  │  ┌──────────────────┐              ┌──────────────────┐        │ │
│  │  │    Commands      │              │     Queries      │        │ │
│  │  │  (Write Side)    │              │   (Read Side)    │        │ │
│  │  │                  │              │                  │        │ │
│  │  │ • Verify Lawyer  │              │ • Search Users   │        │ │
│  │  │ • Ban User       │              │ • Get Analytics  │        │ │
│  │  │ • Process Refund │              │ • List Lawyers   │        │ │
│  │  └──────────────────┘              └──────────────────┘        │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                      DOMAIN LAYER (DDD)                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │  Lawyer  │  │   User   │  │  Payment │  │ Document │       │ │
│  │  │  Entity  │  │  Entity  │  │  Entity  │  │  Entity  │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                   INFRASTRUCTURE LAYER                          │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │ │
│  │  │Supabase/ │  │  Redis   │  │  BullMQ  │  │  File    │       │ │
│  │  │Postgres  │  │  Cache   │  │  Queue   │  │ Storage  │       │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### Architecture Layers Explained

#### 1. Presentation Layer (Next.js Pages)
- **Responsibility**: UI rendering, user interaction, routing
- **Technology**: Next.js App Router, React Server Components
- **Pattern**: Page-based routing with nested layouts
- **Data Fetching**: Server Components for initial data, Client Components for interactions

#### 2. UI Component Layer (Shadcn UI + Custom)
- **Responsibility**: Reusable UI components
- **Technology**: Radix UI primitives + Tailwind CSS
- **Pattern**: Atomic design (atoms, molecules, organisms)
- **Variants**: CVA (Class Variance Authority) for component variants

#### 3. State Management Layer
- **Server State (TanStack Query)**: API data, caching, background updates
- **Client State (Zustand)**: UI state, filters, modals, preferences
- **Pattern**: Separation of concerns between server and client state

#### 4. API Client Layer
- **HTTP Client**: Axios with interceptors for auth, error handling
- **WebSocket Client**: Socket.IO for real-time updates
- **Utilities**: Date formatters, currency formatters, validators

---

## Module Breakdown

The admin panel is organized into 8 primary functional modules:

### Module Map

```
┌──────────────────────────────────────────────────────────────────┐
│                      ADMIN PANEL MODULES                          │
│                                                                   │
│  ┌─────────────────┐  Priority: 1 (CRITICAL)                     │
│  │  A. Lawyer      │  • Pending verifications queue              │
│  │     Management  │  • Document verification workflow           │
│  │                 │  • Lawyer directory & search                │
│  └─────────────────┘  • Performance metrics                      │
│                                                                   │
│  ┌─────────────────┐  Priority: 2                                │
│  │  B. User        │  • User search & profiles                   │
│  │     Management  │  • Subscription management                  │
│  │                 │  • Ban/suspend functionality                │
│  └─────────────────┘  • Activity tracking                        │
│                                                                   │
│  ┌─────────────────┐  Priority: 2                                │
│  │  C. Consultation│  • Live consultations monitor               │
│  │     Dashboard   │  • History & search                         │
│  │                 │  • Dispute resolution                       │
│  └─────────────────┘  • Emergency calls tracking                 │
│                                                                   │
│  ┌─────────────────┐  Priority: 1                                │
│  │  D. Analytics & │  • Revenue dashboard                        │
│  │     Reporting   │  • User growth metrics                      │
│  │                 │  • Lawyer performance KPIs                  │
│  └─────────────────┘  • Custom reports                           │
│                                                                   │
│  ┌─────────────────┐  Priority: 3                                │
│  │  E. Content     │  • Document templates CRUD                  │
│  │     Management  │  • Legal information pages                  │
│  │                 │  • FAQ management                           │
│  └─────────────────┘  • Onboarding content                       │
│                                                                   │
│  ┌─────────────────┐  Priority: 2                                │
│  │  F. Financial   │  • Commission configuration                 │
│  │     Management  │  • Payout management                        │
│  │                 │  • Refund processing                        │
│  └─────────────────┘  • Financial reports                        │
│                                                                   │
│  ┌─────────────────┐  Priority: 3                                │
│  │  G. System      │  • Platform configuration                   │
│  │     Settings    │  • Feature flags                            │
│  │                 │  • Notification templates                   │
│  └─────────────────┘  • API settings                             │
│                                                                   │
│  ┌─────────────────┐  Priority: 2                                │
│  │  H. Support &   │  • Support ticket system                    │
│  │     Moderation  │  • Chat moderation                          │
│  │                 │  • Review moderation                        │
│  └─────────────────┘  • Complaint handling                       │
└──────────────────────────────────────────────────────────────────┘
```

### Module Responsibilities Matrix

| Module | Primary Functions | Data Entities | Critical Operations |
|--------|------------------|---------------|---------------------|
| **Lawyer Management** | Verification, Directory, Performance | Lawyers, Documents, Specializations | Approve/Reject, Ban, Update Profile |
| **User Management** | Search, Profiles, Subscriptions | Users, Subscriptions, Activity Logs | Ban/Unban, Manage Subscription |
| **Consultation Dashboard** | Monitoring, History, Disputes | Consultations, Emergency Calls | Intervene, Refund, View Session |
| **Analytics & Reporting** | Dashboards, KPIs, Reports | Aggregated Data, Metrics | Generate Report, Export Data |
| **Content Management** | Templates, Pages, FAQs | Document Templates, Content Pages | Create/Update/Delete Content |
| **Financial Management** | Commissions, Payouts, Refunds | Payments, Payouts, Transactions | Process Payout, Issue Refund |
| **System Settings** | Configuration, Features, Templates | Settings, Feature Flags | Update Config, Toggle Feature |
| **Support & Moderation** | Tickets, Chat Moderation, Reviews | Support Tickets, Messages, Reviews | Respond, Moderate, Ban User |

---

## Component Hierarchy

### Folder Structure

```
apps/admin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (dashboard)/              # Main admin route group
│   │   │   ├── layout.tsx            # Sidebar + Header layout
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   │
│   │   │   ├── lawyers/              # MODULE A: Lawyer Management
│   │   │   │   ├── page.tsx          # Lawyers directory
│   │   │   │   ├── pending/          # Pending verifications
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx  # Verification detail
│   │   │   │   ├── [id]/             # Lawyer detail
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── users/                # MODULE B: User Management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── consultations/        # MODULE C: Consultations
│   │   │   │   ├── page.tsx
│   │   │   │   ├── live/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── disputes/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── emergency-calls/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── analytics/            # MODULE D: Analytics
│   │   │   │   ├── page.tsx
│   │   │   │   ├── revenue/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── users/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── lawyers/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── reports/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── content/              # MODULE E: Content
│   │   │   │   ├── documents/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── pages/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── faq/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── onboarding/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── financial/            # MODULE F: Financial
│   │   │   │   ├── page.tsx
│   │   │   │   ├── payouts/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── refunds/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   │
│   │   │   ├── settings/             # MODULE G: System Settings
│   │   │   │   ├── page.tsx
│   │   │   │   ├── general/
│   │   │   │   ├── features/
│   │   │   │   ├── notifications/
│   │   │   │   └── api/
│   │   │   │
│   │   │   └── support/              # MODULE H: Support
│   │   │       ├── page.tsx
│   │   │       ├── tickets/
│   │   │       ├── moderation/
│   │   │       └── complaints/
│   │   │
│   │   ├── api/                      # API routes (if needed)
│   │   │   └── auth/
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── error.tsx                 # Error boundary
│   │   ├── loading.tsx               # Loading fallback
│   │   └── not-found.tsx             # 404 page
│   │
│   ├── components/                   # UI Components
│   │   ├── ui/                       # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layouts/                  # Layout components
│   │   │   ├── dashboard-layout.tsx
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── breadcrumbs.tsx
│   │   │
│   │   ├── lawyers/                  # Lawyer-specific components
│   │   │   ├── lawyer-table.tsx
│   │   │   ├── lawyer-card.tsx
│   │   │   ├── verification-form.tsx
│   │   │   ├── document-viewer.tsx
│   │   │   └── lawyer-stats.tsx
│   │   │
│   │   ├── users/                    # User-specific components
│   │   │   ├── user-table.tsx
│   │   │   ├── user-profile.tsx
│   │   │   └── subscription-card.tsx
│   │   │
│   │   ├── consultations/            # Consultation components
│   │   │   ├── consultation-table.tsx
│   │   │   ├── live-monitor.tsx
│   │   │   └── emergency-call-card.tsx
│   │   │
│   │   ├── analytics/                # Analytics components
│   │   │   ├── revenue-chart.tsx
│   │   │   ├── user-growth-chart.tsx
│   │   │   ├── kpi-card.tsx
│   │   │   └── report-generator.tsx
│   │   │
│   │   ├── financial/                # Financial components
│   │   │   ├── payout-table.tsx
│   │   │   ├── refund-form.tsx
│   │   │   └── transaction-list.tsx
│   │   │
│   │   └── common/                   # Shared components
│   │       ├── data-table.tsx        # Generic data table
│   │       ├── search-input.tsx
│   │       ├── date-range-picker.tsx
│   │       ├── status-badge.tsx
│   │       ├── avatar-with-fallback.tsx
│   │       ├── empty-state.tsx
│   │       └── loading-spinner.tsx
│   │
│   ├── lib/                          # Business logic & utilities
│   │   ├── api/                      # API client
│   │   │   ├── client.ts             # Axios instance
│   │   │   ├── lawyers.ts            # Lawyer endpoints
│   │   │   ├── users.ts              # User endpoints
│   │   │   ├── consultations.ts      # Consultation endpoints
│   │   │   ├── analytics.ts          # Analytics endpoints
│   │   │   ├── payments.ts           # Payment endpoints
│   │   │   └── settings.ts           # Settings endpoints
│   │   │
│   │   ├── hooks/                    # Custom React hooks
│   │   │   ├── use-lawyers.ts        # Lawyer data hooks
│   │   │   ├── use-users.ts          # User data hooks
│   │   │   ├── use-analytics.ts      # Analytics hooks
│   │   │   ├── use-pagination.ts     # Pagination hook
│   │   │   ├── use-debounce.ts       # Debounce hook
│   │   │   └── use-auth.ts           # Auth hook
│   │   │
│   │   ├── stores/                   # Zustand stores
│   │   │   ├── auth-store.ts         # Auth state
│   │   │   ├── ui-store.ts           # UI state (sidebar, modals)
│   │   │   └── filter-store.ts       # Filter state
│   │   │
│   │   ├── utils/                    # Utility functions
│   │   │   ├── formatters.ts         # Date, currency formatters
│   │   │   ├── validators.ts         # Validation helpers
│   │   │   ├── cn.ts                 # className merger
│   │   │   └── constants.ts          # Constants
│   │   │
│   │   ├── types/                    # TypeScript types
│   │   │   ├── lawyer.ts
│   │   │   ├── user.ts
│   │   │   ├── consultation.ts
│   │   │   ├── payment.ts
│   │   │   └── api.ts
│   │   │
│   │   └── config/                   # Configuration
│   │       ├── env.ts                # Environment variables
│   │       ├── routes.ts             # Route constants
│   │       └── permissions.ts        # RBAC permissions
│   │
│   ├── styles/
│   │   └── globals.css               # Global styles + Tailwind
│   │
│   └── middleware.ts                 # Auth middleware
│
├── public/
│   ├── images/
│   └── icons/
│
├── .env.local                        # Environment variables
├── .env.example                      # Env template
├── next.config.js                    # Next.js config
├── tailwind.config.js                # Tailwind config
├── tsconfig.json                     # TypeScript config
└── package.json                      # Dependencies
```

### Component Design Patterns

#### 1. Server Components (Default)
```tsx
// app/(dashboard)/lawyers/page.tsx
export default async function LawyersPage() {
  // Fetch data on server
  const lawyers = await fetchLawyers();
  
  return <LawyerTable initialData={lawyers} />;
}
```

#### 2. Client Components (Interactive)
```tsx
// components/lawyers/lawyer-table.tsx
'use client';

export function LawyerTable({ initialData }: Props) {
  const { data, isLoading } = useLawyers(initialData);
  // Client-side interactivity
}
```

#### 3. Composition Pattern
```tsx
// Complex components composed of smaller ones
<VerificationWorkflow>
  <DocumentViewer />
  <VerificationForm />
  <ActionButtons />
</VerificationWorkflow>
```

---

## Data Flow Architecture

### Request/Response Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACTION                               │
│              (Click, Submit, Search)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              REACT COMPONENT                                 │
│        (Event Handler / Form Submit)                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────┴────────────────┐
        │                                 │
        ▼                                 ▼
┌─────────────────┐            ┌─────────────────┐
│  QUERY HOOK     │            │  MUTATION HOOK  │
│ (TanStack Query)│            │ (TanStack Query)│
└────────┬────────┘            └────────┬────────┘
         │                              │
         │  Check Cache                 │  Optimistic Update
         │                              │
         ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   API CLIENT LAYER                           │
│              (Axios with Interceptors)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Add JWT      │  │ Handle Error │  │ Transform    │      │
│  │ Token        │  │ & Retry      │  │ Response     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP Request (GET/POST/PUT/DELETE)
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  BACKEND API (NestJS)                        │
│                                                              │
│  ┌────────────────────────────────────────────┐             │
│  │  Guards: Auth + RBAC + Rate Limit          │             │
│  └────────────────────────────────────────────┘             │
│  ┌────────────────────────────────────────────┐             │
│  │  Controllers: Route to Commands/Queries    │             │
│  └────────────────────────────────────────────┘             │
│  ┌────────────────────────────────────────────┐             │
│  │  CQRS: Commands (write) / Queries (read)   │             │
│  └────────────────────────────────────────────┘             │
│  ┌────────────────────────────────────────────┐             │
│  │  Domain Layer: Business Logic              │             │
│  └────────────────────────────────────────────┘             │
│  ┌────────────────────────────────────────────┐             │
│  │  Repository: Data Access                   │             │
│  └────────────────────────────────────────────┘             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL + Redis)                   │
│  ┌──────────────┐              ┌──────────────┐             │
│  │  PostgreSQL  │              │    Redis     │             │
│  │  (Main Data) │              │   (Cache)    │             │
│  └──────────────┘              └──────────────┘             │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ Response
                        ▼
                  (Reverse Flow)
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              TanStack Query Cache Update                     │
│         (Invalidate, Refetch, Optimistic Update)             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              REACT COMPONENT RE-RENDER                       │
│                    (UI Update)                               │
└─────────────────────────────────────────────────────────────┘
```

### Real-Time Data Flow (WebSocket)

```
┌─────────────────────────────────────────────────────────────┐
│              BACKEND EVENT OCCURS                            │
│       (New consultation, lawyer verified, etc.)              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              EVENT EMITTER (NestJS)                          │
│          Publish to WebSocket Gateway                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ WebSocket Message
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          ADMIN PANEL - WebSocket Client                      │
│              (Socket.IO Client)                              │
│                                                              │
│  socket.on('lawyer:verified', (data) => {                   │
│    queryClient.invalidateQueries(['lawyers', 'pending']);   │
│    toast.success('Lawyer verified');                        │
│  });                                                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         TanStack Query Cache Invalidation                    │
│              (Automatic Refetch)                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              UI UPDATE (Real-time)                           │
│         Table refreshes, notification appears                │
└─────────────────────────────────────────────────────────────┘
```

### Caching Strategy

```typescript
// TanStack Query Configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Keep in cache for 10 minutes
      cacheTime: 10 * 60 * 1000,
      
      // Refetch on window focus
      refetchOnWindowFocus: true,
      
      // Retry failed requests
      retry: 3,
      
      // Retry delay
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

// Custom cache times per resource
const CACHE_CONFIG = {
  // Static data - cache longer
  lawyers: { staleTime: 10 * 60 * 1000 },
  users: { staleTime: 10 * 60 * 1000 },
  
  // Dynamic data - cache shorter
  consultations: { staleTime: 1 * 60 * 1000 },
  liveConsultations: { staleTime: 30 * 1000 },
  
  // Analytics - cache moderately
  analytics: { staleTime: 5 * 60 * 1000 },
  
  // Settings - cache long
  settings: { staleTime: 30 * 60 * 1000 },
};
```

---

## Security Architecture

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN LOGIN                               │
│          (Email + Password / SSO)                            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE AUTH                                   │
│         Validate credentials                                 │
│         Check admin role                                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Success
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          RETURN JWT ACCESS TOKEN                             │
│          + REFRESH TOKEN                                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         STORE IN HTTP-ONLY COOKIE                            │
│      (Prevent XSS attacks)                                   │
│         + Store user in Zustand                              │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│         SUBSEQUENT REQUESTS                                  │
│    Axios interceptor adds token                              │
│    Middleware validates on protected routes                  │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ Token Expiry
                        ▼
┌─────────────────────────────────────────────────────────────┐
│          AUTO REFRESH TOKEN                                  │
│    Use refresh token to get new access token                 │
└─────────────────────────────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

```typescript
// Permission System
enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
  FINANCE = 'finance',
  ANALYST = 'analyst',
}

enum Permission {
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

// Role to Permission mapping
const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
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

// Permission checking hook
function usePermission(permission: Permission): boolean {
  const { user } = useAuthStore();
  const userPermissions = ROLE_PERMISSIONS[user.role] || [];
  return userPermissions.includes(permission);
}

// Protected route component
function ProtectedRoute({ 
  permission, 
  children 
}: { 
  permission: Permission; 
  children: React.ReactNode;
}) {
  const hasPermission = usePermission(permission);
  
  if (!hasPermission) {
    return <UnauthorizedPage />;
  }
  
  return <>{children}</>;
}
```

### Audit Logging

```typescript
// All admin actions are logged
interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  resource_type: 'lawyer' | 'user' | 'consultation' | 'payment' | 'content' | 'settings';
  resource_id: string;
  old_value?: any;
  new_value?: any;
  ip_address: string;
  user_agent: string;
  timestamp: Date;
}

// Logged actions
const AUDITED_ACTIONS = [
  'lawyer:verify',
  'lawyer:reject',
  'lawyer:ban',
  'user:ban',
  'user:unban',
  'consultation:refund',
  'payment:refund',
  'payout:process',
  'settings:update',
  'content:update',
];

// Automatic logging via API interceptor
axios.interceptors.response.use((response) => {
  if (AUDITED_ACTIONS.some(action => response.config.url?.includes(action))) {
    // Log is created on backend automatically
  }
  return response;
});
```

### Data Protection (152-ФЗ Compliance)

```typescript
// All data MUST stay in Russia
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; // Russian servers only

// Sensitive data encryption
const ENCRYPTED_FIELDS = [
  'passport_data',
  'inn',
  'bank_account',
  'phone_number',
];

// Data access logging
function accessSensitiveData(userId: string, field: string) {
  // Log access to audit trail
  logDataAccess({
    admin_id: getCurrentAdmin().id,
    user_id: userId,
    field_accessed: field,
    timestamp: new Date(),
  });
}

// Data retention policy
const DATA_RETENTION = {
  audit_logs: 365 * 3, // 3 years (legal requirement)
  user_data: 365 * 5,  // 5 years
  consultation_data: 365 * 3, // 3 years
  payment_data: 365 * 5, // 5 years (tax requirement)
};
```

---

## Performance & Scalability

### Performance Targets

| Metric | Target | Strategy |
|--------|--------|----------|
| **Initial Page Load** | < 2 seconds | Server-side rendering, code splitting |
| **Time to Interactive** | < 3 seconds | Lazy loading, deferred JS |
| **API Response Time** | < 500ms | Backend optimization, caching |
| **Table Rendering** | < 100ms | Virtual scrolling, pagination |
| **Search Results** | < 300ms | Debouncing, backend indexing |
| **Chart Rendering** | < 500ms | Canvas rendering, data aggregation |

### Optimization Strategies

#### 1. Code Splitting
```typescript
// Lazy load heavy components
const AnalyticsPage = lazy(() => import('./analytics/page'));
const ChartComponent = lazy(() => import('./chart'));

// Route-based splitting (automatic in Next.js App Router)
// Each page is a separate chunk
```

#### 2. Image Optimization
```tsx
// Next.js Image component
<Image
  src="/lawyer-photo.jpg"
  alt="Lawyer"
  width={200}
  height={200}
  placeholder="blur"
  loading="lazy"
/>
```

#### 3. Virtual Scrolling for Large Tables
```typescript
// For tables with 1000+ rows
import { useVirtualizer } from '@tanstack/react-virtual';

function LawyerTable({ data }: { data: Lawyer[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50, // Row height
  });
  
  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      {virtualizer.getVirtualItems().map((virtualRow) => (
        <LawyerRow key={virtualRow.key} lawyer={data[virtualRow.index]} />
      ))}
    </div>
  );
}
```

#### 4. Server-Side Pagination
```typescript
// Always paginate large datasets on backend
async function getLawyers(page: number, limit: number) {
  const response = await api.get('/lawyers', {
    params: { page, limit },
  });
  
  return {
    data: response.data.items,
    total: response.data.total,
    page,
    limit,
  };
}
```

#### 5. Debounced Search
```typescript
// Prevent excessive API calls
const debouncedSearch = useDebouncedCallback(
  (searchTerm: string) => {
    refetch({ search: searchTerm });
  },
  500 // 500ms delay
);
```

### Scalability Architecture

```
┌─────────────────────────────────────────────────────────────┐
│               LOAD BALANCER (Nginx)                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│  Admin Panel 1   │          │  Admin Panel 2   │
│  (Next.js)       │          │  (Next.js)       │
└────────┬─────────┘          └────────┬─────────┘
         │                             │
         └──────────────┬──────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│               BACKEND API (NestJS)                           │
│                Load Balanced                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
┌──────────────────┐          ┌──────────────────┐
│   PostgreSQL     │          │     Redis        │
│  (Read Replicas) │          │   (Cluster)      │
└──────────────────┘          └──────────────────┘
```

---

## Integration Architecture

### Backend API Integration

```typescript
// API Client Configuration
// lib/api/client.ts

import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, try refresh
      await refreshToken();
      return apiClient.request(error.config);
    }
    
    if (error.response?.status === 403) {
      // Forbidden - redirect to unauthorized page
      window.location.href = '/unauthorized';
    }
    
    return Promise.reject(error);
  }
);
```

### WebSocket Integration

```typescript
// Real-time updates via WebSocket
// lib/websocket/client.ts

import io from 'socket.io-client';

class WebSocketClient {
  private socket: Socket | null = null;
  
  connect() {
    this.socket = io(process.env.NEXT_PUBLIC_WS_URL, {
      auth: {
        token: getAuthToken(),
      },
    });
    
    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });
    
    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });
    
    // Listen for events
    this.socket.on('lawyer:verified', (data) => {
      queryClient.invalidateQueries(['lawyers', 'pending']);
      toast.success(`Lawyer ${data.name} verified`);
    });
    
    this.socket.on('consultation:started', (data) => {
      queryClient.invalidateQueries(['consultations', 'live']);
      // Update live consultations count
    });
    
    this.socket.on('emergency:new', (data) => {
      queryClient.invalidateQueries(['emergency-calls']);
      toast.info('New emergency call!', {
        action: {
          label: 'View',
          onClick: () => router.push(`/consultations/emergency-calls/${data.id}`),
        },
      });
    });
  }
  
  disconnect() {
    this.socket?.disconnect();
  }
}
```

### Third-Party Integrations

```typescript
// Export functionality
export async function exportToExcel(data: any[], filename: string) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export async function exportToPDF(data: any[], filename: string) {
  const jsPDF = (await import('jspdf')).default;
  const autoTable = (await import('jspdf-autotable')).default;
  
  const doc = new jsPDF();
  autoTable(doc, {
    head: [Object.keys(data[0])],
    body: data.map(Object.values),
  });
  doc.save(`${filename}.pdf`);
}
```

---

## Deployment Architecture

### Docker Configuration

```dockerfile
# apps/admin/Dockerfile

# Multi-stage build for optimization
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 4000

ENV PORT 4000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose Integration

```yaml
# Updated docker-compose.yml (admin service)

services:
  admin:
    build:
      context: ./apps/admin
      dockerfile: Dockerfile
    container_name: advocata-admin
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://backend:3000
      - NEXT_PUBLIC_WS_URL=ws://backend:3000
    depends_on:
      - backend
    networks:
      - advocata-network
    restart: unless-stopped
```

### Environment Configuration

```bash
# .env.local (development)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_APP_ENV=development

# .env.production
NEXT_PUBLIC_API_URL=https://api.advocata.ru
NEXT_PUBLIC_WS_URL=wss://api.advocata.ru
NEXT_PUBLIC_APP_ENV=production
```

### CI/CD Pipeline

```yaml
# .github/workflows/admin-ci.yml

name: Admin Panel CI/CD

on:
  push:
    branches: [main, develop]
    paths:
      - 'apps/admin/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'apps/admin/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/admin/package-lock.json
      
      - name: Install dependencies
        run: |
          cd apps/admin
          npm ci
      
      - name: Type check
        run: |
          cd apps/admin
          npm run type-check
      
      - name: Lint
        run: |
          cd apps/admin
          npm run lint
      
      - name: Build
        run: |
          cd apps/admin
          npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build -t advocata-admin:latest ./apps/admin
      
      - name: Push to registry
        run: |
          docker tag advocata-admin:latest registry.advocata.ru/admin:latest
          docker push registry.advocata.ru/admin:latest
      
      - name: Deploy to production
        run: |
          # SSH to server and pull new image
          # Restart container
```

---

## Monitoring & Observability

### Logging Strategy

```typescript
// Structured logging
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  browser: {
    asObject: true,
  },
});

// Usage
logger.info({ action: 'lawyer:verify', lawyerId: '123' }, 'Lawyer verified');
logger.error({ error: err, action: 'payment:refund' }, 'Refund failed');
```

### Error Tracking

```typescript
// Sentry integration (optional)
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NEXT_PUBLIC_APP_ENV,
  tracesSampleRate: 1.0,
});

// Capture errors
try {
  // Some operation
} catch (error) {
  Sentry.captureException(error);
  throw error;
}
```

### Performance Monitoring

```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to analytics backend
  const body = JSON.stringify(metric);
  const url = '/api/analytics/web-vitals';
  
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

---

## Conclusion

This architecture provides a solid foundation for the Advocata Admin Panel with:

✅ **Modern Tech Stack**: Next.js 14, TypeScript, TanStack Query, Shadcn UI  
✅ **Scalability**: Designed for 10,000+ users and 1,000+ lawyers  
✅ **Security**: RBAC, audit logging, 152-ФЗ compliance  
✅ **Performance**: Sub-2s page loads, optimized rendering  
✅ **Developer Experience**: Type-safe, well-structured, maintainable  
✅ **Production-Ready**: Docker, CI/CD, monitoring

**Next Steps**: Proceed to `ADMIN_PANEL_FEATURES.md` for detailed feature specifications.

---

**Document Version:** 1.0  
**Last Updated:** November 18, 2025  
**Status:** Ready for Implementation (Priority 8)
