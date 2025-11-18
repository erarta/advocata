import '../../../../core/domain/result/result.dart';
import '../entities/lawyer_entity.dart';
import '../repositories/lawyer_repository.dart';

/// Parameters for searching lawyers
class SearchLawyersParams {
  final List<String>? specializations;
  final double? minRating;
  final int? minExperience;
  final bool? isAvailable;
  final int? limit;
  final int? offset;

  const SearchLawyersParams({
    this.specializations,
    this.minRating,
    this.minExperience,
    this.isAvailable,
    this.limit,
    this.offset,
  });
}

/// Use case for searching lawyers with filters
class SearchLawyersUseCase {
  final LawyerRepository repository;

  SearchLawyersUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with list of LawyerEntity or error
  Future<Result<List<LawyerEntity>>> execute(SearchLawyersParams params) async {
    return await repository.searchLawyers(
      specializations: params.specializations,
      minRating: params.minRating,
      minExperience: params.minExperience,
      isAvailable: params.isAvailable,
      limit: params.limit,
      offset: params.offset,
    );
  }
}
