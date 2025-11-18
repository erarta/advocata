import 'package:flutter_test/flutter_test.dart';
import 'package:advocata/features/emergency_call/domain/entities/emergency_call.entity.dart';

void main() {
  group('EmergencyCallEntity', () {
    test('should create entity with factory method', () {
      // Arrange
      const id = 'test-id';
      const userId = 'user-123';
      const latitude = 59.9311;
      const longitude = 30.3609;
      const address = 'Test Address, St. Petersburg';

      // Act
      final entity = EmergencyCallEntity.create(
        id: id,
        userId: userId,
        latitude: latitude,
        longitude: longitude,
        address: address,
      );

      // Assert
      expect(entity.id, id);
      expect(entity.userId, userId);
      expect(entity.latitude, latitude);
      expect(entity.longitude, longitude);
      expect(entity.address, address);
      expect(entity.status, EmergencyCallStatus.pending);
      expect(entity.lawyerId, isNull);
    });

    test('should accept emergency call', () {
      // Arrange
      final entity = EmergencyCallEntity.create(
        id: 'test-id',
        userId: 'user-123',
        latitude: 59.9311,
        longitude: 30.3609,
        address: 'Test Address',
      );
      const lawyerId = 'lawyer-456';

      // Act
      final acceptedEntity = entity.accept(lawyerId);

      // Assert
      expect(acceptedEntity.lawyerId, lawyerId);
      expect(acceptedEntity.status, EmergencyCallStatus.accepted);
      expect(acceptedEntity.acceptedAt, isNotNull);
    });

    test('should complete emergency call', () {
      // Arrange
      final entity = EmergencyCallEntity.create(
        id: 'test-id',
        userId: 'user-123',
        latitude: 59.9311,
        longitude: 30.3609,
        address: 'Test Address',
      ).accept('lawyer-456');

      // Act
      final completedEntity = entity.complete();

      // Assert
      expect(completedEntity.status, EmergencyCallStatus.completed);
      expect(completedEntity.completedAt, isNotNull);
    });

    test('should cancel emergency call', () {
      // Arrange
      final entity = EmergencyCallEntity.create(
        id: 'test-id',
        userId: 'user-123',
        latitude: 59.9311,
        longitude: 30.3609,
        address: 'Test Address',
      );

      // Act
      final cancelledEntity = entity.cancel();

      // Assert
      expect(cancelledEntity.status, EmergencyCallStatus.cancelled);
    });

    test('should be equal when properties are the same', () {
      // Arrange
      final entity1 = EmergencyCallEntity.create(
        id: 'test-id',
        userId: 'user-123',
        latitude: 59.9311,
        longitude: 30.3609,
        address: 'Test Address',
      );

      final entity2 = EmergencyCallEntity.create(
        id: 'test-id',
        userId: 'user-123',
        latitude: 59.9311,
        longitude: 30.3609,
        address: 'Test Address',
      );

      // Act & Assert
      expect(entity1, equals(entity2));
    });
  });

  group('EmergencyCallStatus', () {
    test('should convert status to string value', () {
      expect(EmergencyCallStatus.pending.toValue(), 'pending');
      expect(EmergencyCallStatus.accepted.toValue(), 'accepted');
      expect(EmergencyCallStatus.completed.toValue(), 'completed');
      expect(EmergencyCallStatus.cancelled.toValue(), 'cancelled');
    });

    test('should convert string to status enum', () {
      expect(
        EmergencyCallStatusExtension.fromValue('pending'),
        EmergencyCallStatus.pending,
      );
      expect(
        EmergencyCallStatusExtension.fromValue('accepted'),
        EmergencyCallStatus.accepted,
      );
      expect(
        EmergencyCallStatusExtension.fromValue('completed'),
        EmergencyCallStatus.completed,
      );
      expect(
        EmergencyCallStatusExtension.fromValue('cancelled'),
        EmergencyCallStatus.cancelled,
      );
    });

    test('should throw error for invalid status string', () {
      expect(
        () => EmergencyCallStatusExtension.fromValue('invalid'),
        throwsArgumentError,
      );
    });
  });
}
