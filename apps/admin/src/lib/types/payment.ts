// Payment Types
export interface PaymentMethod {
  id: string;
  type: 'card' | 'sbp' | 'yoomoney' | 'other';
  name: string;
  enabled: boolean;
}

export interface Transaction {
  id: string;
  type: 'payment' | 'refund' | 'payout';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  method: string;
  userId?: string;
  lawyerId?: string;
  consultationId?: string;
  createdAt: Date;
  processedAt?: Date;
}

export interface Payout {
  id: string;
  lawyerId: string;
  lawyerName: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: 'bank_transfer' | 'card' | 'yoomoney';
  notes?: string;
  createdAt: Date;
  processedAt?: Date;
  processedBy?: string;
}

export interface Refund {
  id: string;
  consultationId?: string;
  userId?: string;
  amount: number;
  reason: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedBy: string;
  processedAt: Date;
}

export interface FinancialSettings {
  commissionRate: number;
  payoutSchedule: string;
  minimumPayout: number;
  paymentMethods: PaymentMethod[];
}
