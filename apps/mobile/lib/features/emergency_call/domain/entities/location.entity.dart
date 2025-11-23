import 'package:equatable/equatable.dart';

/// Represents a geographical location with coordinates and address
class LocationEntity extends Equatable {
  final double latitude;
  final double longitude;
  final String? address;
  final String? city;
  final String? region;
  final String? country;

  const LocationEntity({
    required this.latitude,
    required this.longitude,
    this.address,
    this.city,
    this.region,
    this.country,
  });

  /// Creates a location from coordinates
  factory LocationEntity.fromCoordinates({
    required double latitude,
    required double longitude,
  }) {
    return LocationEntity(
      latitude: latitude,
      longitude: longitude,
    );
  }

  /// Creates a location with full address information
  factory LocationEntity.withAddress({
    required double latitude,
    required double longitude,
    String? address,
    String? city,
    String? region,
    String? country,
  }) {
    return LocationEntity(
      latitude: latitude,
      longitude: longitude,
      address: address,
      city: city,
      region: region,
      country: country,
    );
  }

  /// Gets formatted full address
  String get fullAddress {
    final parts = <String>[];
    if (address != null) parts.add(address!);
    if (city != null) parts.add(city!);
    if (region != null) parts.add(region!);
    if (country != null) parts.add(country!);
    return parts.join(', ');
  }

  /// Gets short address (street and city)
  String get shortAddress {
    final parts = <String>[];
    if (address != null) parts.add(address!);
    if (city != null) parts.add(city!);
    return parts.join(', ');
  }

  /// Creates a copy with updated fields
  LocationEntity copyWith({
    double? latitude,
    double? longitude,
    String? address,
    String? city,
    String? region,
    String? country,
  }) {
    return LocationEntity(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      address: address ?? this.address,
      city: city ?? this.city,
      region: region ?? this.region,
      country: country ?? this.country,
    );
  }

  @override
  List<Object?> get props => [
        latitude,
        longitude,
        address,
        city,
        region,
        country,
      ];
}
