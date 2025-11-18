import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../http/dio_client.dart';
import '../../../config/supabase_config.dart';

/// Dio client provider
final dioClientProvider = Provider<DioClient>((ref) {
  return DioClient();
});

/// Supabase client provider
final supabaseClientProvider = Provider((ref) {
  return SupabaseConfig.client;
});

/// Auth state provider
final authStateProvider = StreamProvider((ref) {
  return SupabaseConfig.authStateChanges;
});

/// Current user provider
final currentUserProvider = Provider((ref) {
  ref.watch(authStateProvider);
  return SupabaseConfig.currentUser;
});

/// Is authenticated provider
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(currentUserProvider) != null;
});
