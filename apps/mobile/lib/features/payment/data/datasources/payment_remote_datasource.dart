import 'package:dio/dio.dart';
import 'package:advocata/config/env_config.dart';
import 'package:advocata/features/payment/data/models/payment_model.dart';

/// Remote data source for payment API
class PaymentRemoteDataSource {
  final Dio _dio;
  final String _baseUrl = '${EnvConfig.apiBaseUrl}/api/v1/payments';

  PaymentRemoteDataSource({Dio? dio}) : _dio = dio ?? Dio();

  /// Create payment for consultation
  Future<PaymentModel> createConsultationPayment({
    required String consultationId,
    required double amount,
    required String paymentMethod,
  }) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/consultations',
        data: {
          'consultation_id': consultationId,
          'amount': amount,
          'payment_method': paymentMethod,
        },
      );
      return PaymentModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Create payment for subscription
  Future<PaymentModel> createSubscriptionPayment({
    required String subscriptionId,
    required double amount,
    required String paymentMethod,
  }) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/subscriptions',
        data: {
          'subscription_id': subscriptionId,
          'amount': amount,
          'payment_method': paymentMethod,
        },
      );
      return PaymentModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get payment by ID
  Future<PaymentModel> getPaymentById(String paymentId) async {
    try {
      final response = await _dio.get('$_baseUrl/$paymentId');
      return PaymentModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get user's payment history
  Future<List<PaymentModel>> getUserPayments({
    String? status,
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final response = await _dio.get(
        _baseUrl,
        queryParameters: {
          if (status != null) 'status': status,
          'limit': limit,
          'offset': offset,
        },
      );

      final data = response.data as Map<String, dynamic>;
      final items = data['items'] as List<dynamic>;

      return items
          .map((item) => PaymentModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Request refund for payment
  Future<PaymentModel> requestRefund({
    required String paymentId,
    required String reason,
    double? amount,
  }) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/$paymentId/refund',
        data: {
          'refund_reason': reason,
          if (amount != null) 'refund_amount': amount,
        },
      );
      return PaymentModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Handle Dio errors
  Exception _handleError(DioException error) {
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final message = error.response!.data?['detail'] ?? 'Неизвестная ошибка';

      switch (statusCode) {
        case 400:
          return Exception('Некорректный запрос: $message');
        case 401:
          return Exception('Требуется авторизация');
        case 403:
          return Exception('Доступ запрещен: $message');
        case 404:
          return Exception('Платеж не найден');
        case 422:
          return Exception('Ошибка валидации: $message');
        case 500:
          return Exception('Ошибка сервера. Попробуйте позже');
        default:
          return Exception('Ошибка: $message');
      }
    }

    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout) {
      return Exception('Превышено время ожидания. Проверьте подключение');
    }

    if (error.type == DioExceptionType.connectionError) {
      return Exception('Ошибка подключения. Проверьте интернет');
    }

    return Exception('Неизвестная ошибка: ${error.message}');
  }
}
