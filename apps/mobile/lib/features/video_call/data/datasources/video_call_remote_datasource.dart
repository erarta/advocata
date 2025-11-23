import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../models/video_session_model.dart';

/// Video call remote data source interface
abstract class VideoCallRemoteDataSource {
  Future<VideoSessionModel> createSession(String consultationId);
  Future<VideoSessionModel> joinSession(String sessionId);
  Future<void> endSession(String sessionId);
  Future<VideoSessionModel> getSession(String sessionId);
  Future<VideoSessionModel> updateSessionStatus({
    required String sessionId,
    required String status,
  });
  Future<void> reportNetworkQuality({
    required String sessionId,
    required int quality,
  });
}

/// Video call remote data source implementation
class VideoCallRemoteDataSourceImpl implements VideoCallRemoteDataSource {
  final SupabaseClient supabaseClient;

  VideoCallRemoteDataSourceImpl({required this.supabaseClient});

  @override
  Future<VideoSessionModel> createSession(String consultationId) async {
    try {
      final user = supabaseClient.auth.currentUser;

      if (user == null) {
        throw const AuthenticationException(
          message: 'Пользователь не авторизован',
        );
      }

      // Call backend API to create video session
      // Backend should return Agora credentials
      final response = await supabaseClient.functions.invoke(
        'create-video-session',
        body: {
          'consultation_id': consultationId,
        },
      );

      if (response.status != 200) {
        throw ServerException(
          message: 'Не удалось создать видеосессию: ${response.data}',
        );
      }

      return VideoSessionModel.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      if (e is ServerException) rethrow;
      throw ServerException(message: 'Не удалось создать видеосессию: $e');
    }
  }

  @override
  Future<VideoSessionModel> joinSession(String sessionId) async {
    try {
      final user = supabaseClient.auth.currentUser;

      if (user == null) {
        throw const AuthenticationException(
          message: 'Пользователь не авторизован',
        );
      }

      // Get session from database
      final response = await supabaseClient
          .from('video_sessions')
          .select()
          .eq('id', sessionId)
          .single();

      return VideoSessionModel.fromJson(response);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(
        message: 'Не удалось присоединиться к видеосессии: $e',
      );
    }
  }

  @override
  Future<void> endSession(String sessionId) async {
    try {
      final user = supabaseClient.auth.currentUser;

      if (user == null) {
        throw const AuthenticationException(
          message: 'Пользователь не авторизован',
        );
      }

      // Update session status to ended
      await supabaseClient.from('video_sessions').update({
        'status': 'ended',
        'ended_at': DateTime.now().toIso8601String(),
      }).eq('id', sessionId);
    } catch (e) {
      if (e is AuthenticationException) rethrow;
      throw ServerException(message: 'Не удалось завершить видеосессию: $e');
    }
  }

  @override
  Future<VideoSessionModel> getSession(String sessionId) async {
    try {
      final response = await supabaseClient
          .from('video_sessions')
          .select()
          .eq('id', sessionId)
          .single();

      return VideoSessionModel.fromJson(response);
    } catch (e) {
      throw ServerException(
        message: 'Не удалось получить данные видеосессии: $e',
      );
    }
  }

  @override
  Future<VideoSessionModel> updateSessionStatus({
    required String sessionId,
    required String status,
  }) async {
    try {
      final updates = <String, dynamic>{
        'status': status,
      };

      // Add timestamp based on status
      if (status == 'active') {
        updates['started_at'] = DateTime.now().toIso8601String();
      } else if (status == 'ended') {
        updates['ended_at'] = DateTime.now().toIso8601String();
      }

      final response = await supabaseClient
          .from('video_sessions')
          .update(updates)
          .eq('id', sessionId)
          .select()
          .single();

      return VideoSessionModel.fromJson(response);
    } catch (e) {
      throw ServerException(
        message: 'Не удалось обновить статус видеосессии: $e',
      );
    }
  }

  @override
  Future<void> reportNetworkQuality({
    required String sessionId,
    required int quality,
  }) async {
    try {
      // Report network quality to backend for analytics
      await supabaseClient.from('video_quality_reports').insert({
        'session_id': sessionId,
        'quality': quality,
        'reported_at': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      // Non-critical error, just log it
      print('Failed to report network quality: $e');
    }
  }
}
