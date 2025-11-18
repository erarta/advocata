import '../../../../core/domain/result/result.dart';
import '../repositories/auth_repository.dart';

/// Use case for signing out the current user
class SignOutUseCase {
  final AuthRepository repository;

  SignOutUseCase(this.repository);

  /// Execute the use case
  ///
  /// Signs out the current user
  /// Returns Result with void or error
  Future<Result<void>> execute() async {
    return await repository.signOut();
  }
}
