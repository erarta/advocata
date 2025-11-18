import '../../../../core/domain/result/result.dart';
import '../entities/user_profile_entity.dart';
import '../repositories/profile_repository.dart';

/// Use case for getting user profile
class GetProfileUseCase {
  final ProfileRepository repository;

  GetProfileUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with UserProfileEntity or error
  Future<Result<UserProfileEntity>> execute() async {
    return await repository.getProfile();
  }
}
