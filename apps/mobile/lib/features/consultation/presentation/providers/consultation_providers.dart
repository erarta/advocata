import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:advocata/features/consultation/domain/repositories/consultation_repository.dart';
import 'package:advocata/features/consultation/domain/usecases/book_consultation_usecase.dart';
import 'package:advocata/features/consultation/domain/usecases/get_user_consultations_usecase.dart';
import 'package:advocata/features/consultation/domain/usecases/cancel_consultation_usecase.dart';
import 'package:advocata/features/consultation/domain/usecases/rate_consultation_usecase.dart';
import 'package:advocata/features/consultation/domain/usecases/get_active_consultation_usecase.dart';
import 'package:advocata/features/consultation/data/datasources/consultation_remote_datasource.dart';
import 'package:advocata/features/consultation/data/repositories/consultation_repository_impl.dart';

/// Provider for Dio instance
final dioProvider = Provider<Dio>((ref) => Dio());

/// Provider for consultation remote data source
final consultationRemoteDataSourceProvider =
    Provider<ConsultationRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return ConsultationRemoteDataSource(dio: dio);
});

/// Provider for consultation repository
final consultationRepositoryProvider = Provider<ConsultationRepository>((ref) {
  final remoteDataSource = ref.watch(consultationRemoteDataSourceProvider);
  return ConsultationRepositoryImpl(remoteDataSource);
});

// ============================================================================
// USE CASES
// ============================================================================

/// Provider for book consultation use case
final bookConsultationUseCaseProvider = Provider<BookConsultationUseCase>((ref) {
  final repository = ref.watch(consultationRepositoryProvider);
  return BookConsultationUseCase(repository);
});

/// Provider for get user consultations use case
final getUserConsultationsUseCaseProvider =
    Provider<GetUserConsultationsUseCase>((ref) {
  final repository = ref.watch(consultationRepositoryProvider);
  return GetUserConsultationsUseCase(repository);
});

/// Provider for cancel consultation use case
final cancelConsultationUseCaseProvider =
    Provider<CancelConsultationUseCase>((ref) {
  final repository = ref.watch(consultationRepositoryProvider);
  return CancelConsultationUseCase(repository);
});

/// Provider for rate consultation use case
final rateConsultationUseCaseProvider = Provider<RateConsultationUseCase>((ref) {
  final repository = ref.watch(consultationRepositoryProvider);
  return RateConsultationUseCase(repository);
});

/// Provider for get active consultation use case
final getActiveConsultationUseCaseProvider =
    Provider<GetActiveConsultationUseCase>((ref) {
  final repository = ref.watch(consultationRepositoryProvider);
  return GetActiveConsultationUseCase(repository);
});
