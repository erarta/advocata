import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/repositories/lawyer_repository.dart';
import 'lawyer_providers.dart';
import 'lawyer_search_state.dart';

/// Lawyer search state notifier
class LawyerSearchNotifier extends StateNotifier<LawyerSearchState> {
  final LawyerRepository _lawyerRepository;
  LawyerSearchFilters _filters = const LawyerSearchFilters();

  LawyerSearchNotifier(this._lawyerRepository)
      : super(const LawyerSearchState.initial());

  LawyerSearchFilters get filters => _filters;

  /// Search lawyers with current filters
  Future<void> search() async {
    state = const LawyerSearchState.loading();

    final result = await _lawyerRepository.searchLawyers(
      specializations: _filters.specializations.isNotEmpty
          ? _filters.specializations
          : null,
      minRating: _filters.minRating,
      minExperience: _filters.minExperience,
      isAvailable: _filters.isAvailable,
    );

    state = result.fold(
      onSuccess: (lawyers) {
        if (lawyers.isEmpty) {
          return const LawyerSearchState.empty();
        }
        return LawyerSearchState.loaded(lawyers);
      },
      onFailure: (failure) => LawyerSearchState.error(failure.message),
    );
  }

  /// Update filters and search
  Future<void> updateFilters(LawyerSearchFilters filters) async {
    _filters = filters;
    await search();
  }

  /// Add specialization filter
  Future<void> addSpecialization(String specialization) async {
    final updatedSpecializations = [
      ..._filters.specializations,
      specialization,
    ];
    _filters = _filters.copyWith(specializations: updatedSpecializations);
    await search();
  }

  /// Remove specialization filter
  Future<void> removeSpecialization(String specialization) async {
    final updatedSpecializations = _filters.specializations
        .where((s) => s != specialization)
        .toList();
    _filters = _filters.copyWith(specializations: updatedSpecializations);
    await search();
  }

  /// Set minimum rating filter
  Future<void> setMinRating(double? rating) async {
    _filters = _filters.copyWith(minRating: rating);
    await search();
  }

  /// Set minimum experience filter
  Future<void> setMinExperience(int? experience) async {
    _filters = _filters.copyWith(minExperience: experience);
    await search();
  }

  /// Set availability filter
  Future<void> setAvailability(bool? isAvailable) async {
    _filters = _filters.copyWith(isAvailable: isAvailable);
    await search();
  }

  /// Clear all filters
  Future<void> clearFilters() async {
    _filters = const LawyerSearchFilters();
    await search();
  }

  /// Reset state
  void reset() {
    state = const LawyerSearchState.initial();
    _filters = const LawyerSearchFilters();
  }
}

/// Lawyer search state notifier provider
final lawyerSearchNotifierProvider =
    StateNotifierProvider<LawyerSearchNotifier, LawyerSearchState>((ref) {
  return LawyerSearchNotifier(ref.watch(lawyerRepositoryProvider));
});
