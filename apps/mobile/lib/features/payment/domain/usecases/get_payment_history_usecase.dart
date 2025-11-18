import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/payment/domain/entities/payment_entity.dart';
import 'package:advocata/features/payment/domain/repositories/payment_repository.dart';

/// Parameters for getting payment history
class GetPaymentHistoryParams {
  final String? status; // Filter by status (optional)
  final int limit;
  final int offset;

  const GetPaymentHistoryParams({
    this.status,
    this.limit = 50,
    this.offset = 0,
  });
}

/// Use case for getting user's payment history
class GetPaymentHistoryUseCase {
  final PaymentRepository repository;

  GetPaymentHistoryUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with list of payments or error
  Future<Result<List<PaymentEntity>>> execute(
    GetPaymentHistoryParams params,
  ) async {
    return await repository.getUserPayments(
      status: params.status,
      limit: params.limit,
      offset: params.offset,
    );
  }
}
