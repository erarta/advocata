import { Lawyer } from '../entities';
import { SpecializationType, LawyerStatus } from '../enums';

/**
 * Search criteria for lawyers
 */
export interface LawyerSearchCriteria {
  specializations?: SpecializationType[];
  minRating?: number;
  minExperience?: number;
  isAvailable?: boolean;
  status?: LawyerStatus;
  limit?: number;
  offset?: number;
}

/**
 * ILawyerRepository
 *
 * Repository interface for Lawyer aggregate
 * Implementation will be in Infrastructure layer
 */
export interface ILawyerRepository {
  /**
   * Generate next unique ID for Lawyer
   */
  nextId(): Promise<string>;

  /**
   * Find lawyer by ID
   */
  findById(id: string): Promise<Lawyer | null>;

  /**
   * Find lawyer by user ID
   */
  findByUserId(userId: string): Promise<Lawyer | null>;

  /**
   * Find lawyer by license number
   */
  findByLicenseNumber(licenseNumber: string): Promise<Lawyer | null>;

  /**
   * Search lawyers with criteria
   */
  search(criteria: LawyerSearchCriteria): Promise<{
    lawyers: Lawyer[];
    total: number;
  }>;

  /**
   * Get lawyers pending verification
   */
  findPendingVerification(limit?: number): Promise<Lawyer[]>;

  /**
   * Save lawyer (create or update)
   */
  save(lawyer: Lawyer): Promise<void>;

  /**
   * Delete lawyer
   */
  delete(id: string): Promise<void>;

  /**
   * Check if license number exists
   */
  existsByLicenseNumber(licenseNumber: string): Promise<boolean>;

  /**
   * Get lawyers by specialization
   */
  findBySpecialization(
    specialization: SpecializationType,
    limit?: number,
  ): Promise<Lawyer[]>;

  /**
   * Get top rated lawyers
   */
  findTopRated(limit?: number): Promise<Lawyer[]>;
}
