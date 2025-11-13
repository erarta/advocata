import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/lawyer_entity.dart';

part 'lawyer_model.g.dart';

/// Lawyer model for JSON serialization
@JsonSerializable()
class LawyerModel {
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  @JsonKey(name: 'first_name')
  final String firstName;
  @JsonKey(name: 'last_name')
  final String lastName;
  @JsonKey(name: 'middle_name')
  final String? middleName;
  @JsonKey(name: 'avatar_url')
  final String? avatarUrl;
  @JsonKey(name: 'license_number')
  final String licenseNumber;
  final List<String> specializations;
  @JsonKey(name: 'years_of_experience')
  final int yearsOfExperience;
  final double rating;
  @JsonKey(name: 'review_count')
  final int reviewCount;
  final String? bio;
  final String? education;
  @JsonKey(name: 'is_available')
  final bool isAvailable;
  final String status;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime? updatedAt;

  const LawyerModel({
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

  factory LawyerModel.fromJson(Map<String, dynamic> json) =>
      _$LawyerModelFromJson(json);

  Map<String, dynamic> toJson() => _$LawyerModelToJson(this);

  /// Convert to entity
  LawyerEntity toEntity() {
    return LawyerEntity(
      id: id,
      userId: userId,
      firstName: firstName,
      lastName: lastName,
      middleName: middleName,
      avatarUrl: avatarUrl,
      licenseNumber: licenseNumber,
      specializations: specializations,
      yearsOfExperience: yearsOfExperience,
      rating: rating,
      reviewCount: reviewCount,
      bio: bio,
      education: education,
      isAvailable: isAvailable,
      status: _parseStatus(status),
      createdAt: createdAt,
      updatedAt: updatedAt,
    );
  }

  /// Convert from entity
  factory LawyerModel.fromEntity(LawyerEntity entity) {
    return LawyerModel(
      id: entity.id,
      userId: entity.userId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      middleName: entity.middleName,
      avatarUrl: entity.avatarUrl,
      licenseNumber: entity.licenseNumber,
      specializations: entity.specializations,
      yearsOfExperience: entity.yearsOfExperience,
      rating: entity.rating,
      reviewCount: entity.reviewCount,
      bio: entity.bio,
      education: entity.education,
      isAvailable: entity.isAvailable,
      status: entity.status.name,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    );
  }

  static LawyerStatus _parseStatus(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return LawyerStatus.pending;
      case 'active':
        return LawyerStatus.active;
      case 'suspended':
        return LawyerStatus.suspended;
      case 'inactive':
        return LawyerStatus.inactive;
      default:
        return LawyerStatus.pending;
    }
  }
}
