import 'package:advocata/features/emergency_call/data/datasources/emergency_call_remote_datasource.dart';
import 'package:advocata/features/emergency_call/domain/entities/emergency_call.entity.dart';
import 'package:advocata/features/emergency_call/domain/repositories/emergency_call_repository.dart';
import 'package:advocata/features/lawyer/domain/entities/lawyer.entity.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Implementation of EmergencyCallRepository
/// Handles data operations for emergency calls
class EmergencyCallRepositoryImpl implements EmergencyCallRepository {
  final EmergencyCallRemoteDataSource _remoteDataSource;
  final SupabaseClient _supabase;

  EmergencyCallRepositoryImpl(
    this._remoteDataSource,
    this._supabase,
  );

  @override
  Future<EmergencyCallEntity> createEmergencyCall({
    required String userId,
    required double latitude,
    required double longitude,
    required String address,
    String? notes,
  }) async {
    try {
      final model = await _remoteDataSource.createEmergencyCall(
        userId: userId,
        latitude: latitude,
        longitude: longitude,
        address: address,
        notes: notes,
      );
      return model.toEntity();
    } catch (e) {
      throw Exception('Failed to create emergency call: $e');
    }
  }

  @override
  Future<EmergencyCallEntity?> getEmergencyCall(String id) async {
    try {
      final model = await _remoteDataSource.getEmergencyCall(id);
      return model.toEntity();
    } catch (e) {
      throw Exception('Failed to get emergency call: $e');
    }
  }

  @override
  Future<List<EmergencyCallEntity>> getUserEmergencyCalls(String userId) async {
    try {
      final models = await _remoteDataSource.getUserEmergencyCalls(userId);
      return models.map((model) => model.toEntity()).toList();
    } catch (e) {
      throw Exception('Failed to get user emergency calls: $e');
    }
  }

  @override
  Future<List<LawyerEntity>> getNearbyLawyers({
    required double latitude,
    required double longitude,
    double radiusInMeters = 10000,
  }) async {
    try {
      final models = await _remoteDataSource.getNearbyLawyers(
        latitude: latitude,
        longitude: longitude,
        radiusInMeters: radiusInMeters,
      );
      return models.map((model) => model.toEntity()).toList();
    } catch (e) {
      throw Exception('Failed to get nearby lawyers: $e');
    }
  }

  @override
  Future<EmergencyCallEntity> updateCallStatus(
    String callId,
    EmergencyCallStatus status,
  ) async {
    try {
      // This would be implemented based on your API
      throw UnimplementedError('Update call status not implemented');
    } catch (e) {
      throw Exception('Failed to update call status: $e');
    }
  }

  @override
  Future<EmergencyCallEntity> acceptEmergencyCall(
    String callId,
    String lawyerId,
  ) async {
    try {
      final model = await _remoteDataSource.acceptEmergencyCall(
        callId,
        lawyerId,
      );
      return model.toEntity();
    } catch (e) {
      throw Exception('Failed to accept emergency call: $e');
    }
  }

  @override
  Future<EmergencyCallEntity> completeEmergencyCall(String callId) async {
    try {
      final model = await _remoteDataSource.completeEmergencyCall(callId);
      return model.toEntity();
    } catch (e) {
      throw Exception('Failed to complete emergency call: $e');
    }
  }

  @override
  Future<EmergencyCallEntity> cancelEmergencyCall(String callId) async {
    try {
      final model = await _remoteDataSource.cancelEmergencyCall(callId);
      return model.toEntity();
    } catch (e) {
      throw Exception('Failed to cancel emergency call: $e');
    }
  }

  @override
  Stream<EmergencyCallEntity> watchEmergencyCall(String callId) {
    try {
      return _supabase
          .from('emergency_calls')
          .stream(primaryKey: ['id'])
          .eq('id', callId)
          .map((data) {
            if (data.isEmpty) {
              throw Exception('Emergency call not found');
            }
            final json = data.first;
            // Convert JSON to model and then to entity
            // This assumes the table structure matches our model
            return EmergencyCallEntity(
              id: json['id'],
              userId: json['user_id'],
              lawyerId: json['lawyer_id'],
              latitude: json['latitude'],
              longitude: json['longitude'],
              address: json['address'],
              status: EmergencyCallStatusExtension.fromValue(json['status']),
              notes: json['notes'],
              createdAt: DateTime.parse(json['created_at']),
              acceptedAt: json['accepted_at'] != null
                  ? DateTime.parse(json['accepted_at'])
                  : null,
              completedAt: json['completed_at'] != null
                  ? DateTime.parse(json['completed_at'])
                  : null,
            );
          });
    } catch (e) {
      throw Exception('Failed to watch emergency call: $e');
    }
  }
}
