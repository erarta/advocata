import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';

/// Repository interface for consultations
abstract class ConsultationRepository {
  /// Book a new consultation
  ///
  /// Returns Result with ConsultationEntity on success
  Future<Result<ConsultationEntity>> bookConsultation({
    required String lawyerId,
    required String consultationType,
    required String description,
    DateTime? scheduledStart,
    DateTime? scheduledEnd,
  });

  /// Get consultation by ID
  ///
  /// Returns Result with ConsultationEntity or error if not found
  Future<Result<ConsultationEntity>> getConsultationById(String consultationId);

  /// Get user's consultations with optional status filter
  ///
  /// Returns Result with list of consultations
  Future<Result<List<ConsultationEntity>>> getUserConsultations({
    String? status,
    int limit = 50,
    int offset = 0,
  });

  /// Get lawyer's consultations
  ///
  /// Returns Result with list of consultations
  Future<Result<List<ConsultationEntity>>> getLawyerConsultations({
    required String lawyerId,
    String? status,
    int limit = 50,
    int offset = 0,
  });

  /// Confirm consultation (by lawyer)
  ///
  /// Returns Result with updated ConsultationEntity
  Future<Result<ConsultationEntity>> confirmConsultation(String consultationId);

  /// Start consultation
  ///
  /// Returns Result with updated ConsultationEntity
  Future<Result<ConsultationEntity>> startConsultation(String consultationId);

  /// Complete consultation
  ///
  /// Returns Result with updated ConsultationEntity
  Future<Result<ConsultationEntity>> completeConsultation(String consultationId);

  /// Cancel consultation
  ///
  /// Returns Result with updated ConsultationEntity
  Future<Result<ConsultationEntity>> cancelConsultation({
    required String consultationId,
    required String reason,
  });

  /// Rate consultation (by client)
  ///
  /// Returns Result with updated ConsultationEntity
  Future<Result<ConsultationEntity>> rateConsultation({
    required String consultationId,
    required int rating,
    String? review,
  });

  /// Get active consultation for user (if any)
  ///
  /// Returns Result with ConsultationEntity or null if none active
  Future<Result<ConsultationEntity?>> getActiveConsultation();
}
