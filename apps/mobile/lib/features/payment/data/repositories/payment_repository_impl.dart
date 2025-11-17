import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/payment/domain/entities/payment_entity.dart';
import 'package:advocata/features/payment/domain/repositories/payment_repository.dart';
import 'package:advocata/features/payment/data/datasources/payment_remote_datasource.dart';

/// Implementation of PaymentRepository
class PaymentRepositoryImpl implements PaymentRepository {
  final PaymentRemoteDataSource _remoteDataSource;

  PaymentRepositoryImpl(this._remoteDataSource);

  @override
  Future<Result<PaymentEntity>> createConsultationPayment({
    required String consultationId,
    required double amount,
    required String paymentMethod,
  }) async {
    try {
      final model = await _remoteDataSource.createConsultationPayment(
        consultationId: consultationId,
        amount: amount,
        paymentMethod: paymentMethod,
      );
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<PaymentEntity>> createSubscriptionPayment({
    required String subscriptionId,
    required double amount,
    required String paymentMethod,
  }) async {
    try {
      final model = await _remoteDataSource.createSubscriptionPayment(
        subscriptionId: subscriptionId,
        amount: amount,
        paymentMethod: paymentMethod,
      );
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<PaymentEntity>> getPaymentById(String paymentId) async {
    try {
      final model = await _remoteDataSource.getPaymentById(paymentId);
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<List<PaymentEntity>>> getUserPayments({
    String? status,
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final models = await _remoteDataSource.getUserPayments(
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
  Future<Result<PaymentEntity>> requestRefund({
    required String paymentId,
    required String reason,
    double? amount,
  }) async {
    try {
      final model = await _remoteDataSource.requestRefund(
        paymentId: paymentId,
        reason: reason,
        amount: amount,
      );
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<PaymentEntity>> checkPaymentStatus(String paymentId) async {
    try {
      final model = await _remoteDataSource.getPaymentById(paymentId);
      return Result.ok(model.toEntity());
    } catch (e) {
      return Result.fail(e.toString());
    }
  }

  @override
  Future<Result<PaymentEntity>> processPayment(String paymentId) async {
    // This would typically call a dedicated endpoint
    // For now, we'll just fetch the payment status
    return checkPaymentStatus(paymentId);
  }
}
