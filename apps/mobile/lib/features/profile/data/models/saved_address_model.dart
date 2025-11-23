import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/saved_address.entity.dart';

part 'saved_address_model.g.dart';

/// Saved address model
@JsonSerializable()
class SavedAddressModel {
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  final String label;
  final String address;
  final double latitude;
  final double longitude;
  @JsonKey(name: 'is_default')
  final bool isDefault;
  @JsonKey(name: 'created_at')
  final String createdAt;
  @JsonKey(name: 'updated_at')
  final String updatedAt;

  const SavedAddressModel({
    required this.id,
    required this.userId,
    required this.label,
    required this.address,
    required this.latitude,
    required this.longitude,
    required this.isDefault,
    required this.createdAt,
    required this.updatedAt,
  });

  /// From JSON
  factory SavedAddressModel.fromJson(Map<String, dynamic> json) =>
      _$SavedAddressModelFromJson(json);

  /// To JSON
  Map<String, dynamic> toJson() => _$SavedAddressModelToJson(this);

  /// To entity
  SavedAddressEntity toEntity() {
    return SavedAddressEntity(
      id: id,
      userId: userId,
      label: label,
      address: address,
      latitude: latitude,
      longitude: longitude,
      isDefault: isDefault,
      createdAt: DateTime.parse(createdAt),
      updatedAt: DateTime.parse(updatedAt),
    );
  }

  /// From entity
  factory SavedAddressModel.fromEntity(SavedAddressEntity entity) {
    return SavedAddressModel(
      id: entity.id,
      userId: entity.userId,
      label: entity.label,
      address: entity.address,
      latitude: entity.latitude,
      longitude: entity.longitude,
      isDefault: entity.isDefault,
      createdAt: entity.createdAt.toIso8601String(),
      updatedAt: entity.updatedAt.toIso8601String(),
    );
  }
}
