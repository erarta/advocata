/**
 * LawyerStatus
 *
 * Lifecycle status of a lawyer on the platform
 */
export enum LawyerStatus {
  /** Profile created, pending verification */
  PendingVerification = 'pending_verification',

  /** Verified and can take consultations */
  Active = 'active',

  /** Temporarily unavailable (vacation, etc.) */
  Inactive = 'inactive',

  /** Suspended due to violations */
  Suspended = 'suspended',

  /** Permanently banned */
  Banned = 'banned',

  /** Account deleted */
  Deleted = 'deleted',
}
