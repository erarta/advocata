import 'package:advocata/features/emergency_call/data/datasources/geocoding_datasource.dart';
import 'package:advocata/features/emergency_call/domain/entities/location.entity.dart';
import 'package:advocata/features/emergency_call/domain/repositories/geocoding_repository.dart';

/// Implementation of GeocodingRepository
/// Handles geocoding and geolocation operations
class GeocodingRepositoryImpl implements GeocodingRepository {
  final GeocodingDataSource _dataSource;

  GeocodingRepositoryImpl(this._dataSource);

  @override
  Future<LocationEntity> getAddressFromCoordinates({
    required double latitude,
    required double longitude,
  }) async {
    try {
      final model = await _dataSource.getAddressFromCoordinates(
        latitude: latitude,
        longitude: longitude,
      );
      return model.toEntity();
    } catch (e) {
      throw Exception('Failed to get address from coordinates: $e');
    }
  }

  @override
  Future<LocationEntity> getCoordinatesFromAddress(String address) async {
    try {
      final model = await _dataSource.getCoordinatesFromAddress(address);
      return model.toEntity();
    } catch (e) {
      throw Exception('Failed to get coordinates from address: $e');
    }
  }

  @override
  Future<List<LocationEntity>> searchAddresses(String query) async {
    try {
      final models = await _dataSource.searchAddresses(query);
      return models.map((model) => model.toEntity()).toList();
    } catch (e) {
      throw Exception('Failed to search addresses: $e');
    }
  }

  @override
  Future<LocationEntity> getCurrentLocation() async {
    try {
      final model = await _dataSource.getCurrentLocation();
      return model.toEntity();
    } catch (e) {
      throw Exception('Failed to get current location: $e');
    }
  }

  @override
  Future<bool> requestLocationPermission() async {
    try {
      return await _dataSource.requestLocationPermission();
    } catch (e) {
      throw Exception('Failed to request location permission: $e');
    }
  }

  @override
  Future<bool> isLocationPermissionGranted() async {
    try {
      return await _dataSource.isLocationPermissionGranted();
    } catch (e) {
      throw Exception('Failed to check location permission: $e');
    }
  }
}
