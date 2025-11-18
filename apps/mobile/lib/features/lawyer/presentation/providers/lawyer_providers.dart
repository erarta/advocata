import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/infrastructure/providers/providers.dart';
import '../../data/datasources/lawyer_remote_datasource.dart';
import '../../data/repositories/lawyer_repository_impl.dart';
import '../../domain/entities/lawyer_entity.dart';
import '../../domain/repositories/lawyer_repository.dart';

/// Lawyer remote data source provider
final lawyerRemoteDataSourceProvider = Provider<LawyerRemoteDataSource>((ref) {
  return LawyerRemoteDataSourceImpl(
    dioClient: ref.watch(dioClientProvider),
  );
});

/// Lawyer repository provider
final lawyerRepositoryProvider = Provider<LawyerRepository>((ref) {
  return LawyerRepositoryImpl(
    remoteDataSource: ref.watch(lawyerRemoteDataSourceProvider),
  );
});

/// Get lawyer by ID provider
final lawyerByIdProvider = FutureProvider.family<LawyerEntity, String>((ref, id) async {
  final repository = ref.watch(lawyerRepositoryProvider);
  final result = await repository.getLawyerById(id);

  return result.fold(
    onSuccess: (lawyer) => lawyer,
    onFailure: (failure) => throw Exception(failure.message),
  );
});

/// Top rated lawyers provider
final topRatedLawyersProvider = FutureProvider<List<LawyerEntity>>((ref) async {
  final repository = ref.watch(lawyerRepositoryProvider);
  final result = await repository.getTopRatedLawyers(limit: 10);

  return result.fold(
    onSuccess: (lawyers) => lawyers,
    onFailure: (failure) => throw Exception(failure.message),
  );
});

/// Available lawyers provider
final availableLawyersProvider = FutureProvider<List<LawyerEntity>>((ref) async {
  final repository = ref.watch(lawyerRepositoryProvider);
  final result = await repository.getAvailableLawyers(limit: 20);

  return result.fold(
    onSuccess: (lawyers) => lawyers,
    onFailure: (failure) => throw Exception(failure.message),
  );
});
