import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/payment/domain/entities/payment_entity.dart';

/// Repository interface for payments
abstract class PaymentRepository {
  /// Create payment for consultation
  ///
  /// Returns Result with PaymentEntity on success
  Future<Result<PaymentEntity>> createConsultationPayment({
    required String consultationId,
    required double amount,
    required String paymentMethod,
  });

  /// Create payment for subscription
  ///
  /// Returns Result with PaymentEntity on success
  Future<Result<PaymentEntity>> createSubscriptionPayment({
    required String subscriptionId,
    required double amount,
    required String paymentMethod,
  });

  /// Get payment by ID
  ///
  /// Returns Result with PaymentEntity or error if not found
  Future<Result<PaymentEntity>> getPaymentById(String paymentId);

  /// Get user's payment history
  ///
  /// Returns Result with list of payments
  Future<Result<List<PaymentEntity>>> getUserPayments({
    String? status,
    int limit = 50,
    int offset = 0,
  });

  /// Request refund for payment
  ///
  /// Returns Result with updated PaymentEntity
  Future<Result<PaymentEntity>> requestRefund({
    required String paymentId,
    required String reason,
    double? amount, // Optional partial refund amount
  });

  /// Get payment status from external provider (ЮКасса)
  ///
  /// Returns Result with updated PaymentEntity
  Future<Result<PaymentEntity>> checkPaymentStatus(String paymentId);

  /// Process payment (internal)
  ///
  /// Returns Result with updated PaymentEntity
  Future<Result<PaymentEntity>> processPayment(String paymentId);
}
