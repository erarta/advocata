import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/payment/domain/entities/payment_entity.dart';
import 'package:advocata/features/payment/domain/repositories/payment_repository.dart';

/// Parameters for requesting refund
class RequestRefundParams {
  final String paymentId;
  final String reason;
  final double? amount; // Optional partial refund amount

  const RequestRefundParams({
    required this.paymentId,
    required this.reason,
    this.amount,
  });

  /// Validate parameters
  Result<void> validate() {
    if (paymentId.isEmpty) {
      return Result.fail('ID платежа не указан');
    }

    if (reason.trim().isEmpty) {
      return Result.fail('Укажите причину возврата');
    }

    if (reason.length < 5) {
      return Result.fail('Причина возврата должна содержать минимум 5 символов');
    }

    if (reason.length > 500) {
      return Result.fail('Причина возврата не может быть длиннее 500 символов');
    }

    if (amount != null && amount! <= 0) {
      return Result.fail('Сумма возврата должна быть больше нуля');
    }

    return Result.ok(null);
  }
}

/// Use case for requesting payment refund
class RequestRefundUseCase {
  final PaymentRepository repository;

  RequestRefundUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with updated PaymentEntity or error
  Future<Result<PaymentEntity>> execute(
    RequestRefundParams params,
  ) async {
    // Validate parameters
    final validationResult = params.validate();
    if (validationResult.isFailure) {
      return Result.fail(validationResult.error);
    }

    // Request refund via repository
    return await repository.requestRefund(
      paymentId: params.paymentId,
      reason: params.reason,
      amount: params.amount,
    );
  }
}
