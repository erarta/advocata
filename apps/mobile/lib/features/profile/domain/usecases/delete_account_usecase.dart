import '../../../../core/domain/result/result.dart';
import '../repositories/profile_repository.dart';

/// Use case for deleting user account
///
/// This is a critical operation that permanently deletes the user's account
/// and all associated data. Should be used with extreme caution and
/// require user confirmation.
class DeleteAccountUseCase {
  final ProfileRepository repository;

  DeleteAccountUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with void or error
  Future<Result<void>> execute() async {
    return await repository.deleteAccount();
  }
}
