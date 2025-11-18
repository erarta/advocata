// Consultation Types
export enum ConsultationType {
  CHAT = 'chat',
  VIDEO = 'video',
  EMERGENCY = 'emergency',
}

export enum ConsultationStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

export enum DisputeReason {
  UNPROFESSIONAL_BEHAVIOR = 'unprofessional_behavior',
  NO_SHOW = 'no_show',
  POOR_QUALITY = 'poor_quality',
  TECHNICAL_ISSUES = 'technical_issues',
  PAYMENT_ISSUE = 'payment_issue',
  OTHER = 'other',
}

export enum DisputeStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  AWAITING_RESPONSE = 'awaiting_response',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

export interface ParticipantInfo {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
}

export interface ConsultationDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedBy: 'client' | 'lawyer';
  uploadedAt: Date;
  url: string;
}

export interface TimelineEvent {
  timestamp: Date;
  event: string;
  description: string;
}

export interface PaymentInfo {
  id: string;
  amount: number;
  method: string;
  status: PaymentStatus;
  processedAt: Date;
  refundedAt?: Date;
  refundAmount?: number;
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface Rating {
  score: number;
  comment?: string;
  createdAt: Date;
}

export interface RecordingInfo {
  url: string;
  duration: number;
  size: number;
  format: string;
}

export interface LiveConsultation {
  id: string;
  clientId: string;
  clientName: string;
  lawyerId: string;
  lawyerName: string;
  type: ConsultationType;
  status: ConsultationStatus;
  startedAt: Date;
  duration: number; // seconds
  isLong: boolean; // > 2 hours
  hasAlert: boolean;
  alertReason?: string;
}

export interface ConsultationDetail {
  id: string;
  status: ConsultationStatus;
  type: ConsultationType;
  client: ParticipantInfo;
  lawyer: ParticipantInfo;
  scheduledStart: Date;
  actualStart?: Date;
  endTime?: Date;
  duration: number;
  specialization: string;
  issue: string;
  notes?: string;
  documents: ConsultationDocument[];
  timeline: TimelineEvent[];
  payment: PaymentInfo;
  rating?: Rating;
  recording?: RecordingInfo;
}

export interface Evidence {
  type: 'image' | 'video' | 'document' | 'screenshot';
  url: string;
  description?: string;
}

export interface DisputeResolution {
  decision: 'client_favor' | 'lawyer_favor' | 'mutual';
  refundAmount: number;
  notes: string;
  lawyerAction?: {
    type: 'warning' | 'suspension' | 'none';
    duration?: number;
    notes?: string;
  };
  resolvedBy: string;
  resolvedAt: Date;
}

export interface Dispute {
  id: string;
  consultationId: string;
  filedBy: 'client' | 'lawyer';
  filedById: string;
  filedByName: string;
  againstId: string;
  againstName: string;
  reason: DisputeReason;
  statement: string;
  evidence: Evidence[];
  response?: {
    statement: string;
    evidence: Evidence[];
    respondedAt: Date;
  };
  investigation?: {
    notes: string;
    findings: string[];
    investigatedBy: string;
    investigatedAt: Date;
  };
  resolution?: DisputeResolution;
  status: DisputeStatus;
  priority: 'low' | 'medium' | 'high';
  filedAt: Date;
  resolvedAt?: Date;
}

export interface EmergencyCall {
  id: string;
  userId: string;
  userName: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
  };
  lawyerId?: string;
  lawyerName?: string;
  status: 'pending' | 'assigned' | 'active' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  waitTime: number;
  responseTime?: number;
  isUrgent: boolean;
}
