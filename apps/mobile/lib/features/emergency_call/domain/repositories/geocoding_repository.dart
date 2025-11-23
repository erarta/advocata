import 'package:advocata/features/emergency_call/domain/entities/location.entity.dart';

/// Repository interface for geocoding operations
/// Handles address lookups and reverse geocoding
abstract class GeocodingRepository {
  /// Converts coordinates to address (reverse geocoding)
  Future<LocationEntity> getAddressFromCoordinates({
    required double latitude,
    required double longitude,
  });

  /// Converts address to coordinates (forward geocoding)
  Future<LocationEntity> getCoordinatesFromAddress(String address);

  /// Searches for addresses matching the query
  /// Used for autocomplete suggestions
  Future<List<LocationEntity>> searchAddresses(String query);

  /// Gets user's current location
  Future<LocationEntity> getCurrentLocation();

  /// Requests location permission from user
  Future<bool> requestLocationPermission();

  /// Checks if location permission is granted
  Future<bool> isLocationPermissionGranted();
}
