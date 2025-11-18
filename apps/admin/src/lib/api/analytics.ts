import { get, post } from './client';
import type {
  RevenueMetrics,
  RevenueMetricsParams,
  RevenueTimeSeriesData,
  RevenueBreakdown,
  RevenueByConsultationType,
  LawyerRevenue,
  CommissionAnalysis,
  TimeRangeParams,
  UserGrowthMetrics,
  UserGrowthTimeSeries,
  AcquisitionSource,
  CohortData,
  UserSegmentation,
  UserActivityData,
  LawyerPerformanceMetrics,
  PerformanceDistribution,
  SpecializationStats,
  LawyerLeaderboard,
  RatingDistribution,
  AvailabilityAnalysis,
  PlatformMetrics,
  VolumeTimeSeries,
  SuccessMetrics,
  GeographicData,
  PlatformUsageData,
  ReportConfig,
  ReportData,
  SavedReport,
  ReportFormat,
  FinancialMetrics,
  RevenueVsCostsData,
  PaymentMethodStats,
  RefundAnalysis,
  PayoutSchedule,
  FinancialForecast,
} from '../types/analytics';

// ============================================================================
// Revenue Analytics API
// ============================================================================

/**
 * Get revenue metrics for a specific period
 */
export async function getRevenueMetrics(params: RevenueMetricsParams): Promise<RevenueMetrics> {
  return get<RevenueMetrics>('/admin/analytics/revenue/metrics', { params });
}

/**
 * Get revenue over time (time series data)
 */
export async function getRevenueOverTime(params: TimeRangeParams): Promise<RevenueTimeSeriesData> {
  return get<RevenueTimeSeriesData>('/admin/analytics/revenue/over-time', { params });
}

/**
 * Get revenue breakdown by source (consultations, subscriptions, etc.)
 */
export async function getRevenueBreakdown(params?: TimeRangeParams): Promise<RevenueBreakdown> {
  return get<RevenueBreakdown>('/admin/analytics/revenue/breakdown', { params });
}

/**
 * Get revenue breakdown by consultation type
 */
export async function getRevenueByConsultationType(
  params?: TimeRangeParams
): Promise<RevenueByConsultationType> {
  return get<RevenueByConsultationType>('/admin/analytics/revenue/by-consultation-type', {
    params,
  });
}

/**
 * Get top performing lawyers by revenue
 */
export async function getTopPerformingLawyers(limit: number = 10): Promise<LawyerRevenue[]> {
  return get<LawyerRevenue[]>('/admin/analytics/revenue/top-lawyers', {
    params: { limit },
  });
}

/**
 * Get commission analysis
 */
export async function getCommissionAnalysis(
  params?: TimeRangeParams
): Promise<CommissionAnalysis> {
  return get<CommissionAnalysis>('/admin/analytics/revenue/commission', { params });
}

// ============================================================================
// User Growth Analytics API
// ============================================================================

/**
 * Get user growth metrics
 */
export async function getUserGrowthMetrics(params: TimeRangeParams): Promise<UserGrowthMetrics> {
  return get<UserGrowthMetrics>('/admin/analytics/users/metrics', { params });
}

/**
 * Get user growth over time (time series)
 */
export async function getUserGrowthOverTime(
  params: TimeRangeParams
): Promise<UserGrowthTimeSeries> {
  return get<UserGrowthTimeSeries>('/admin/analytics/users/growth', { params });
}

/**
 * Get user acquisition sources
 */
export async function getUserAcquisitionSources(
  params?: TimeRangeParams
): Promise<AcquisitionSource[]> {
  return get<AcquisitionSource[]>('/admin/analytics/users/acquisition-sources', { params });
}

/**
 * Get user activity data (heat map data)
 */
export async function getUserActivityData(params: TimeRangeParams): Promise<UserActivityData[]> {
  return get<UserActivityData[]>('/admin/analytics/users/activity', { params });
}

/**
 * Get cohort analysis data
 */
export async function getUserCohortAnalysis(): Promise<CohortData[]> {
  return get<CohortData[]>('/admin/analytics/users/cohort-analysis');
}

/**
 * Get user segmentation data
 */
export async function getUserSegmentation(params?: TimeRangeParams): Promise<UserSegmentation> {
  return get<UserSegmentation>('/admin/analytics/users/segmentation', { params });
}

// ============================================================================
// Lawyer Performance Analytics API
// ============================================================================

/**
 * Get lawyer performance metrics
 */
export async function getLawyerPerformanceMetrics(
  params?: TimeRangeParams
): Promise<LawyerPerformanceMetrics> {
  return get<LawyerPerformanceMetrics>('/admin/analytics/lawyers/metrics', { params });
}

/**
 * Get lawyer performance distribution (for scatter plot)
 */
export async function getLawyerPerformanceDistribution(
  params?: TimeRangeParams
): Promise<PerformanceDistribution> {
  return get<PerformanceDistribution>('/admin/analytics/lawyers/performance-distribution', {
    params,
  });
}

/**
 * Get rating distribution
 */
export async function getRatingDistribution(
  params?: TimeRangeParams
): Promise<RatingDistribution[]> {
  return get<RatingDistribution[]>('/admin/analytics/lawyers/rating-distribution', { params });
}

/**
 * Get consultations by specialization
 */
export async function getConsultationsBySpecialization(
  params?: TimeRangeParams
): Promise<SpecializationStats[]> {
  return get<SpecializationStats[]>('/admin/analytics/lawyers/by-specialization', { params });
}

/**
 * Get lawyer leaderboard
 */
export async function getLawyerLeaderboard(
  sortBy: string = 'revenue',
  params?: TimeRangeParams
): Promise<LawyerLeaderboard[]> {
  return get<LawyerLeaderboard[]>('/admin/analytics/lawyers/leaderboard', {
    params: { sortBy, ...params },
  });
}

/**
 * Get availability analysis
 */
export async function getAvailabilityAnalysis(
  params?: TimeRangeParams
): Promise<AvailabilityAnalysis> {
  return get<AvailabilityAnalysis>('/admin/analytics/lawyers/availability', { params });
}

// ============================================================================
// Platform Performance Analytics API
// ============================================================================

/**
 * Get platform metrics
 */
export async function getPlatformMetrics(params?: TimeRangeParams): Promise<PlatformMetrics> {
  return get<PlatformMetrics>('/admin/analytics/platform/metrics', { params });
}

/**
 * Get consultation volume over time
 */
export async function getConsultationVolume(params: TimeRangeParams): Promise<VolumeTimeSeries> {
  return get<VolumeTimeSeries>('/admin/analytics/platform/consultation-volume', { params });
}

/**
 * Get success metrics (completion rate, cancellation rate, etc.)
 */
export async function getSuccessMetrics(params: TimeRangeParams): Promise<SuccessMetrics> {
  return get<SuccessMetrics>('/admin/analytics/platform/success-metrics', { params });
}

/**
 * Get geographic distribution
 */
export async function getGeographicDistribution(
  params?: TimeRangeParams
): Promise<GeographicData[]> {
  return get<GeographicData[]>('/admin/analytics/platform/geographic', { params });
}

/**
 * Get platform usage data (peak times, etc.)
 */
export async function getPlatformUsageData(params: TimeRangeParams): Promise<PlatformUsageData> {
  return get<PlatformUsageData>('/admin/analytics/platform/usage', { params });
}

// ============================================================================
// Custom Reports API
// ============================================================================

/**
 * Generate a custom report
 */
export async function generateReport(config: ReportConfig): Promise<ReportData> {
  return post<ReportData>('/admin/analytics/reports/generate', config);
}

/**
 * Export a report in specified format
 */
export async function exportReport(reportId: string, format: ReportFormat): Promise<Blob> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/admin/analytics/reports/${reportId}/export?format=${format}`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('admin-token')}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Export failed');
  }

  return response.blob();
}

/**
 * Get saved reports
 */
export async function getSavedReports(): Promise<SavedReport[]> {
  return get<SavedReport[]>('/admin/analytics/reports/saved');
}

/**
 * Save a report configuration
 */
export async function saveReport(
  name: string,
  config: ReportConfig,
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
  }
): Promise<SavedReport> {
  return post<SavedReport>('/admin/analytics/reports/save', { name, config, schedule });
}

/**
 * Delete a saved report
 */
export async function deleteSavedReport(reportId: string): Promise<void> {
  return post<void>(`/admin/analytics/reports/${reportId}/delete`);
}

/**
 * Get report by ID
 */
export async function getReportById(reportId: string): Promise<ReportData> {
  return get<ReportData>(`/admin/analytics/reports/${reportId}`);
}

// ============================================================================
// Financial Analytics API
// ============================================================================

/**
 * Get financial metrics
 */
export async function getFinancialMetrics(params: TimeRangeParams): Promise<FinancialMetrics> {
  return get<FinancialMetrics>('/admin/analytics/financial/metrics', { params });
}

/**
 * Get revenue vs costs data
 */
export async function getRevenueVsCosts(params: TimeRangeParams): Promise<RevenueVsCostsData> {
  return get<RevenueVsCostsData>('/admin/analytics/financial/revenue-vs-costs', { params });
}

/**
 * Get payment methods distribution
 */
export async function getPaymentMethodsDistribution(
  params?: TimeRangeParams
): Promise<PaymentMethodStats[]> {
  return get<PaymentMethodStats[]>('/admin/analytics/financial/payment-methods', { params });
}

/**
 * Get refund analysis
 */
export async function getRefundAnalysis(params: TimeRangeParams): Promise<RefundAnalysis> {
  return get<RefundAnalysis>('/admin/analytics/financial/refunds', { params });
}

/**
 * Get upcoming payouts
 */
export async function getUpcomingPayouts(limit?: number): Promise<PayoutSchedule[]> {
  return get<PayoutSchedule[]>('/admin/analytics/financial/upcoming-payouts', {
    params: { limit },
  });
}

/**
 * Get financial forecast
 */
export async function getFinancialForecast(months: number = 3): Promise<FinancialForecast> {
  return get<FinancialForecast>('/admin/analytics/financial/forecast', {
    params: { months },
  });
}
