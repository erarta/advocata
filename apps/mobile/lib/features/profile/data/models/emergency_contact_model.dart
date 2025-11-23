import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/emergency_contact.entity.dart';

part 'emergency_contact_model.g.dart';

/// Emergency contact model
@JsonSerializable()
class EmergencyContactModel {
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  final String name;
  @JsonKey(name: 'phone_number')
  final String phoneNumber;
  final String relationship;
  @JsonKey(name: 'created_at')
  final String createdAt;
  @JsonKey(name: 'updated_at')
  final String updatedAt;

  const EmergencyContactModel({
    required this.id,
    required this.userId,
    required this.name,
    required this.phoneNumber,
    required this.relationship,
    required this.createdAt,
    required this.updatedAt,
  });

  /// From JSON
  factory EmergencyContactModel.fromJson(Map<String, dynamic> json) =>
      _$EmergencyContactModelFromJson(json);

  /// To JSON
  Map<String, dynamic> toJson() => _$EmergencyContactModelToJson(this);

  /// To entity
  EmergencyContactEntity toEntity() {
    return EmergencyContactEntity(
      id: id,
      userId: userId,
      name: name,
      phoneNumber: phoneNumber,
      relationship: relationship,
      createdAt: DateTime.parse(createdAt),
      updatedAt: DateTime.parse(updatedAt),
    );
  }

  /// From entity
  factory EmergencyContactModel.fromEntity(EmergencyContactEntity entity) {
    return EmergencyContactModel(
      id: entity.id,
      userId: entity.userId,
      name: entity.name,
      phoneNumber: entity.phoneNumber,
      relationship: entity.relationship,
      createdAt: entity.createdAt.toIso8601String(),
      updatedAt: entity.updatedAt.toIso8601String(),
    );
  }
}
