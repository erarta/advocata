/**
 * User account status
 *
 * Tracks the lifecycle of a user account
 */
export enum UserStatus {
  /** User registered but not verified phone/email */
  PendingVerification = 'pending_verification',

  /** User verified and can use the platform */
  Active = 'active',

  /** User account suspended (can be reactivated) */
  Suspended = 'suspended',

  /** User account permanently banned */
  Banned = 'banned',

  /** User deleted their account */
  Deleted = 'deleted',
}
