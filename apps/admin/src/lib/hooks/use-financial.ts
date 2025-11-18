// Financial Custom Hooks
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import {
  PayoutParams,
  RefundParams,
  TransactionParams,
  CommissionConfig,
  FinancialSettings,
} from '@/lib/types/financial';
import * as financialApi from '@/lib/api/financial';

// ==================== PAYOUT HOOKS ====================

/**
 * Fetch pending payouts with filters
 */
export function usePendingPayouts(params?: PayoutParams) {
  return useQuery({
    queryKey: ['payouts', 'pending', params],
    queryFn: () => financialApi.getPendingPayouts(params),
  });
}

/**
 * Fetch payout history
 */
export function usePayoutHistory(params: PayoutParams) {
  return useQuery({
    queryKey: ['payouts', 'history', params],
    queryFn: () => financialApi.getPayoutHistory(params),
  });
}

/**
 * Fetch single payout details
 */
export function usePayout(id: string) {
  return useQuery({
    queryKey: ['payouts', id],
    queryFn: () => financialApi.getPayout(id),
    enabled: !!id,
  });
}

/**
 * Fetch payout statistics
 */
export function usePayoutStats() {
  return useQuery({
    queryKey: ['payouts', 'stats'],
    queryFn: () => financialApi.getPayoutStats(),
  });
}

/**
 * Process a single payout
 */
export function useProcessPayout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => financialApi.processPayout(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast({
        title: 'Payout processed',
        description: 'The payout has been successfully processed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error processing payout',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Process multiple payouts in bulk
 */
export function useProcessMultiplePayouts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (ids: string[]) => financialApi.processMultiplePayouts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast({
        title: 'Payouts processed',
        description: 'The selected payouts have been successfully processed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error processing payouts',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Cancel a payout
 */
export function useCancelPayout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      financialApi.cancelPayout(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast({
        title: 'Payout cancelled',
        description: 'The payout has been cancelled.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error cancelling payout',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Edit payout amount
 */
export function useEditPayoutAmount() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      newAmount,
      reason,
    }: {
      id: string;
      newAmount: number;
      reason: string;
    }) => financialApi.editPayoutAmount(id, newAmount, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
      toast({
        title: 'Payout amount updated',
        description: 'The payout amount has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating payout amount',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Export payouts to Excel
 */
export function useExportPayouts() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: PayoutParams) => financialApi.exportPayouts(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payouts-${new Date().toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export successful',
        description: 'Payouts have been exported to Excel.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== COMMISSION HOOKS ====================

/**
 * Fetch commission configuration
 */
export function useCommissionConfig() {
  return useQuery({
    queryKey: ['commission', 'config'],
    queryFn: () => financialApi.getCommissionConfig(),
  });
}

/**
 * Update commission configuration
 */
export function useUpdateCommissionConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (config: CommissionConfig) =>
      financialApi.updateCommissionConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission'] });
      toast({
        title: 'Commission configuration updated',
        description: 'The commission rates have been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating commission',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Fetch commission history
 */
export function useCommissionHistory() {
  return useQuery({
    queryKey: ['commission', 'history'],
    queryFn: () => financialApi.getCommissionHistory(),
  });
}

/**
 * Preview commission impact
 */
export function usePreviewCommissionImpact() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (config: CommissionConfig) =>
      financialApi.previewCommissionImpact(config),
    onError: (error: Error) => {
      toast({
        title: 'Preview failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Reset commission configuration to defaults
 */
export function useResetCommissionConfig() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => financialApi.resetCommissionConfig(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission'] });
      toast({
        title: 'Configuration reset',
        description: 'Commission rates have been reset to defaults.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error resetting configuration',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== REFUND HOOKS ====================

/**
 * Fetch pending refunds
 */
export function usePendingRefunds(params?: RefundParams) {
  return useQuery({
    queryKey: ['refunds', 'pending', params],
    queryFn: () => financialApi.getPendingRefunds(params),
  });
}

/**
 * Fetch refund history
 */
export function useRefundHistory(params: RefundParams) {
  return useQuery({
    queryKey: ['refunds', 'history', params],
    queryFn: () => financialApi.getRefundHistory(params),
  });
}

/**
 * Fetch single refund details
 */
export function useRefund(id: string) {
  return useQuery({
    queryKey: ['refunds', id],
    queryFn: () => financialApi.getRefund(id),
    enabled: !!id,
  });
}

/**
 * Fetch refund statistics
 */
export function useRefundStats() {
  return useQuery({
    queryKey: ['refunds', 'stats'],
    queryFn: () => financialApi.getRefundStats(),
  });
}

/**
 * Approve a refund
 */
export function useApproveRefund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      amount,
      notes,
    }: {
      id: string;
      amount: number;
      notes?: string;
    }) => financialApi.approveRefund(id, amount, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      toast({
        title: 'Refund approved',
        description: 'The refund has been approved and will be processed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error approving refund',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Reject a refund
 */
export function useRejectRefund() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      financialApi.rejectRefund(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      toast({
        title: 'Refund rejected',
        description: 'The refund request has been rejected.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error rejecting refund',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Request more information about a refund
 */
export function useRequestRefundInfo() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      financialApi.requestRefundInfo(id, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['refunds'] });
      toast({
        title: 'Information requested',
        description: 'A request for more information has been sent.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error requesting information',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Export refunds to Excel
 */
export function useExportRefunds() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: RefundParams) => financialApi.exportRefunds(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `refunds-${new Date().toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export successful',
        description: 'Refunds have been exported to Excel.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== FINANCIAL SETTINGS HOOKS ====================

/**
 * Fetch financial settings
 */
export function useFinancialSettings() {
  return useQuery({
    queryKey: ['financial', 'settings'],
    queryFn: () => financialApi.getFinancialSettings(),
  });
}

/**
 * Update financial settings
 */
export function useUpdateFinancialSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (settings: FinancialSettings) =>
      financialApi.updateFinancialSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial', 'settings'] });
      toast({
        title: 'Settings updated',
        description: 'Financial settings have been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Test payment gateway connection
 */
export function useTestPaymentGateway() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => financialApi.testPaymentGateway(),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Connection successful',
          description: result.message,
        });
      } else {
        toast({
          title: 'Connection failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Test failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Test webhook configuration
 */
export function useTestWebhook() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: () => financialApi.testWebhook(),
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: 'Webhook test successful',
          description: result.message,
        });
      } else {
        toast({
          title: 'Webhook test failed',
          description: result.message,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Test failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

// ==================== TRANSACTION HOOKS ====================

/**
 * Fetch transactions with filters
 */
export function useTransactions(params: TransactionParams) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => financialApi.getTransactions(params),
  });
}

/**
 * Fetch single transaction details
 */
export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transactions', id],
    queryFn: () => financialApi.getTransaction(id),
    enabled: !!id,
  });
}

/**
 * Retry a failed transaction
 */
export function useRetryTransaction() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => financialApi.retryTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast({
        title: 'Transaction retry initiated',
        description: 'The transaction is being retried.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error retrying transaction',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Download transaction receipt
 */
export function useDownloadReceipt() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (id: string) => financialApi.downloadTransactionReceipt(id),
    onSuccess: (blob, id) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Receipt downloaded',
        description: 'The receipt has been downloaded successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Download failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Export transactions to Excel
 */
export function useExportTransactions() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: TransactionParams) =>
      financialApi.exportTransactions(params),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions-${new Date().toISOString()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: 'Export successful',
        description: 'Transactions have been exported to Excel.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Export failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
