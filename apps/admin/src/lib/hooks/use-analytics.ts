import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import * as analyticsApi from '../api/analytics';

// ============================================================================
// Revenue Analytics Hooks
// ============================================================================

export function useRevenueMetrics(params: RevenueMetricsParams) {
  return useQuery({
    queryKey: ['analytics', 'revenue', 'metrics', params],
    queryFn: () => analyticsApi.getRevenueMetrics(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRevenueOverTime(params: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'revenue', 'over-time', params],
    queryFn: () => analyticsApi.getRevenueOverTime(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenueBreakdown(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'revenue', 'breakdown', params],
    queryFn: () => analyticsApi.getRevenueBreakdown(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenueByConsultationType(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'revenue', 'by-consultation-type', params],
    queryFn: () => analyticsApi.getRevenueByConsultationType(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTopPerformingLawyers(limit: number = 10) {
  return useQuery({
    queryKey: ['analytics', 'revenue', 'top-lawyers', limit],
    queryFn: () => analyticsApi.getTopPerformingLawyers(limit),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCommissionAnalysis(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'revenue', 'commission', params],
    queryFn: () => analyticsApi.getCommissionAnalysis(params),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// User Growth Analytics Hooks
// ============================================================================

export function useUserGrowthMetrics(params: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'users', 'metrics', params],
    queryFn: () => analyticsApi.getUserGrowthMetrics(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserGrowthOverTime(params: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'users', 'growth', params],
    queryFn: () => analyticsApi.getUserGrowthOverTime(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserAcquisitionSources(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'users', 'acquisition-sources', params],
    queryFn: () => analyticsApi.getUserAcquisitionSources(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserActivityData(params: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'users', 'activity', params],
    queryFn: () => analyticsApi.getUserActivityData(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserCohortAnalysis() {
  return useQuery({
    queryKey: ['analytics', 'users', 'cohort-analysis'],
    queryFn: () => analyticsApi.getUserCohortAnalysis(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserSegmentation(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'users', 'segmentation', params],
    queryFn: () => analyticsApi.getUserSegmentation(params),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Lawyer Performance Analytics Hooks
// ============================================================================

export function useLawyerPerformanceMetrics(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'lawyers', 'metrics', params],
    queryFn: () => analyticsApi.getLawyerPerformanceMetrics(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLawyerPerformanceDistribution(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'lawyers', 'performance-distribution', params],
    queryFn: () => analyticsApi.getLawyerPerformanceDistribution(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRatingDistribution(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'lawyers', 'rating-distribution', params],
    queryFn: () => analyticsApi.getRatingDistribution(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useConsultationsBySpecialization(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'lawyers', 'by-specialization', params],
    queryFn: () => analyticsApi.getConsultationsBySpecialization(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLawyerLeaderboard(sortBy: string = 'revenue', params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'lawyers', 'leaderboard', sortBy, params],
    queryFn: () => analyticsApi.getLawyerLeaderboard(sortBy, params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useAvailabilityAnalysis(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'lawyers', 'availability', params],
    queryFn: () => analyticsApi.getAvailabilityAnalysis(params),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Platform Performance Analytics Hooks
// ============================================================================

export function usePlatformMetrics(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'platform', 'metrics', params],
    queryFn: () => analyticsApi.getPlatformMetrics(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useConsultationVolume(params: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'platform', 'consultation-volume', params],
    queryFn: () => analyticsApi.getConsultationVolume(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSuccessMetrics(params: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'platform', 'success-metrics', params],
    queryFn: () => analyticsApi.getSuccessMetrics(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGeographicDistribution(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'platform', 'geographic', params],
    queryFn: () => analyticsApi.getGeographicDistribution(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePlatformUsageData(params: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'platform', 'usage', params],
    queryFn: () => analyticsApi.getPlatformUsageData(params),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================================================
// Custom Reports Hooks
// ============================================================================

export function useGenerateReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: ReportConfig) => analyticsApi.generateReport(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'reports'] });
    },
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format: ReportFormat }) =>
      analyticsApi.exportReport(reportId, format),
    onSuccess: (blob, variables) => {
      // Download the file
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${variables.reportId}.${variables.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}

export function useSavedReports() {
  return useQuery({
    queryKey: ['analytics', 'reports', 'saved'],
    queryFn: () => analyticsApi.getSavedReports(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSaveReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      name,
      config,
      schedule,
    }: {
      name: string;
      config: ReportConfig;
      schedule?: { frequency: 'daily' | 'weekly' | 'monthly' };
    }) => analyticsApi.saveReport(name, config, schedule),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'reports', 'saved'] });
    },
  });
}

export function useDeleteSavedReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => analyticsApi.deleteSavedReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics', 'reports', 'saved'] });
    },
  });
}

export function useReportById(reportId: string) {
  return useQuery({
    queryKey: ['analytics', 'reports', reportId],
    queryFn: () => analyticsApi.getReportById(reportId),
    staleTime: 5 * 60 * 1000,
    enabled: !!reportId,
  });
}

// ============================================================================
// Financial Analytics Hooks
// ============================================================================

export function useFinancialMetrics(params: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'financial', 'metrics', params],
    queryFn: () => analyticsApi.getFinancialMetrics(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenueVsCosts(params: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'financial', 'revenue-vs-costs', params],
    queryFn: () => analyticsApi.getRevenueVsCosts(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function usePaymentMethodsDistribution(params?: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'financial', 'payment-methods', params],
    queryFn: () => analyticsApi.getPaymentMethodsDistribution(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRefundAnalysis(params: TimeRangeParams) {
  return useQuery({
    queryKey: ['analytics', 'financial', 'refunds', params],
    queryFn: () => analyticsApi.getRefundAnalysis(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUpcomingPayouts(limit?: number) {
  return useQuery({
    queryKey: ['analytics', 'financial', 'upcoming-payouts', limit],
    queryFn: () => analyticsApi.getUpcomingPayouts(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for payouts)
  });
}

export function useFinancialForecast(months: number = 3) {
  return useQuery({
    queryKey: ['analytics', 'financial', 'forecast', months],
    queryFn: () => analyticsApi.getFinancialForecast(months),
    staleTime: 5 * 60 * 1000,
  });
}
