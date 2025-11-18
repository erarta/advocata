import 'package:dio/dio.dart';
import 'package:advocata/config/env_config.dart';
import 'package:advocata/features/payment/data/models/subscription_model.dart';
import 'package:advocata/features/payment/domain/repositories/subscription_repository.dart';

/// Remote data source for subscription API
class SubscriptionRemoteDataSource {
  final Dio _dio;
  final String _baseUrl = '${EnvConfig.apiBaseUrl}/api/v1/subscriptions';

  SubscriptionRemoteDataSource({Dio? dio}) : _dio = dio ?? Dio();

  /// Create new subscription
  Future<SubscriptionModel> createSubscription({
    required String plan,
    required String paymentMethod,
  }) async {
    try {
      final response = await _dio.post(
        _baseUrl,
        data: {
          'plan': plan,
          'payment_method': paymentMethod,
        },
      );
      return SubscriptionModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get user's active subscription
  Future<SubscriptionModel?> getActiveSubscription() async {
    try {
      final response = await _dio.get('$_baseUrl/me');

      if (response.data == null) {
        return null;
      }

      return SubscriptionModel.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null; // No active subscription
      }
      throw _handleError(e);
    }
  }

  /// Get available subscription plans
  Future<List<SubscriptionPlanInfo>> getAvailablePlans() async {
    try {
      final response = await _dio.get('$_baseUrl/plans');

      final plans = response.data as List<dynamic>;
      return plans.map((plan) {
        final data = plan as Map<String, dynamic>;
        return SubscriptionPlanInfo(
          plan: data['plan'] as String,
          monthlyPrice: (data['monthly_price'] as num).toDouble(),
          consultationsLimit: data['consultations_limit'] as int,
          description: data['description'] as String,
          features: (data['features'] as List<dynamic>)
              .map((f) => f.toString())
              .toList(),
        );
      }).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Cancel subscription
  Future<SubscriptionModel> cancelSubscription({
    required String subscriptionId,
    String? reason,
  }) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/$subscriptionId/cancel',
        data: {
          if (reason != null) 'cancellation_reason': reason,
        },
      );
      return SubscriptionModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Renew subscription
  Future<SubscriptionModel> renewSubscription(String subscriptionId) async {
    try {
      final response = await _dio.post('$_baseUrl/$subscriptionId/renew');
      return SubscriptionModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Change subscription plan
  Future<SubscriptionModel> changePlan({
    required String subscriptionId,
    required String newPlan,
  }) async {
    try {
      final response = await _dio.put(
        '$_baseUrl/$subscriptionId/plan',
        data: {'new_plan': newPlan},
      );
      return SubscriptionModel.fromJson(response.data);
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
          return Exception('Подписка не найдена');
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
