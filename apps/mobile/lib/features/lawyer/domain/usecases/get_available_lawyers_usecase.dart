import '../../../../core/domain/result/result.dart';
import '../entities/lawyer_entity.dart';
import '../repositories/lawyer_repository.dart';

/// Use case for getting available lawyers
class GetAvailableLawyersUseCase {
  final LawyerRepository repository;

  GetAvailableLawyersUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with list of available LawyerEntity or error
  Future<Result<List<LawyerEntity>>> execute({int? limit}) async {
    return await repository.getAvailableLawyers(limit: limit);
  }
}
