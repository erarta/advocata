import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../entities/lawyer_entity.dart';
import '../repositories/lawyer_repository.dart';

/// Use case for getting lawyer detail by ID
class GetLawyerDetailUseCase {
  final LawyerRepository repository;

  GetLawyerDetailUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with LawyerEntity or error
  Future<Result<LawyerEntity>> execute(String lawyerId) async {
    // Validate lawyer ID
    if (lawyerId.trim().isEmpty) {
      return Result.failure(
        const ValidationFailure(message: 'ID юриста не может быть пустым'),
      );
    }

    return await repository.getLawyerById(lawyerId);
  }
}
