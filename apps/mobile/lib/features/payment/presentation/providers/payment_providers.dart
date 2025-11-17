import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:advocata/features/payment/domain/repositories/payment_repository.dart';
import 'package:advocata/features/payment/domain/repositories/subscription_repository.dart';
import 'package:advocata/features/payment/domain/usecases/create_consultation_payment_usecase.dart';
import 'package:advocata/features/payment/domain/usecases/get_payment_history_usecase.dart';
import 'package:advocata/features/payment/domain/usecases/request_refund_usecase.dart';
import 'package:advocata/features/payment/domain/usecases/create_subscription_usecase.dart';
import 'package:advocata/features/payment/domain/usecases/get_active_subscription_usecase.dart';
import 'package:advocata/features/payment/domain/usecases/cancel_subscription_usecase.dart';
import 'package:advocata/features/payment/data/datasources/payment_remote_datasource.dart';
import 'package:advocata/features/payment/data/datasources/subscription_remote_datasource.dart';
import 'package:advocata/features/payment/data/repositories/payment_repository_impl.dart';
import 'package:advocata/features/payment/data/repositories/subscription_repository_impl.dart';

/// Provider for Dio instance
final paymentDioProvider = Provider<Dio>((ref) => Dio());

// ============================================================================
// DATA SOURCES
// ============================================================================

/// Provider for payment remote data source
final paymentRemoteDataSourceProvider =
    Provider<PaymentRemoteDataSource>((ref) {
  final dio = ref.watch(paymentDioProvider);
  return PaymentRemoteDataSource(dio: dio);
});

/// Provider for subscription remote data source
final subscriptionRemoteDataSourceProvider =
    Provider<SubscriptionRemoteDataSource>((ref) {
  final dio = ref.watch(paymentDioProvider);
  return SubscriptionRemoteDataSource(dio: dio);
});

// ============================================================================
// REPOSITORIES
// ============================================================================

/// Provider for payment repository
final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  final remoteDataSource = ref.watch(paymentRemoteDataSourceProvider);
  return PaymentRepositoryImpl(remoteDataSource);
});

/// Provider for subscription repository
final subscriptionRepositoryProvider = Provider<SubscriptionRepository>((ref) {
  final remoteDataSource = ref.watch(subscriptionRemoteDataSourceProvider);
  return SubscriptionRepositoryImpl(remoteDataSource);
});

// ============================================================================
// PAYMENT USE CASES
// ============================================================================

/// Provider for create consultation payment use case
final createConsultationPaymentUseCaseProvider =
    Provider<CreateConsultationPaymentUseCase>((ref) {
  final repository = ref.watch(paymentRepositoryProvider);
  return CreateConsultationPaymentUseCase(repository);
});

/// Provider for get payment history use case
final getPaymentHistoryUseCaseProvider =
    Provider<GetPaymentHistoryUseCase>((ref) {
  final repository = ref.watch(paymentRepositoryProvider);
  return GetPaymentHistoryUseCase(repository);
});

/// Provider for request refund use case
final requestRefundUseCaseProvider = Provider<RequestRefundUseCase>((ref) {
  final repository = ref.watch(paymentRepositoryProvider);
  return RequestRefundUseCase(repository);
});

// ============================================================================
// SUBSCRIPTION USE CASES
// ============================================================================

/// Provider for create subscription use case
final createSubscriptionUseCaseProvider =
    Provider<CreateSubscriptionUseCase>((ref) {
  final repository = ref.watch(subscriptionRepositoryProvider);
  return CreateSubscriptionUseCase(repository);
});

/// Provider for get active subscription use case
final getActiveSubscriptionUseCaseProvider =
    Provider<GetActiveSubscriptionUseCase>((ref) {
  final repository = ref.watch(subscriptionRepositoryProvider);
  return GetActiveSubscriptionUseCase(repository);
});

/// Provider for cancel subscription use case
final cancelSubscriptionUseCaseProvider =
    Provider<CancelSubscriptionUseCase>((ref) {
  final repository = ref.watch(subscriptionRepositoryProvider);
  return CancelSubscriptionUseCase(repository);
});

// ============================================================================
// FUTURE PROVIDERS
// ============================================================================

/// Provider for available subscription plans
final availablePlansProvider = FutureProvider((ref) async {
  final repository = ref.watch(subscriptionRepositoryProvider);
  final result = await repository.getAvailablePlans();

  return result.when(
    success: (plans) => plans,
    failure: (_) => <dynamic>[],
  );
});

/// Provider for active subscription
final activeSubscriptionProvider = FutureProvider((ref) async {
  final useCase = ref.watch(getActiveSubscriptionUseCaseProvider);
  final result = await useCase.execute();

  return result.when(
    success: (subscription) => subscription,
    failure: (_) => null,
  );
});
