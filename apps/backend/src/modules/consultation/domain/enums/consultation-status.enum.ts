/**
 * Consultation Status
 *
 * Lifecycle: pending → confirmed → active → completed
 * Can be cancelled or failed at any point
 */
export enum ConsultationStatus {
  /** Consultation requested, waiting for lawyer confirmation */
  Pending = 'pending',

  /** Lawyer confirmed, waiting for scheduled time */
  Confirmed = 'confirmed',

  /** Consultation in progress */
  Active = 'active',

  /** Consultation completed successfully */
  Completed = 'completed',

  /** Consultation cancelled (by client or lawyer) */
  Cancelled = 'cancelled',

  /** Consultation failed (technical issues, no-show) */
  Failed = 'failed',

  /** Consultation expired (not confirmed in time) */
  Expired = 'expired',
}

/**
 * Get display name for consultation status
 */
export function getConsultationStatusDisplay(status: ConsultationStatus): string {
  switch (status) {
    case ConsultationStatus.Pending:
      return 'Ожидает подтверждения';
    case ConsultationStatus.Confirmed:
      return 'Подтверждена';
    case ConsultationStatus.Active:
      return 'Активна';
    case ConsultationStatus.Completed:
      return 'Завершена';
    case ConsultationStatus.Cancelled:
      return 'Отменена';
    case ConsultationStatus.Failed:
      return 'Не состоялась';
    case ConsultationStatus.Expired:
      return 'Истекла';
  }
}

/**
 * Check if status is final (cannot be changed)
 */
export function isF inalStatus(status: ConsultationStatus): boolean {
  return [
    ConsultationStatus.Completed,
    ConsultationStatus.Cancelled,
    ConsultationStatus.Failed,
    ConsultationStatus.Expired,
  ].includes(status);
}
