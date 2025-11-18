import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/payment/domain/entities/payment_entity.dart';
import 'package:advocata/features/payment/domain/repositories/payment_repository.dart';

/// Parameters for creating consultation payment
class CreateConsultationPaymentParams {
  final String consultationId;
  final double amount;
  final String paymentMethod; // 'bank_card', 'yoomoney', etc.

  const CreateConsultationPaymentParams({
    required this.consultationId,
    required this.amount,
    required this.paymentMethod,
  });

  /// Validate parameters
  Result<void> validate() {
    if (consultationId.isEmpty) {
      return Result.fail('ID консультации не указан');
    }

    if (amount <= 0) {
      return Result.fail('Сумма должна быть больше нуля');
    }

    if (amount > 100000) {
      return Result.fail('Сумма не может превышать 100,000₽');
    }

    final validMethods = [
      'bank_card',
      'yoomoney',
      'qiwi',
      'sbp',
      'sberbank',
      'tinkoff',
    ];

    if (!validMethods.contains(paymentMethod)) {
      return Result.fail('Неверный способ оплаты');
    }

    return Result.ok(null);
  }
}

/// Use case for creating consultation payment
class CreateConsultationPaymentUseCase {
  final PaymentRepository repository;

  CreateConsultationPaymentUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with PaymentEntity or error
  Future<Result<PaymentEntity>> execute(
    CreateConsultationPaymentParams params,
  ) async {
    // Validate parameters
    final validationResult = params.validate();
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }

    // Create payment via repository
    return await repository.createConsultationPayment(
      consultationId: params.consultationId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
    );
  }
}
