// Lawyer Types
export enum LawyerStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum RejectionReason {
  INVALID_LICENSE = 'invalid_license',
  INVALID_DOCUMENTS = 'invalid_documents',
  INSUFFICIENT_EXPERIENCE = 'insufficient_experience',
  INCOMPLETE_APPLICATION = 'incomplete_application',
  FAILED_BACKGROUND_CHECK = 'failed_background_check',
  OTHER = 'other',
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  yearGraduated: number;
}

export interface WorkExperience {
  company: string;
  position: string;
  startDate: Date;
  endDate?: Date;
  description: string;
}

export interface Document {
  id: string;
  type: 'license' | 'diploma' | 'passport' | 'other';
  url: string;
  uploadedAt: Date;
  status: 'pending' | 'verified' | 'rejected';
}

export interface Specialization {
  id: string;
  name: string;
  nameEn: string;
}

export interface PendingLawyer {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  specializations: string[];
  experienceYears: number;
  licenseNumber: string;
  education: Education[];
  documents: Document[];
  submittedAt: Date;
  ageDays: number;
  ageHours: number;
  isUrgent: boolean; // > 24 hours
}

export interface VerificationNote {
  id: string;
  adminId: string;
  adminName: string;
  note: string;
  createdAt: Date;
}

export interface VerificationDecision {
  lawyerId: string;
  adminId: string;
  decision: 'approved' | 'approved_conditional' | 'rejected';
  conditions?: string;
  rejectionReason?: RejectionReason;
  additionalComments?: string;
  verifiedDocuments: string[];
  verificationNotes: VerificationNote[];
  decidedAt: Date;
}

export interface Availability {
  timezone: string;
  schedule: WeeklySchedule;
  exceptions: DateException[];
}

export interface WeeklySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string; // "18:00"
}

export interface DateException {
  date: Date;
  reason: string;
  available: boolean;
}

export interface PerformanceMetrics {
  totalConsultations: number;
  completedConsultations: number;
  canceledConsultations: number;
  completionRate: number;
  averageRating: number;
  averageResponseTime: number;
  totalEarnings: number;
  totalPayouts: number;
  pendingPayouts: number;
}

export interface LawyerProfile extends PendingLawyer {
  status: LawyerStatus;
  verifiedAt: Date;
  verifiedBy: string;
  lastActiveAt: Date;
  rating: number;
  reviewCount: number;
  consultationCount: number;
  completionRate: number;
  averageResponseTime: number;
  totalEarnings: number;
  availableEarnings: number;
  languages: string[];
  bio: string;
  hourlyRate: number;
  experience: WorkExperience[];
  availability: Availability;
  performanceMetrics: PerformanceMetrics;
}

export interface LawyerListItem {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  experienceYears: number;
  status: LawyerStatus;
  verifiedAt: Date;
  lastActiveAt: Date;
  consultationCount: number;
  revenue: number;
}
