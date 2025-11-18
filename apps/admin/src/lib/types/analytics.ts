// ============================================================================
// Analytics Types
// ============================================================================

// Common Types
// ============================================================================

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'custom';

export interface TimeRangeParams {
  startDate: string;
  endDate: string;
  range?: TimeRange;
}

export interface ChartDataPoint {
  date: string;
  [key: string]: string | number;
}

// Revenue Analytics
// ============================================================================

export interface RevenueDataPoint {
  date: string;
  totalRevenue: number;
  subscriptionRevenue: number;
  consultationRevenue: number;
  emergencyRevenue: number;
  commission: number;
}

export interface RevenueBreakdown {
  consultations: number;
  consultationsPercent: number;
  subscriptions: number;
  subscriptionsPercent: number;
  emergency: number;
  emergencyPercent: number;
  other: number;
  otherPercent: number;
}

export interface RevenueByConsultationType {
  chat: number;
  video: number;
  voice: number;
  inPerson: number;
  emergency: number;
}

export interface PaymentMethodBreakdown {
  card: number;
  cardPercent: number;
  yookassa: number;
  yookassaPercent: number;
  other: number;
  otherPercent: number;
}

export interface LawyerRevenue {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  specialization: string;
  consultationCount: number;
  revenue: number;
  commission: number;
}

export interface RevenueMetrics {
  period: {
    start: string;
    end: string;
  };
  totalRevenue: number;
  totalRevenueChange: number;
  platformCommission: number;
  platformCommissionPercent: number;
  platformCommissionChange: number;
  consultationRevenue: number;
  consultationRevenueChange: number;
  subscriptionRevenue: number;
  subscriptionRevenueChange: number;
  activeSubscribers: number;
  mrr: number; // Monthly Recurring Revenue
}

export interface RevenueMetricsParams {
  startDate: string;
  endDate: string;
}

export interface RevenueTimeSeriesData {
  data: RevenueDataPoint[];
  summary: {
    total: number;
    average: number;
    peak: number;
    peakDate: string;
  };
}

export interface CommissionAnalysis {
  platformRate: number;
  totalCommission: number;
  commissionByType: {
    chat: number;
    video: number;
    voice: number;
    inPerson: number;
    emergency: number;
  };
  averageCommissionPerConsultation: number;
}

// User Growth Analytics
// ============================================================================

export interface UserGrowthMetrics {
  totalUsers: number;
  totalUsersGrowth: number;
  newUsers: number;
  newUsersAvgPerDay: number;
  newUsersPercent: number;
  activeUsers: number;
  activeUsersPercent: number;
  retentionRate: number;
  churnRate: number;
  churnRateChange: number;
}

export interface UserGrowthTimeSeries {
  totalUsers: ChartDataPoint[];
  newUsers: ChartDataPoint[];
  activeUsers: ChartDataPoint[];
}

export interface AcquisitionSource {
  source: string;
  count: number;
  percent: number;
  color?: string;
}

export interface UserActivityData {
  date: string;
  consultations: number;
  dayOfWeek: number;
  hour?: number;
}

export interface CohortData {
  cohort: string; // Month of registration (e.g., "2025-01")
  month0: number;
  month1: number;
  month2: number;
  month3: number;
  month4: number;
  month5: number;
  ltv: number; // Lifetime value
}

export interface UserSegmentation {
  bySubscriptionTier: Array<{
    tier: string;
    count: number;
    percent: number;
  }>;
  byConsultationCount: Array<{
    range: string;
    count: number;
    percent: number;
  }>;
  byTotalSpent: Array<{
    range: string;
    count: number;
    percent: number;
  }>;
}

// Lawyer Performance Analytics
// ============================================================================

export interface LawyerPerformanceMetrics {
  totalActiveLawyers: number;
  totalActiveLawyersGrowth: number;
  verifiedPercent: number;
  averageRating: number;
  averageRatingTrend: number;
  totalConsultations: number;
  totalConsultationsGrowth: number;
  averageConsultationsPerLawyer: number;
  responseRate: number;
  averageResponseTime: number; // in seconds
}

export interface PerformanceDistribution {
  data: Array<{
    id: string;
    name: string;
    consultations: number;
    rating: number;
    revenue: number;
  }>;
}

export interface SpecializationStats {
  specialization: string;
  lawyerCount: number;
  consultationCount: number;
  averageRating: number;
  totalRevenue: number;
}

export interface LawyerLeaderboard {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  specialization: string;
  rating: number;
  consultations: number;
  revenue: number;
  responseTime: number;
  completionRate: number;
  badges?: string[];
}

export interface RatingDistribution {
  range: string;
  count: number;
}

export interface AvailabilityAnalysis {
  lawyersOnlineNow: number;
  averageAvailabilityHours: number;
  peakAvailabilityTime: string;
  availabilityByHour: Array<{
    hour: number;
    count: number;
  }>;
}

// Platform Performance
// ============================================================================

export interface PlatformMetrics {
  totalConsultations: number;
  totalConsultationsGrowth: number;
  completionRate: number;
  completionRateTrend: number;
  averageSessionDuration: number; // in seconds
  averageSessionDurationTrend: number;
  customerSatisfaction: number; // CSAT score
  npsScore: number; // Net Promoter Score
}

export interface VolumeTimeSeries {
  total: ChartDataPoint[];
  byType: {
    chat: ChartDataPoint[];
    video: ChartDataPoint[];
    voice: ChartDataPoint[];
    inPerson: ChartDataPoint[];
  };
  byStatus: {
    completed: ChartDataPoint[];
    cancelled: ChartDataPoint[];
    disputed: ChartDataPoint[];
  };
}

export interface SuccessMetrics {
  completionRate: ChartDataPoint[];
  cancellationRate: ChartDataPoint[];
  disputeRate: ChartDataPoint[];
}

export interface GeographicData {
  city: string;
  consultations: number;
  revenue: number;
  users: number;
  lawyers: number;
}

export interface PlatformUsageData {
  activeConsultationsPerHour: Array<{
    hour: number;
    count: number;
  }>;
  peakUsageTimes: Array<{
    time: string;
    count: number;
  }>;
}

// Custom Reports
// ============================================================================

export type ReportFormat = 'pdf' | 'excel' | 'csv';
export type ReportGrouping = 'daily' | 'weekly' | 'monthly';
export type ReportSortBy = 'date' | 'revenue' | 'consultations' | 'rating';

export interface ReportConfig {
  template: 'revenue' | 'user-acquisition' | 'lawyer-performance' | 'financial' | 'consultation' | 'custom';
  dateRange: {
    start: string;
    end: string;
  };
  filters?: {
    lawyerIds?: string[];
    userIds?: string[];
    consultationTypes?: string[];
    specializations?: string[];
    statuses?: string[];
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    maxRating?: number;
  };
  options?: {
    format: ReportFormat;
    includeCharts: boolean;
    grouping: ReportGrouping;
    sortBy: ReportSortBy;
    limit?: number;
  };
}

export interface ReportData {
  id: string;
  config: ReportConfig;
  generatedAt: string;
  data: unknown;
  charts?: unknown[];
}

export interface SavedReport {
  id: string;
  name: string;
  config: ReportConfig;
  createdAt: string;
  lastGenerated?: string;
  scheduled?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    nextRun: string;
  };
}

// Financial Analytics
// ============================================================================

export interface FinancialMetrics {
  period: {
    start: string;
    end: string;
  };
  totalRevenue: number;
  netRevenue: number;
  outstandingPayments: number;
  refundsIssued: number;
  refundsIssuedChange: number;
  averageTransactionValue: number;
  platformCosts: number;
  netProfit: number;
}

export interface RevenueVsCostsData {
  data: Array<{
    month: string;
    revenue: number;
    costs: number;
    profit: number;
  }>;
}

export interface PaymentMethodStats {
  method: string;
  transactions: number;
  amount: number;
  percent: number;
}

export interface RefundAnalysis {
  totalRefunds: number;
  totalRefundAmount: number;
  refundRate: number;
  refundsByReason: Array<{
    reason: string;
    count: number;
    amount: number;
    percent: number;
  }>;
  refundTrend: ChartDataPoint[];
}

export interface PayoutSchedule {
  id: string;
  lawyerId: string;
  lawyerName: string;
  amount: number;
  scheduledDate: string;
  status: 'pending' | 'processing' | 'completed';
  consultationCount: number;
}

export interface FinancialForecast {
  projectedRevenue: Array<{
    month: string;
    projected: number;
    confidence: number; // 0-100
  }>;
  historicalData: ChartDataPoint[];
}
