import { Consultation } from '../entities/consultation.entity';
import { ConsultationStatus } from '../enums';

/**
 * Consultation Repository Interface
 *
 * Defines the contract for consultation persistence
 */
export interface IConsultationRepository {
  /**
   * Save a consultation (create or update)
   */
  save(consultation: Consultation): Promise<void>;

  /**
   * Find consultation by ID
   */
  findById(id: string): Promise<Consultation | null>;

  /**
   * Find all consultations for a client
   */
  findByClientId(
    clientId: string,
    status?: ConsultationStatus,
    limit?: number,
    offset?: number,
  ): Promise<{ items: Consultation[]; total: number }>;

  /**
   * Find all consultations for a lawyer
   */
  findByLawyerId(
    lawyerId: string,
    status?: ConsultationStatus,
    limit?: number,
    offset?: number,
  ): Promise<{ items: Consultation[]; total: number }>;

  /**
   * Find active consultation for a client
   */
  findActiveByClientId(clientId: string): Promise<Consultation | null>;

  /**
   * Find active consultation for a lawyer
   */
  findActiveByLawyerId(lawyerId: string): Promise<Consultation | null>;

  /**
   * Find expired consultations (pending for too long)
   */
  findExpired(expirationMinutes: number): Promise<Consultation[]>;

  /**
   * Delete consultation (for testing purposes)
   */
  delete(id: string): Promise<void>;

  /**
   * Check if lawyer has active consultation
   */
  hasActiveCons ultation(lawyerId: string): Promise<boolean>;

  /**
   * Check if client has active consultation
   */
  hasActiveConsultationForClient(clientId: string): Promise<boolean>;
}
