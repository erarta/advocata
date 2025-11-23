import 'package:advocata/features/emergency_call/domain/entities/emergency_call.entity.dart';
import 'package:advocata/features/lawyer/domain/entities/lawyer.entity.dart';

/// Repository interface for emergency call operations
/// Follows repository pattern from DDD
abstract class EmergencyCallRepository {
  /// Creates a new emergency call
  /// Returns the created emergency call entity
  Future<EmergencyCallEntity> createEmergencyCall({
    required String userId,
    required double latitude,
    required double longitude,
    required String address,
    String? notes,
  });

  /// Gets an emergency call by ID
  Future<EmergencyCallEntity?> getEmergencyCall(String id);

  /// Gets all emergency calls for a user
  Future<List<EmergencyCallEntity>> getUserEmergencyCalls(String userId);

  /// Gets nearby lawyers based on location
  /// Returns lawyers within the specified radius (in meters)
  Future<List<LawyerEntity>> getNearbyLawyers({
    required double latitude,
    required double longitude,
    double radiusInMeters = 10000, // 10km default
  });

  /// Updates the status of an emergency call
  Future<EmergencyCallEntity> updateCallStatus(
    String callId,
    EmergencyCallStatus status,
  );

  /// Accepts an emergency call by a lawyer
  Future<EmergencyCallEntity> acceptEmergencyCall(
    String callId,
    String lawyerId,
  );

  /// Completes an emergency call
  Future<EmergencyCallEntity> completeEmergencyCall(String callId);

  /// Cancels an emergency call
  Future<EmergencyCallEntity> cancelEmergencyCall(String callId);

  /// Streams real-time updates for an emergency call
  Stream<EmergencyCallEntity> watchEmergencyCall(String callId);
}
