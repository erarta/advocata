// Financial API Client
import {
  Payout,
  PayoutDetail,
  PayoutParams,
  PayoutStats,
  CommissionConfig,
  CommissionHistoryEntry,
  CommissionImpact,
  Refund,
  RefundDetail,
  RefundParams,
  RefundStats,
  RefundAction,
  FinancialSettings,
  TestResult,
  Transaction,
  TransactionDetail,
  TransactionParams,
  PaginatedResponse,
  ApiResponse,
} from '@/lib/types/financial';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      // TODO: Add authentication header from session
      // 'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// ==================== PAYOUT APIs ====================

/**
 * Get pending payouts with optional filters
 */
export async function getPendingPayouts(
  params?: PayoutParams
): Promise<PaginatedResponse<Payout>> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  const endpoint = `/admin/financial/payouts/pending?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<Payout>>(endpoint);
}

/**
 * Get payout history with filters
 */
export async function getPayoutHistory(
  params: PayoutParams
): Promise<PaginatedResponse<Payout>> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const endpoint = `/admin/financial/payouts/history?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<Payout>>(endpoint);
}

/**
 * Get detailed information about a specific payout
 */
export async function getPayout(id: string): Promise<PayoutDetail> {
  return apiCall<PayoutDetail>(`/admin/financial/payouts/${id}`);
}

/**
 * Get payout statistics
 */
export async function getPayoutStats(): Promise<PayoutStats> {
  return apiCall<PayoutStats>('/admin/financial/payouts/stats');
}

/**
 * Process a single payout
 * NOTE: This should trigger actual payment processing in production
 * Requires admin approval and audit logging
 */
export async function processPayout(id: string): Promise<void> {
  await apiCall<void>(`/admin/financial/payouts/${id}/process`, {
    method: 'POST',
  });
}

/**
 * Process multiple payouts in bulk
 * NOTE: Critical operation - requires admin confirmation
 */
export async function processMultiplePayouts(ids: string[]): Promise<void> {
  await apiCall<void>('/admin/financial/payouts/process-bulk', {
    method: 'POST',
    body: JSON.stringify({ payout_ids: ids }),
  });
}

/**
 * Cancel a pending payout
 */
export async function cancelPayout(id: string, reason: string): Promise<void> {
  await apiCall<void>(`/admin/financial/payouts/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

/**
 * Edit payout amount (before processing)
 */
export async function editPayoutAmount(
  id: string,
  newAmount: number,
  reason: string
): Promise<void> {
  await apiCall<void>(`/admin/financial/payouts/${id}/edit-amount`, {
    method: 'PATCH',
    body: JSON.stringify({ amount: newAmount, reason }),
  });
}

// ==================== COMMISSION APIs ====================

/**
 * Get current commission configuration
 */
export async function getCommissionConfig(): Promise<CommissionConfig> {
  return apiCall<CommissionConfig>('/admin/financial/commissions/config');
}

/**
 * Update commission configuration
 * NOTE: This affects future calculations - preview impact first
 * Requires audit logging
 */
export async function updateCommissionConfig(
  config: CommissionConfig
): Promise<void> {
  await apiCall<void>('/admin/financial/commissions/config', {
    method: 'PUT',
    body: JSON.stringify(config),
  });
}

/**
 * Get commission configuration change history
 */
export async function getCommissionHistory(): Promise<CommissionHistoryEntry[]> {
  return apiCall<CommissionHistoryEntry[]>('/admin/financial/commissions/history');
}

/**
 * Preview the impact of commission changes on pending payouts
 */
export async function previewCommissionImpact(
  config: CommissionConfig
): Promise<CommissionImpact> {
  return apiCall<CommissionImpact>('/admin/financial/commissions/preview-impact', {
    method: 'POST',
    body: JSON.stringify(config),
  });
}

/**
 * Reset commission config to default values
 */
export async function resetCommissionConfig(): Promise<CommissionConfig> {
  return apiCall<CommissionConfig>('/admin/financial/commissions/reset', {
    method: 'POST',
  });
}

// ==================== REFUND APIs ====================

/**
 * Get pending refund requests
 */
export async function getPendingRefunds(
  params?: RefundParams
): Promise<PaginatedResponse<Refund>> {
  const queryParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }

  const endpoint = `/admin/financial/refunds/pending?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<Refund>>(endpoint);
}

/**
 * Get refund history
 */
export async function getRefundHistory(
  params: RefundParams
): Promise<PaginatedResponse<Refund>> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const endpoint = `/admin/financial/refunds/history?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<Refund>>(endpoint);
}

/**
 * Get detailed information about a specific refund
 */
export async function getRefund(id: string): Promise<RefundDetail> {
  return apiCall<RefundDetail>(`/admin/financial/refunds/${id}`);
}

/**
 * Get refund statistics
 */
export async function getRefundStats(): Promise<RefundStats> {
  return apiCall<RefundStats>('/admin/financial/refunds/stats');
}

/**
 * Approve a refund (full or partial)
 * NOTE: Triggers actual refund processing - requires confirmation
 */
export async function approveRefund(
  id: string,
  amount: number,
  notes?: string
): Promise<void> {
  await apiCall<void>(`/admin/financial/refunds/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ amount, notes }),
  });
}

/**
 * Reject a refund request
 */
export async function rejectRefund(id: string, reason: string): Promise<void> {
  await apiCall<void>(`/admin/financial/refunds/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

/**
 * Request more information about a refund
 */
export async function requestRefundInfo(id: string, message: string): Promise<void> {
  await apiCall<void>(`/admin/financial/refunds/${id}/request-info`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

// ==================== FINANCIAL SETTINGS APIs ====================

/**
 * Get financial settings
 */
export async function getFinancialSettings(): Promise<FinancialSettings> {
  return apiCall<FinancialSettings>('/admin/financial/settings');
}

/**
 * Update financial settings
 * NOTE: Critical operation - affects platform operations
 */
export async function updateFinancialSettings(
  settings: FinancialSettings
): Promise<void> {
  await apiCall<void>('/admin/financial/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

/**
 * Test payment gateway connection
 */
export async function testPaymentGateway(): Promise<TestResult> {
  return apiCall<TestResult>('/admin/financial/settings/test-gateway', {
    method: 'POST',
  });
}

/**
 * Test webhook configuration
 */
export async function testWebhook(): Promise<TestResult> {
  return apiCall<TestResult>('/admin/financial/settings/test-webhook', {
    method: 'POST',
  });
}

// ==================== TRANSACTION APIs ====================

/**
 * Get transaction history with filters
 */
export async function getTransactions(
  params: TransactionParams
): Promise<PaginatedResponse<Transaction>> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const endpoint = `/admin/financial/transactions?${queryParams.toString()}`;
  return apiCall<PaginatedResponse<Transaction>>(endpoint);
}

/**
 * Get detailed information about a specific transaction
 */
export async function getTransaction(id: string): Promise<TransactionDetail> {
  return apiCall<TransactionDetail>(`/admin/financial/transactions/${id}`);
}

/**
 * Retry a failed transaction
 */
export async function retryTransaction(id: string): Promise<void> {
  await apiCall<void>(`/admin/financial/transactions/${id}/retry`, {
    method: 'POST',
  });
}

/**
 * Download transaction receipt/invoice
 */
export async function downloadTransactionReceipt(id: string): Promise<Blob> {
  const response = await fetch(
    `${API_BASE_URL}/admin/financial/transactions/${id}/receipt`,
    {
      headers: {
        // TODO: Add authentication header
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to download receipt');
  }

  return response.blob();
}

// ==================== EXPORT APIs ====================

/**
 * Export payouts to Excel
 */
export async function exportPayouts(params: PayoutParams): Promise<Blob> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(
    `${API_BASE_URL}/admin/financial/payouts/export?${queryParams.toString()}`,
    {
      headers: {
        // TODO: Add authentication header
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export payouts');
  }

  return response.blob();
}

/**
 * Export refunds to Excel
 */
export async function exportRefunds(params: RefundParams): Promise<Blob> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(
    `${API_BASE_URL}/admin/financial/refunds/export?${queryParams.toString()}`,
    {
      headers: {
        // TODO: Add authentication header
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export refunds');
  }

  return response.blob();
}

/**
 * Export transactions to Excel
 */
export async function exportTransactions(params: TransactionParams): Promise<Blob> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  const response = await fetch(
    `${API_BASE_URL}/admin/financial/transactions/export?${queryParams.toString()}`,
    {
      headers: {
        // TODO: Add authentication header
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to export transactions');
  }

  return response.blob();
}
