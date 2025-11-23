// Financial Module Types

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type RefundStatus = 'pending-review' | 'approved' | 'rejected';
export type TransactionType = 'payment' | 'refund' | 'payout' | 'commission';
export type TransactionStatus = 'success' | 'failed' | 'pending';
export type PaymentMethod = 'bank-transfer' | 'card' | 'yookassa' | 'other';
export type PayoutFrequency = 'weekly' | 'bi-weekly' | 'monthly';
export type RefundReason = 'no-show-lawyer' | 'poor-service' | 'technical-issues' | 'duplicate-payment' | 'lawyer-cancelled' | 'other';
export type ConsultationType = 'chat' | 'video' | 'voice' | 'in-person' | 'emergency';

// Payout Types
export interface Payout {
  id: string;
  lawyer_id: string;
  lawyer_name: string;
  lawyer_avatar?: string;
  amount: number;
  commission_deducted: number;
  consultations_count: number;
  period_start: string;
  period_end: string;
  payment_method: PaymentMethod;
  due_date: string;
  status: PayoutStatus;
  created_at: string;
  updated_at: string;
}

export interface PayoutDetail extends Payout {
  bank_details?: {
    account_number: string;
    bank_name: string;
    bik: string;
    account_holder: string;
  };
  consultations: PayoutConsultation[];
  transaction_id?: string;
  processed_at?: string;
  processed_by?: string;
  notes?: string;
}

export interface PayoutConsultation {
  id: string;
  date: string;
  client_name: string;
  type: ConsultationType;
  amount: number;
  commission: number;
  net_amount: number;
}

export interface PayoutParams {
  status?: PayoutStatus;
  payment_method?: PaymentMethod;
  date_from?: string;
  date_to?: string;
  lawyer_id?: string;
  search?: string;
  sort_by?: 'amount' | 'due_date' | 'lawyer_name';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface PayoutStats {
  pending_amount: number;
  pending_count: number;
  processed_this_month_amount: number;
  processed_this_month_count: number;
  next_payout_date: string;
  total_paid_all_time: number;
}

// Commission Types
export interface CommissionConfig {
  global: {
    default_rate: number;
    minimum_amount: number;
    maximum_amount?: number;
  };
  by_consultation_type: {
    chat: number;
    video: number;
    voice: number;
    in_person: number;
    emergency: number;
  };
  by_subscription_tier: {
    free: number;
    basic: number;
    premium: number;
    vip: number;
  };
  by_lawyer_tier: {
    new_lawyers: number; // <10 consultations
    regular_lawyers: number; // 10-50 consultations
    top_performers: number; // >50 consultations
    vip_lawyers: number; // custom commission
  };
}

export interface CommissionHistoryEntry {
  id: string;
  changed_at: string;
  changed_by: string;
  admin_name: string;
  commission_type: string;
  old_rate: number;
  new_rate: number;
  notes?: string;
}

export interface CommissionImpact {
  affected_payouts: number;
  total_amount_change: number;
  lawyer_impact: Array<{
    lawyer_id: string;
    lawyer_name: string;
    current_amount: number;
    new_amount: number;
    difference: number;
  }>;
}

// Refund Types
export interface Refund {
  id: string;
  request_date: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  consultation_id: string;
  original_amount: number;
  refund_amount_requested: number;
  reason: RefundReason;
  reason_details?: string;
  status: RefundStatus;
  created_at: string;
  updated_at: string;
}

export interface RefundDetail extends Refund {
  consultation: {
    id: string;
    date: string;
    lawyer_id: string;
    lawyer_name: string;
    type: ConsultationType;
    duration: number;
    status: string;
    rating?: number;
    review?: string;
  };
  payment: {
    id: string;
    amount: number;
    method: PaymentMethod;
    date: string;
    transaction_id: string;
  };
  user_statement?: string;
  lawyer_statement?: string;
  admin_notes?: string;
  processed_at?: string;
  processed_by?: string;
  admin_name?: string;
}

export interface RefundParams {
  status?: RefundStatus;
  reason?: RefundReason;
  date_from?: string;
  date_to?: string;
  user_id?: string;
  search?: string;
  sort_by?: 'date' | 'amount';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface RefundStats {
  pending_count: number;
  pending_amount: number;
  processed_today_count: number;
  processed_today_amount: number;
  refund_rate: number; // percentage
  average_refund_amount: number;
}

export interface RefundAction {
  action: 'approve' | 'reject' | 'request-info';
  amount?: number; // for partial refunds
  reason?: string;
  notes?: string;
}

// Financial Settings Types
export interface FinancialSettings {
  payment_gateway: {
    yookassa_shop_id: string;
    yookassa_secret_key: string; // masked on read
    test_mode: boolean;
    webhook_url: string;
  };
  bank_account: {
    account_number: string;
    bank_name: string;
    bik: string;
    account_holder: string;
    legal_name: string;
  };
  tax: {
    vat_rate: number;
    tax_id: string;
    company_legal_name: string;
  };
  payout_schedule: {
    frequency: PayoutFrequency;
    payout_day: number; // 1-31 for monthly, 1-7 for weekly
    minimum_threshold: number;
  };
  refund_policy: {
    automatic_refund_window_days: number;
    auto_approve_threshold: number; // auto-approve if below this amount
  };
}

export interface TestResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

// Transaction Types
export interface Transaction {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  user_id?: string;
  lawyer_id?: string;
  related_entity_name: string; // user or lawyer name
  amount: number;
  status: TransactionStatus;
  payment_method: PaymentMethod;
  transaction_id: string;
  created_at: string;
}

export interface TransactionDetail extends Transaction {
  metadata: Record<string, any>;
  consultation_id?: string;
  payout_id?: string;
  refund_id?: string;
  error_message?: string;
  retry_count?: number;
  last_retry_at?: string;
}

export interface TransactionParams {
  type?: TransactionType;
  status?: TransactionStatus;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  user_id?: string;
  lawyer_id?: string;
  search?: string;
  sort_by?: 'date' | 'amount';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Shared Types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
