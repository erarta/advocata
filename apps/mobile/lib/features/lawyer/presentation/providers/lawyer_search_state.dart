import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/lawyer_entity.dart';

part 'lawyer_search_state.freezed.dart';

@freezed
class LawyerSearchState with _$LawyerSearchState {
  const factory LawyerSearchState.initial() = _Initial;
  const factory LawyerSearchState.loading() = _Loading;
  const factory LawyerSearchState.loaded(List<LawyerEntity> lawyers) = _Loaded;
  const factory LawyerSearchState.empty() = _Empty;
  const factory LawyerSearchState.error(String message) = _Error;
}

/// Search filters
class LawyerSearchFilters {
  final List<String> specializations;
  final double? minRating;
  final int? minExperience;
  final bool? isAvailable;

  const LawyerSearchFilters({
    this.specializations = const [],
    this.minRating,
    this.minExperience,
    this.isAvailable,
  });

  bool get hasFilters =>
      specializations.isNotEmpty ||
      minRating != null ||
      minExperience != null ||
      isAvailable != null;

  LawyerSearchFilters copyWith({
    List<String>? specializations,
    double? minRating,
    int? minExperience,
    bool? isAvailable,
  }) {
    return LawyerSearchFilters(
      specializations: specializations ?? this.specializations,
      minRating: minRating ?? this.minRating,
      minExperience: minExperience ?? this.minExperience,
      isAvailable: isAvailable ?? this.isAvailable,
    );
  }

  LawyerSearchFilters clear() {
    return const LawyerSearchFilters();
  }
}
