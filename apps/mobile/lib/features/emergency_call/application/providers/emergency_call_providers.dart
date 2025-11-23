import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:advocata/features/emergency_call/data/datasources/emergency_call_remote_datasource.dart';
import 'package:advocata/features/emergency_call/data/repositories/emergency_call_repository_impl.dart';
import 'package:advocata/features/emergency_call/domain/entities/emergency_call.entity.dart';
import 'package:advocata/features/emergency_call/domain/repositories/emergency_call_repository.dart';
import 'package:advocata/features/lawyer/domain/entities/lawyer.entity.dart';

// ===== Data Source Providers =====

/// Provides Dio HTTP client instance
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: const String.fromEnvironment('API_BASE_URL',
        defaultValue: 'http://localhost:3000'),
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  // Add auth interceptor if needed
  // dio.interceptors.add(AuthInterceptor());

  return dio;
});

/// Provides Supabase client instance
final supabaseProvider = Provider<SupabaseClient>((ref) {
  return Supabase.instance.client;
});

/// Provides emergency call remote data source
final emergencyCallRemoteDataSourceProvider =
    Provider<EmergencyCallRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return EmergencyCallRemoteDataSource(dio);
});

// ===== Repository Providers =====

/// Provides emergency call repository
final emergencyCallRepositoryProvider =
    Provider<EmergencyCallRepository>((ref) {
  final remoteDataSource = ref.watch(emergencyCallRemoteDataSourceProvider);
  final supabase = ref.watch(supabaseProvider);
  return EmergencyCallRepositoryImpl(remoteDataSource, supabase);
});

// ===== Use Case Providers =====

/// Creates a new emergency call
final createEmergencyCallProvider = FutureProvider.autoDispose
    .family<EmergencyCallEntity, CreateEmergencyCallParams>(
  (ref, params) async {
    final repository = ref.watch(emergencyCallRepositoryProvider);
    return await repository.createEmergencyCall(
      userId: params.userId,
      latitude: params.latitude,
      longitude: params.longitude,
      address: params.address,
      notes: params.notes,
    );
  },
);

/// Gets an emergency call by ID
final getEmergencyCallProvider =
    FutureProvider.autoDispose.family<EmergencyCallEntity?, String>(
  (ref, callId) async {
    final repository = ref.watch(emergencyCallRepositoryProvider);
    return await repository.getEmergencyCall(callId);
  },
);

/// Gets all emergency calls for current user
final userEmergencyCallsProvider =
    FutureProvider.autoDispose<List<EmergencyCallEntity>>(
  (ref, ) async {
    final repository = ref.watch(emergencyCallRepositoryProvider);
    final supabase = ref.watch(supabaseProvider);
    final userId = supabase.auth.currentUser?.id;

    if (userId == null) {
      throw Exception('User not authenticated');
    }

    return await repository.getUserEmergencyCalls(userId);
  },
);

/// Gets nearby lawyers for a location
final nearbyLawyersProvider = FutureProvider.autoDispose
    .family<List<LawyerEntity>, NearbyLawyersParams>(
  (ref, params) async {
    final repository = ref.watch(emergencyCallRepositoryProvider);
    return await repository.getNearbyLawyers(
      latitude: params.latitude,
      longitude: params.longitude,
      radiusInMeters: params.radiusInMeters,
    );
  },
);

/// Watches real-time updates for an emergency call
final watchEmergencyCallProvider =
    StreamProvider.autoDispose.family<EmergencyCallEntity, String>(
  (ref, callId) {
    final repository = ref.watch(emergencyCallRepositoryProvider);
    return repository.watchEmergencyCall(callId);
  },
);

// ===== State Management =====

/// Manages the current emergency call being created/viewed
class EmergencyCallNotifier extends StateNotifier<AsyncValue<EmergencyCallEntity?>> {
  final EmergencyCallRepository _repository;

  EmergencyCallNotifier(this._repository) : super(const AsyncValue.data(null));

  /// Creates a new emergency call
  Future<void> createCall({
    required String userId,
    required double latitude,
    required double longitude,
    required String address,
    String? notes,
  }) async {
    state = const AsyncValue.loading();
    try {
      final call = await _repository.createEmergencyCall(
        userId: userId,
        latitude: latitude,
        longitude: longitude,
        address: address,
        notes: notes,
      );
      state = AsyncValue.data(call);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// Accepts the current emergency call
  Future<void> acceptCall(String lawyerId) async {
    final currentCall = state.value;
    if (currentCall == null) return;

    state = const AsyncValue.loading();
    try {
      final call = await _repository.acceptEmergencyCall(
        currentCall.id,
        lawyerId,
      );
      state = AsyncValue.data(call);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// Completes the current emergency call
  Future<void> completeCall() async {
    final currentCall = state.value;
    if (currentCall == null) return;

    state = const AsyncValue.loading();
    try {
      final call = await _repository.completeEmergencyCall(currentCall.id);
      state = AsyncValue.data(call);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// Cancels the current emergency call
  Future<void> cancelCall() async {
    final currentCall = state.value;
    if (currentCall == null) return;

    state = const AsyncValue.loading();
    try {
      final call = await _repository.cancelEmergencyCall(currentCall.id);
      state = AsyncValue.data(call);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  /// Clears the current call
  void clearCall() {
    state = const AsyncValue.data(null);
  }
}

/// Provides the emergency call notifier
final emergencyCallNotifierProvider =
    StateNotifierProvider<EmergencyCallNotifier, AsyncValue<EmergencyCallEntity?>>(
  (ref) {
    final repository = ref.watch(emergencyCallRepositoryProvider);
    return EmergencyCallNotifier(repository);
  },
);

// ===== Parameter Classes =====

/// Parameters for creating an emergency call
class CreateEmergencyCallParams {
  final String userId;
  final double latitude;
  final double longitude;
  final String address;
  final String? notes;

  const CreateEmergencyCallParams({
    required this.userId,
    required this.latitude,
    required this.longitude,
    required this.address,
    this.notes,
  });
}

/// Parameters for finding nearby lawyers
class NearbyLawyersParams {
  final double latitude;
  final double longitude;
  final double radiusInMeters;

  const NearbyLawyersParams({
    required this.latitude,
    required this.longitude,
    this.radiusInMeters = 10000,
  });
}
