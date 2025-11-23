import 'package:advocata/features/emergency_call/domain/entities/location.entity.dart';

/// Data model for location
/// Maps between API/Geocoding service JSON and domain entity
class LocationModel {
  final double latitude;
  final double longitude;
  final String? address;
  final String? city;
  final String? region;
  final String? country;

  const LocationModel({
    required this.latitude,
    required this.longitude,
    this.address,
    this.city,
    this.region,
    this.country,
  });

  /// Creates model from JSON response
  factory LocationModel.fromJson(Map<String, dynamic> json) {
    return LocationModel(
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      address: json['address'] as String?,
      city: json['city'] as String?,
      region: json['region'] as String?,
      country: json['country'] as String?,
    );
  }

  /// Creates model from Yandex Geocoder response
  factory LocationModel.fromYandexGeocoder(Map<String, dynamic> json) {
    final geoObject = json['GeoObject'];
    final point = geoObject['Point']['pos'].split(' ');
    final addressComponents = geoObject['metaDataProperty']
        ['GeocoderMetaData']['Address']['Components'] as List;

    String? address;
    String? city;
    String? region;
    String? country;

    for (var component in addressComponents) {
      final kind = component['kind'] as String;
      final name = component['name'] as String;

      switch (kind) {
        case 'street':
        case 'house':
          address = name;
          break;
        case 'locality':
          city = name;
          break;
        case 'province':
          region = name;
          break;
        case 'country':
          country = name;
          break;
      }
    }

    return LocationModel(
      longitude: double.parse(point[0]),
      latitude: double.parse(point[1]),
      address: address,
      city: city,
      region: region,
      country: country,
    );
  }

  /// Converts model to JSON
  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
      'city': city,
      'region': region,
      'country': country,
    };
  }

  /// Converts model to domain entity
  LocationEntity toEntity() {
    return LocationEntity(
      latitude: latitude,
      longitude: longitude,
      address: address,
      city: city,
      region: region,
      country: country,
    );
  }

  /// Creates model from domain entity
  factory LocationModel.fromEntity(LocationEntity entity) {
    return LocationModel(
      latitude: entity.latitude,
      longitude: entity.longitude,
      address: entity.address,
      city: entity.city,
      region: entity.region,
      country: entity.country,
    );
  }
}
