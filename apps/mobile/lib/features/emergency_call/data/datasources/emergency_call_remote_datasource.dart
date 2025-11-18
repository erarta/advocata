import 'package:dio/dio.dart';
import 'package:advocata/features/emergency_call/data/models/emergency_call.model.dart';
import 'package:advocata/features/lawyer/data/models/lawyer.model.dart';

/// Remote data source for emergency call API operations
class EmergencyCallRemoteDataSource {
  final Dio _dio;
  static const String _baseUrl = '/api/v1/emergency-calls';

  EmergencyCallRemoteDataSource(this._dio);

  /// Creates a new emergency call
  Future<EmergencyCallModel> createEmergencyCall({
    required String userId,
    required double latitude,
    required double longitude,
    required String address,
    String? notes,
  }) async {
    try {
      final response = await _dio.post(
        _baseUrl,
        data: {
          'user_id': userId,
          'latitude': latitude,
          'longitude': longitude,
          'address': address,
          'notes': notes,
        },
      );

      return EmergencyCallModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Gets an emergency call by ID
  Future<EmergencyCallModel> getEmergencyCall(String id) async {
    try {
      final response = await _dio.get('$_baseUrl/$id');
      return EmergencyCallModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Gets all emergency calls for a user
  Future<List<EmergencyCallModel>> getUserEmergencyCalls(String userId) async {
    try {
      final response = await _dio.get('$_baseUrl/user/$userId');
      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((json) => EmergencyCallModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Gets nearby lawyers based on location
  Future<List<LawyerModel>> getNearbyLawyers({
    required double latitude,
    required double longitude,
    double radiusInMeters = 10000,
  }) async {
    try {
      final response = await _dio.get(
        '$_baseUrl/nearby-lawyers',
        queryParameters: {
          'lat': latitude,
          'lng': longitude,
          'radius': radiusInMeters,
        },
      );

      final List<dynamic> data = response.data['items'] ?? response.data;
      return data.map((json) => LawyerModel.fromJson(json)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Accepts an emergency call by a lawyer
  Future<EmergencyCallModel> acceptEmergencyCall(
    String callId,
    String lawyerId,
  ) async {
    try {
      final response = await _dio.post(
        '$_baseUrl/$callId/accept',
        data: {'lawyer_id': lawyerId},
      );
      return EmergencyCallModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Completes an emergency call
  Future<EmergencyCallModel> completeEmergencyCall(String callId) async {
    try {
      final response = await _dio.post('$_baseUrl/$callId/complete');
      return EmergencyCallModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Cancels an emergency call
  Future<EmergencyCallModel> cancelEmergencyCall(String callId) async {
    try {
      final response = await _dio.post('$_baseUrl/$callId/cancel');
      return EmergencyCallModel.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  /// Handles Dio errors
  Exception _handleError(DioException error) {
    if (error.response != null) {
      final statusCode = error.response!.statusCode;
      final message = error.response!.data['message'] ?? 'Unknown error';

      switch (statusCode) {
        case 400:
          return Exception('Invalid request: $message');
        case 401:
          return Exception('Unauthorized: $message');
        case 403:
          return Exception('Forbidden: $message');
        case 404:
          return Exception('Not found: $message');
        case 500:
          return Exception('Server error: $message');
        default:
          return Exception('HTTP $statusCode: $message');
      }
    } else if (error.type == DioExceptionType.connectionTimeout) {
      return Exception('Connection timeout');
    } else if (error.type == DioExceptionType.receiveTimeout) {
      return Exception('Receive timeout');
    } else {
      return Exception('Network error: ${error.message}');
    }
  }
}
