import { User } from '../entities';

/**
 * IUserRepository
 *
 * Repository interface for User aggregate
 * Implementation will be in Infrastructure layer
 */
export interface IUserRepository {
  /**
   * Generate next unique ID for User
   */
  nextId(): Promise<string>;

  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by phone number
   */
  findByPhoneNumber(phoneNumber: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Save user (create or update)
   */
  save(user: User): Promise<void>;

  /**
   * Delete user
   */
  delete(id: string): Promise<void>;

  /**
   * Check if phone number exists
   */
  existsByPhoneNumber(phoneNumber: string): Promise<boolean>;

  /**
   * Check if email exists
   */
  existsByEmail(email: string): Promise<boolean>;
}
