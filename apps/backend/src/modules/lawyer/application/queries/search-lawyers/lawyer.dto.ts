import {
  SpecializationType,
  LawyerStatus,
  VerificationStatus,
} from '../../../domain/enums';

/**
 * LawyerDto
 *
 * Data Transfer Object for Lawyer
 */
export class LawyerDto {
  id: string;
  userId: string;
  licenseNumber: string;
  specializations: SpecializationType[];
  experienceYears: number;
  rating: number;
  reviewCount: number;
  bio: string;
  education: string;
  status: LawyerStatus;
  verificationStatus: VerificationStatus;
  hourlyRate?: number;
  isAvailable: boolean;
  isVerified: boolean;
  canTakeConsultations: boolean;
  createdAt: Date;
  updatedAt: Date;
}
