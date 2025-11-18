import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';
import 'package:advocata/features/consultation/domain/repositories/consultation_repository.dart';

/// Parameters for booking a consultation
class BookConsultationParams {
  final String lawyerId;
  final String consultationType; // 'emergency' or 'scheduled'
  final String description;
  final DateTime? scheduledStart;
  final DateTime? scheduledEnd;

  const BookConsultationParams({
    required this.lawyerId,
    required this.consultationType,
    required this.description,
    this.scheduledStart,
    this.scheduledEnd,
  });

  /// Validate parameters
  Result<void> validate() {
    // Description validation
    if (description.trim().isEmpty) {
      return Result.fail('Описание проблемы не может быть пустым');
    }

    if (description.length < 10) {
      return Result.fail('Описание проблемы должно содержать минимум 10 символов');
    }

    if (description.length > 2000) {
      return Result.fail('Описание проблемы не может быть длиннее 2000 символов');
    }

    // Type validation
    if (consultationType != 'emergency' && consultationType != 'scheduled') {
      return Result.fail('Неверный тип консультации');
    }

    // Scheduled consultation must have time slot
    if (consultationType == 'scheduled') {
      if (scheduledStart == null || scheduledEnd == null) {
        return Result.fail('Запланированная консультация требует выбора времени');
      }

      if (scheduledStart!.isAfter(scheduledEnd!)) {
        return Result.fail('Время начала должно быть раньше времени окончания');
      }

      if (scheduledStart!.isBefore(DateTime.now())) {
        return Result.fail('Невозможно запланировать консультацию на прошедшее время');
      }
    }

    return Result.ok(null);
  }
}

/// Use case for booking a consultation
class BookConsultationUseCase {
  final ConsultationRepository repository;

  BookConsultationUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with booked ConsultationEntity or error
  Future<Result<ConsultationEntity>> execute(
    BookConsultationParams params,
  ) async {
    // Validate parameters
    final validationResult = params.validate();
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }

    // Book consultation via repository
    return await repository.bookConsultation(
      lawyerId: params.lawyerId,
      consultationType: params.consultationType,
      description: params.description,
      scheduledStart: params.scheduledStart,
      scheduledEnd: params.scheduledEnd,
    );
  }
}
