import 'package:dio/dio.dart';
import 'package:advocata/config/env_config.dart';
import 'package:advocata/features/consultation/data/models/consultation_model.dart';

/// Remote data source for consultation API
class ConsultationRemoteDataSource {
  final Dio _dio;
  final String _baseUrl = '${EnvConfig.apiBaseUrl}/api/v1/consultations';

  ConsultationRemoteDataSource({Dio? dio}) : _dio = dio ?? Dio();

  /// Book a new consultation
  Future<ConsultationModel> bookConsultation({
    required String lawyerId,
    required String consultationType,
    required String description,
    DateTime? scheduledStart,
    DateTime? scheduledEnd,
  }) async {
    try {
      final response = await _dio.post(
        _baseUrl,
        data: {
          'lawyer_id': lawyerId,
          'consultation_type': consultationType,
          'description': description,
          if (scheduledStart != null)
            'scheduled_start': scheduledStart.toIso8601String(),
          if (scheduledEnd != null)
            'scheduled_end': scheduledEnd.toIso8601String(),
        },
      );

      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get consultation by ID
  Future<ConsultationModel> getConsultationById(String consultationId) async {
    try {
      final response = await _dio.get('$_baseUrl/$consultationId');
      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get user's consultations
  Future<List<ConsultationModel>> getUserConsultations({
    String? status,
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final response = await _dio.get(
        '$_baseUrl/my',
        queryParameters: {
          if (status != null) 'status': status,
          'limit': limit,
          'offset': offset,
        },
      );

      final data = response.data as Map<String, dynamic>;
      final items = data['items'] as List<dynamic>;

      return items
          .map((item) => ConsultationModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get lawyer's consultations
  Future<List<ConsultationModel>> getLawyerConsultations({
    required String lawyerId,
    String? status,
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final response = await _dio.get(
        '$_baseUrl/lawyer/$lawyerId',
        queryParameters: {
          if (status != null) 'status': status,
          'limit': limit,
          'offset': offset,
        },
      );

      final data = response.data as Map<String, dynamic>;
      final items = data['items'] as List<dynamic>;

      return items
          .map((item) => ConsultationModel.fromJson(item as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Confirm consultation (by lawyer)
  Future<ConsultationModel> confirmConsultation(String consultationId) async {
    try {
      final response = await _dio.post('$_baseUrl/$consultationId/confirm');
      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Start consultation
  Future<ConsultationModel> startConsultation(String consultationId) async {
    try {
      final response = await _dio.post('$_baseUrl/$consultationId/start');
      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Complete consultation
  Future<ConsultationModel> completeConsultation(String consultationId) async {
    try {
      final response = await _dio.post('$_baseUrl/$consultationId/complete');
      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Cancel consultation
  Future<ConsultationModel> cancelConsultation({
    required String consultationId,
    required String reason,
  }) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/$consultationId/cancel',
        data: {'cancellation_reason': reason},
      );
      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Rate consultation
  Future<ConsultationModel> rateConsultation({
    required String consultationId,
    required int rating,
    String? review,
  }) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/$consultationId/rate',
        data: {
          'rating': rating,
          if (review != null) 'review': review,
        },
      );
      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Get active consultation
  Future<ConsultationModel?> getActiveConsultation() async {
    try {
      final response = await _dio.get('$_baseUrl/active');

      if (response.data == null) {
        return null;
      }

      return ConsultationModel.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null; // No active consultation
      }
      throw _handleError(e);
    }
  }

  /// Handle Dio errors
  Exception _handleError(DioException error) {
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final message = error.response!.data?['detail'] ?? 'Unknown error';

      switch (statusCode) {
        case 400:
          return Exception('Некорректный запрос: $message');
        case 401:
          return Exception('Требуется авторизация');
        case 403:
          return Exception('Доступ запрещен: $message');
        case 404:
          return Exception('Консультация не найдена');
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
      return Exception('Превышено время ожидания. Проверьте подключение к интернету');
    }

    if (error.type == DioExceptionType.connectionError) {
      return Exception('Ошибка подключения. Проверьте интернет-соединение');
    }

    return Exception('Неизвестная ошибка: ${error.message}');
  }
}
