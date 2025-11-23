import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';
import 'package:advocata/features/emergency_call/data/models/location.model.dart';

/// Data source for geocoding and geolocation operations
/// Handles Yandex Maps geocoding and device location services
class GeocodingDataSource {
  /// Gets the user's current location
  Future<LocationModel> getCurrentLocation() async {
    try {
      final position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Get address from coordinates
      final placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (placemarks.isNotEmpty) {
        final placemark = placemarks.first;
        return LocationModel(
          latitude: position.latitude,
          longitude: position.longitude,
          address: placemark.street,
          city: placemark.locality,
          region: placemark.administrativeArea,
          country: placemark.country,
        );
      }

      return LocationModel(
        latitude: position.latitude,
        longitude: position.longitude,
      );
    } catch (e) {
      throw Exception('Failed to get current location: $e');
    }
  }

  /// Converts coordinates to address (reverse geocoding)
  Future<LocationModel> getAddressFromCoordinates({
    required double latitude,
    required double longitude,
  }) async {
    try {
      final placemarks = await placemarkFromCoordinates(latitude, longitude);

      if (placemarks.isEmpty) {
        throw Exception('No address found for coordinates');
      }

      final placemark = placemarks.first;
      return LocationModel(
        latitude: latitude,
        longitude: longitude,
        address: '${placemark.street}, ${placemark.subThoroughfare}',
        city: placemark.locality,
        region: placemark.administrativeArea,
        country: placemark.country,
      );
    } catch (e) {
      throw Exception('Failed to get address from coordinates: $e');
    }
  }

  /// Converts address to coordinates (forward geocoding)
  Future<LocationModel> getCoordinatesFromAddress(String address) async {
    try {
      final locations = await locationFromAddress(address);

      if (locations.isEmpty) {
        throw Exception('No coordinates found for address');
      }

      final location = locations.first;

      // Get full address details
      final placemarks = await placemarkFromCoordinates(
        location.latitude,
        location.longitude,
      );

      if (placemarks.isNotEmpty) {
        final placemark = placemarks.first;
        return LocationModel(
          latitude: location.latitude,
          longitude: location.longitude,
          address: placemark.street,
          city: placemark.locality,
          region: placemark.administrativeArea,
          country: placemark.country,
        );
      }

      return LocationModel(
        latitude: location.latitude,
        longitude: location.longitude,
      );
    } catch (e) {
      throw Exception('Failed to get coordinates from address: $e');
    }
  }

  /// Searches for addresses matching the query
  Future<List<LocationModel>> searchAddresses(String query) async {
    try {
      final locations = await locationFromAddress(query);

      final results = <LocationModel>[];
      for (final location in locations) {
        final placemarks = await placemarkFromCoordinates(
          location.latitude,
          location.longitude,
        );

        if (placemarks.isNotEmpty) {
          final placemark = placemarks.first;
          results.add(LocationModel(
            latitude: location.latitude,
            longitude: location.longitude,
            address: placemark.street,
            city: placemark.locality,
            region: placemark.administrativeArea,
            country: placemark.country,
          ));
        }
      }

      return results;
    } catch (e) {
      throw Exception('Failed to search addresses: $e');
    }
  }

  /// Requests location permission from user
  Future<bool> requestLocationPermission() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();

      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever) {
        return false;
      }

      return permission == LocationPermission.whileInUse ||
          permission == LocationPermission.always;
    } catch (e) {
      throw Exception('Failed to request location permission: $e');
    }
  }

  /// Checks if location permission is granted
  Future<bool> isLocationPermissionGranted() async {
    try {
      final permission = await Geolocator.checkPermission();
      return permission == LocationPermission.whileInUse ||
          permission == LocationPermission.always;
    } catch (e) {
      throw Exception('Failed to check location permission: $e');
    }
  }

  /// Checks if location services are enabled
  Future<bool> isLocationServiceEnabled() async {
    try {
      return await Geolocator.isLocationServiceEnabled();
    } catch (e) {
      throw Exception('Failed to check location service: $e');
    }
  }
}
