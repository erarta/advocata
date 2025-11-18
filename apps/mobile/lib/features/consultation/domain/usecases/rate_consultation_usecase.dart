import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';
import 'package:advocata/features/consultation/domain/repositories/consultation_repository.dart';

/// Parameters for rating a consultation
class RateConsultationParams {
  final String consultationId;
  final int rating; // 1-5
  final String? review; // Optional review text

  const RateConsultationParams({
    required this.consultationId,
    required this.rating,
    this.review,
  });

  /// Validate parameters
  Result<void> validate() {
    // Rating validation
    if (rating < 1 || rating > 5) {
      return Result.fail('Оценка должна быть от 1 до 5');
    }

    // Review validation (optional)
    if (review != null) {
      if (review!.length > 1000) {
        return Result.fail('Отзыв не может быть длиннее 1000 символов');
      }
    }

    return Result.ok(null);
  }
}

/// Use case for rating a consultation
class RateConsultationUseCase {
  final ConsultationRepository repository;

  RateConsultationUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with rated ConsultationEntity or error
  Future<Result<ConsultationEntity>> execute(
    RateConsultationParams params,
  ) async {
    // Validate parameters
    final validationResult = params.validate();
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }

    // Rate consultation via repository
    return await repository.rateConsultation(
      consultationId: params.consultationId,
      rating: params.rating,
      review: params.review,
    );
  }
}
