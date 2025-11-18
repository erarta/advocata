/**
 * SpecializationType
 *
 * Legal specialization areas available on the platform
 */
export enum SpecializationType {
  /** ДТП - Traffic accidents */
  TrafficAccidents = 'traffic_accidents',

  /** Уголовное право - Criminal law */
  CriminalLaw = 'criminal_law',

  /** Трудовое право - Labor law */
  LaborLaw = 'labor_law',

  /** Семейное право - Family law */
  FamilyLaw = 'family_law',

  /** Гражданское право - Civil law */
  CivilLaw = 'civil_law',

  /** Корпоративное право - Corporate law */
  CorporateLaw = 'corporate_law',

  /** Налоговое право - Tax law */
  TaxLaw = 'tax_law',

  /** Недвижимость - Real estate */
  RealEstate = 'real_estate',

  /** Миграционное право - Immigration law */
  ImmigrationLaw = 'immigration_law',
}

/**
 * Get Russian name for specialization
 */
export function getSpecializationName(type: SpecializationType): string {
  const names: Record<SpecializationType, string> = {
    [SpecializationType.TrafficAccidents]: 'ДТП',
    [SpecializationType.CriminalLaw]: 'Уголовное право',
    [SpecializationType.LaborLaw]: 'Трудовое право',
    [SpecializationType.FamilyLaw]: 'Семейное право',
    [SpecializationType.CivilLaw]: 'Гражданское право',
    [SpecializationType.CorporateLaw]: 'Корпоративное право',
    [SpecializationType.TaxLaw]: 'Налоговое право',
    [SpecializationType.RealEstate]: 'Недвижимость',
    [SpecializationType.ImmigrationLaw]: 'Миграционное право',
  };
  return names[type];
}
