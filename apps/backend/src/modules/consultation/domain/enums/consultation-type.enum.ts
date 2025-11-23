/**
 * Consultation Type
 */
export enum ConsultationType {
  /** Emergency consultation (ДТП, arrest, etc.) */
  Emergency = 'emergency',

  /** Scheduled consultation */
  Scheduled = 'scheduled',

  /** Phone consultation */
  Phone = 'phone',

  /** Video consultation */
  Video = 'video',

  /** Text chat consultation */
  Chat = 'chat',

  /** In-person consultation */
  InPerson = 'in_person',
}

/**
 * Get display name for consultation type
 */
export function getConsultationTypeDisplay(type: ConsultationType): string {
  switch (type) {
    case ConsultationType.Emergency:
      return 'Экстренная консультация';
    case ConsultationType.Scheduled:
      return 'Запланированная консультация';
    case ConsultationType.Phone:
      return 'Телефонная консультация';
    case ConsultationType.Video:
      return 'Видеоконсультация';
    case ConsultationType.Chat:
      return 'Чат';
    case ConsultationType.InPerson:
      return 'Личная встреча';
  }
}
