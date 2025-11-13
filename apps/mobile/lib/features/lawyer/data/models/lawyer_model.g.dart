// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'lawyer_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

LawyerModel _$LawyerModelFromJson(Map<String, dynamic> json) => LawyerModel(
      id: json['id'] as String,
      userId: json['user_id'] as String,
      firstName: json['first_name'] as String,
      lastName: json['last_name'] as String,
      middleName: json['middle_name'] as String?,
      avatarUrl: json['avatar_url'] as String?,
      licenseNumber: json['license_number'] as String,
      specializations: (json['specializations'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      yearsOfExperience: json['years_of_experience'] as int,
      rating: (json['rating'] as num).toDouble(),
      reviewCount: json['review_count'] as int,
      bio: json['bio'] as String?,
      education: json['education'] as String?,
      isAvailable: json['is_available'] as bool,
      status: json['status'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      updatedAt: json['updated_at'] == null
          ? null
          : DateTime.parse(json['updated_at'] as String),
    );

Map<String, dynamic> _$LawyerModelToJson(LawyerModel instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user_id': instance.userId,
      'first_name': instance.firstName,
      'last_name': instance.lastName,
      'middle_name': instance.middleName,
      'avatar_url': instance.avatarUrl,
      'license_number': instance.licenseNumber,
      'specializations': instance.specializations,
      'years_of_experience': instance.yearsOfExperience,
      'rating': instance.rating,
      'review_count': instance.reviewCount,
      'bio': instance.bio,
      'education': instance.education,
      'is_available': instance.isAvailable,
      'status': instance.status,
      'created_at': instance.createdAt.toIso8601String(),
      'updated_at': instance.updatedAt?.toIso8601String(),
    };
