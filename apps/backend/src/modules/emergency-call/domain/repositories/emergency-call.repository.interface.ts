import { EmergencyCall } from '../entities/emergency-call.entity';
import { Location } from '../value-objects/location.vo';

/**
 * Emergency Call Repository Interface
 * Defines contract for emergency call data operations
 */
export interface IEmergencyCallRepository {
  /**
   * Creates a new emergency call
   */
  create(emergencyCall: EmergencyCall): Promise<EmergencyCall>;

  /**
   * Finds an emergency call by ID
   */
  findById(id: string): Promise<EmergencyCall | null>;

  /**
   * Finds all emergency calls for a user
   */
  findByUserId(userId: string): Promise<EmergencyCall[]>;

  /**
   * Finds all emergency calls for a lawyer
   */
  findByLawyerId(lawyerId: string): Promise<EmergencyCall[]>;

  /**
   * Finds nearby lawyers within radius
   * Returns lawyer IDs with their distances
   */
  findNearbyLawyers(
    location: Location,
    radiusInMeters: number,
  ): Promise<
    Array<{
      lawyerId: string;
      distance: number;
      lastKnownLocation: Location;
    }>
  >;

  /**
   * Updates an emergency call
   */
  update(emergencyCall: EmergencyCall): Promise<EmergencyCall>;

  /**
   * Deletes an emergency call
   */
  delete(id: string): Promise<void>;

  /**
   * Finds active emergency calls (pending or accepted)
   */
  findActiveCalls(): Promise<EmergencyCall[]>;

  /**
   * Finds pending calls in a location within radius
   */
  findPendingCallsNearLocation(
    location: Location,
    radiusInMeters: number,
  ): Promise<EmergencyCall[]>;
}
