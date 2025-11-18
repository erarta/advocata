import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';
import 'package:advocata/features/consultation/domain/repositories/consultation_repository.dart';
import 'package:advocata/features/consultation/data/datasources/consultation_remote_datasource.dart';

/// Implementation of ConsultationRepository
class ConsultationRepositoryImpl implements ConsultationRepository {
  final ConsultationRemoteDataSource _remoteDataSource;

  ConsultationRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<ConsultationEntity>> bookConsultation({
    required String lawyerId,
    required String consultationType,
    required String description,
    DateTime? scheduledStart,
    DateTime? scheduledEnd,
  }) async {
    try {
      final model = await _remoteDataSource.bookConsultation(
        lawyerId: lawyerId,
        consultationType: consultationType,
        description: description,
        scheduledStart: scheduledStart,
        scheduledEnd: scheduledEnd,
      );

      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<ConsultationEntity>> getConsultationById(
    String consultationId,
  ) async {
    try {
      final model =
          await _remoteDataSource.getConsultationById(consultationId);
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<List<ConsultationEntity>>> getUserConsultations({
    String? status,
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final models = await _remoteDataSource.getUserConsultations(
        status: status,
        limit: limit,
        offset: offset,
      );

      final entities = models.map((model) => model.toEntity()).toList();
      return Result.ok(entities);
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<List<ConsultationEntity>>> getLawyerConsultations({
    required String lawyerId,
    String? status,
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final models = await _remoteDataSource.getLawyerConsultations(
        lawyerId: lawyerId,
        status: status,
        limit: limit,
        offset: offset,
      );

      final entities = models.map((model) => model.toEntity()).toList();
      return Result.ok(entities);
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<ConsultationEntity>> confirmConsultation(
    String consultationId,
  ) async {
    try {
      final model =
          await _remoteDataSource.confirmConsultation(consultationId);
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<ConsultationEntity>> startConsultation(
    String consultationId,
  ) async {
    try {
      final model = await _remoteDataSource.startConsultation(consultationId);
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<ConsultationEntity>> completeConsultation(
    String consultationId,
  ) async {
    try {
      final model =
          await _remoteDataSource.completeConsultation(consultationId);
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<ConsultationEntity>> cancelConsultation({
    required String consultationId,
    required String reason,
  }) async {
    try {
      final model = await _remoteDataSource.cancelConsultation(
        consultationId: consultationId,
        reason: reason,
      );
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<ConsultationEntity>> rateConsultation({
    required String consultationId,
    required int rating,
    String? review,
  }) async {
    try {
      final model = await _remoteDataSource.rateConsultation(
        consultationId: consultationId,
        rating: rating,
        review: review,
      );
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<ConsultationEntity?>> getActiveConsultation() async {
    try {
      final model = await _remoteDataSource.getActiveConsultation();

      if (model == null) {
        return Result.ok(null);
      }

      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }
}
