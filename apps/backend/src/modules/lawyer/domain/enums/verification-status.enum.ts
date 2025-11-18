/**
 * VerificationStatus
 *
 * Status of lawyer verification process
 */
export enum VerificationStatus {
  /** Not yet submitted for verification */
  NotSubmitted = 'not_submitted',

  /** Submitted, waiting for review */
  Pending = 'pending',

  /** Under review by admin */
  InReview = 'in_review',

  /** Verification approved */
  Approved = 'approved',

  /** Verification rejected */
  Rejected = 'rejected',

  /** Additional documents requested */
  DocumentsRequested = 'documents_requested',
}
