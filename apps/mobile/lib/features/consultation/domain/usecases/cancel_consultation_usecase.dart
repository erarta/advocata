import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';
import 'package:advocata/features/consultation/domain/repositories/consultation_repository.dart';

/// Parameters for canceling a consultation
class CancelConsultationParams {
  final String consultationId;
  final String reason;

  const CancelConsultationParams({
    required this.consultationId,
    required this.reason,
  });

  /// Validate parameters
  Result<void> validate() {
    if (reason.trim().isEmpty) {
      return Result.fail('Укажите причину отмены');
    }

    if (reason.length < 5) {
      return Result.fail('Причина отмены должна содержать минимум 5 символов');
    }

    if (reason.length > 500) {
      return Result.fail('Причина отмены не может быть длиннее 500 символов');
    }

    return Result.ok(null);
  }
}

/// Use case for canceling a consultation
class CancelConsultationUseCase {
  final ConsultationRepository repository;

  CancelConsultationUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with cancelled ConsultationEntity or error
  Future<Result<ConsultationEntity>> execute(
    CancelConsultationParams params,
  ) async {
    // Validate parameters
    final validationResult = params.validate();
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }

    // Cancel consultation via repository
    return await repository.cancelConsultation(
      consultationId: params.consultationId,
      reason: params.reason,
    );
  }
}
