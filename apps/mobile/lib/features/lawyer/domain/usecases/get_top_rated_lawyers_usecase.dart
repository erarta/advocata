import '../../../../core/domain/result/result.dart';
import '../entities/lawyer_entity.dart';
import '../repositories/lawyer_repository.dart';

/// Use case for getting top rated lawyers
class GetTopRatedLawyersUseCase {
  final LawyerRepository repository;

  GetTopRatedLawyersUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with list of top rated LawyerEntity or error
  Future<Result<List<LawyerEntity>>> execute({int? limit}) async {
    return await repository.getTopRatedLawyers(limit: limit);
  }
}
