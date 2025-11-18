import 'package:equatable/equatable.dart';

/// Lawyer entity
class LawyerEntity extends Equatable {
  final String id;
  final String userId;
  final String firstName;
  final String lastName;
  final String? middleName;
  final String? avatarUrl;
  final String licenseNumber;
  final List<String> specializations;
  final int yearsOfExperience;
  final double rating;
  final int reviewCount;
  final String? bio;
  final String? education;
  final bool isAvailable;
  final LawyerStatus status;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const LawyerEntity({
    required this.id,
    required this.userId,
    required this.firstName,
    required this.lastName,
    this.middleName,
    this.avatarUrl,
    required this.licenseNumber,
    required this.specializations,
    required this.yearsOfExperience,
    required this.rating,
    required this.reviewCount,
    this.bio,
    this.education,
    required this.isAvailable,
    required this.status,
    required this.createdAt,
    this.updatedAt,
  });

  String get fullName {
    if (middleName != null) {
      return '$lastName $firstName $middleName';
    }
    return '$lastName $firstName';
  }

  String get shortName {
    final middleInitial = middleName?.isNotEmpty == true
        ? ' ${middleName![0]}.'
        : '';
    return '$lastName $firstName$middleInitial';
  }

  bool get isVerified => status == LawyerStatus.active;

  bool get hasGoodRating => rating >= 4.0;

  bool get isExperienced => yearsOfExperience >= 5;

  @override
  List<Object?> get props => [
        id,
        userId,
        firstName,
        lastName,
        middleName,
        avatarUrl,
        licenseNumber,
        specializations,
        yearsOfExperience,
        rating,
        reviewCount,
        bio,
        education,
        isAvailable,
        status,
        createdAt,
        updatedAt,
      ];
}

/// Lawyer status
enum LawyerStatus {
  pending,
  active,
  suspended,
  inactive;

  String get displayName {
    switch (this) {
      case LawyerStatus.pending:
        return 'На проверке';
      case LawyerStatus.active:
        return 'Активен';
      case LawyerStatus.suspended:
        return 'Приостановлен';
      case LawyerStatus.inactive:
        return 'Неактивен';
    }
  }
}

/// Specialization type
enum SpecializationType {
  trafficAccidents,
  criminalLaw,
  laborLaw,
  familyLaw,
  civilLaw,
  corporateLaw,
  taxLaw,
  realEstate,
  immigrationLaw;

  String get key {
    switch (this) {
      case SpecializationType.trafficAccidents:
        return 'traffic_accidents';
      case SpecializationType.criminalLaw:
        return 'criminal_law';
      case SpecializationType.laborLaw:
        return 'labor_law';
      case SpecializationType.familyLaw:
        return 'family_law';
      case SpecializationType.civilLaw:
        return 'civil_law';
      case SpecializationType.corporateLaw:
        return 'corporate_law';
      case SpecializationType.taxLaw:
        return 'tax_law';
      case SpecializationType.realEstate:
        return 'real_estate';
      case SpecializationType.immigrationLaw:
        return 'immigration_law';
    }
  }

  String get displayName {
    switch (this) {
      case SpecializationType.trafficAccidents:
        return 'ДТП';
      case SpecializationType.criminalLaw:
        return 'Уголовное право';
      case SpecializationType.laborLaw:
        return 'Трудовое право';
      case SpecializationType.familyLaw:
        return 'Семейное право';
      case SpecializationType.civilLaw:
        return 'Гражданское право';
      case SpecializationType.corporateLaw:
        return 'Корпоративное право';
      case SpecializationType.taxLaw:
        return 'Налоговое право';
      case SpecializationType.realEstate:
        return 'Недвижимость';
      case SpecializationType.immigrationLaw:
        return 'Миграционное право';
    }
  }

  static SpecializationType fromKey(String key) {
    switch (key) {
      case 'traffic_accidents':
        return SpecializationType.trafficAccidents;
      case 'criminal_law':
        return SpecializationType.criminalLaw;
      case 'labor_law':
        return SpecializationType.laborLaw;
      case 'family_law':
        return SpecializationType.familyLaw;
      case 'civil_law':
        return SpecializationType.civilLaw;
      case 'corporate_law':
        return SpecializationType.corporateLaw;
      case 'tax_law':
        return SpecializationType.taxLaw;
      case 'real_estate':
        return SpecializationType.realEstate;
      case 'immigration_law':
        return SpecializationType.immigrationLaw;
      default:
        throw ArgumentError('Unknown specialization key: $key');
    }
  }
}
