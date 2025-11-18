// Analytics Types
export interface RevenueDataPoint {
  date: Date;
  totalRevenue: number;
  subscriptionRevenue: number;
  consultationRevenue: number;
}

export interface RevenueBreakdown {
  consultations: number;
  subscriptions: number;
  other: number;
}

export interface PaymentMethodBreakdown {
  card: number;
  sbp: number;
  yoomoney: number;
  other: number;
}

export interface LawyerRevenue {
  lawyerId: string;
  lawyerName: string;
  consultationCount: number;
  revenue: number;
  commission: number;
}

export interface RevenueMetrics {
  period: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  subscriptionRevenue: number;
  consultationRevenue: number;
  commissionEarned: number;
  previousPeriodComparison: {
    totalRevenueChange: number;
    subscriptionRevenueChange: number;
    consultationRevenueChange: number;
  };
  revenueTrend: RevenueDataPoint[];
  revenueBySource: RevenueBreakdown;
  revenueByPaymentMethod: PaymentMethodBreakdown;
  topRevenueLawyers: LawyerRevenue[];
  paymentSuccessRate: number;
  failedPaymentCount: number;
}

export interface UserGrowthMetrics {
  period: {
    start: Date;
    end: Date;
  };
  newUsers: number;
  activeUsers: number;
  churnedUsers: number;
  retentionRate: number;
  churnRate: number;
  growthTrend: Array<{ date: Date; count: number }>;
}

export interface LawyerPerformanceMetrics {
  period: {
    start: Date;
    end: Date;
  };
  totalLawyers: number;
  activeLawyers: number;
  averageRating: number;
  totalConsultations: number;
  completionRate: number;
  topPerformers: LawyerRevenue[];
  underperformers: LawyerRevenue[];
}

export interface PlatformMetrics {
  totalUsers: number;
  totalLawyers: number;
  totalConsultations: number;
  totalRevenue: number;
  averageConsultationDuration: number;
  averageResponseTime: number;
}
