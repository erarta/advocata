import 'package:flutter_test/flutter_test.dart';
import 'package:advocata/features/emergency_call/domain/entities/location.entity.dart';

void main() {
  group('LocationEntity', () {
    test('should create location from coordinates', () {
      // Arrange & Act
      final location = LocationEntity.fromCoordinates(
        latitude: 59.9311,
        longitude: 30.3609,
      );

      // Assert
      expect(location.latitude, 59.9311);
      expect(location.longitude, 30.3609);
      expect(location.address, isNull);
      expect(location.city, isNull);
    });

    test('should create location with full address', () {
      // Arrange & Act
      final location = LocationEntity.withAddress(
        latitude: 59.9311,
        longitude: 30.3609,
        address: 'Nevsky Prospect, 1',
        city: 'St. Petersburg',
        region: 'Leningrad Oblast',
        country: 'Russia',
      );

      // Assert
      expect(location.latitude, 59.9311);
      expect(location.longitude, 30.3609);
      expect(location.address, 'Nevsky Prospect, 1');
      expect(location.city, 'St. Petersburg');
      expect(location.region, 'Leningrad Oblast');
      expect(location.country, 'Russia');
    });

    test('should get full address string', () {
      // Arrange
      final location = LocationEntity.withAddress(
        latitude: 59.9311,
        longitude: 30.3609,
        address: 'Nevsky Prospect, 1',
        city: 'St. Petersburg',
        region: 'Leningrad Oblast',
        country: 'Russia',
      );

      // Act
      final fullAddress = location.fullAddress;

      // Assert
      expect(
        fullAddress,
        'Nevsky Prospect, 1, St. Petersburg, Leningrad Oblast, Russia',
      );
    });

    test('should get short address string', () {
      // Arrange
      final location = LocationEntity.withAddress(
        latitude: 59.9311,
        longitude: 30.3609,
        address: 'Nevsky Prospect, 1',
        city: 'St. Petersburg',
        region: 'Leningrad Oblast',
        country: 'Russia',
      );

      // Act
      final shortAddress = location.shortAddress;

      // Assert
      expect(shortAddress, 'Nevsky Prospect, 1, St. Petersburg');
    });

    test('should handle null values in address strings', () {
      // Arrange
      final location = LocationEntity.fromCoordinates(
        latitude: 59.9311,
        longitude: 30.3609,
      );

      // Act & Assert
      expect(location.fullAddress, '');
      expect(location.shortAddress, '');
    });

    test('should create copy with updated fields', () {
      // Arrange
      final location = LocationEntity.fromCoordinates(
        latitude: 59.9311,
        longitude: 30.3609,
      );

      // Act
      final updated = location.copyWith(
        address: 'New Address',
        city: 'New City',
      );

      // Assert
      expect(updated.latitude, 59.9311);
      expect(updated.longitude, 30.3609);
      expect(updated.address, 'New Address');
      expect(updated.city, 'New City');
    });

    test('should be equal when properties are the same', () {
      // Arrange
      final location1 = LocationEntity.withAddress(
        latitude: 59.9311,
        longitude: 30.3609,
        address: 'Test Address',
        city: 'Test City',
      );

      final location2 = LocationEntity.withAddress(
        latitude: 59.9311,
        longitude: 30.3609,
        address: 'Test Address',
        city: 'Test City',
      );

      // Act & Assert
      expect(location1, equals(location2));
    });
  });
}
