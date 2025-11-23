import '../../../../core/domain/result/result.dart';
import '../entities/user_entity.dart';
import '../repositories/auth_repository.dart';

/// Use case for getting current authenticated user
class GetCurrentUserUseCase {
  final AuthRepository repository;

  GetCurrentUserUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with UserEntity or error
  Future<Result<UserEntity>> execute() async {
    return await repository.getCurrentUser();
  }
}
