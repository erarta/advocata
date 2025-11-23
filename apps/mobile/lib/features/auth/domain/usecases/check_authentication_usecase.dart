import '../repositories/auth_repository.dart';

/// Use case for checking if user is authenticated
class CheckAuthenticationUseCase {
  final AuthRepository repository;

  CheckAuthenticationUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns true if user is authenticated, false otherwise
  Future<bool> execute() async {
    return await repository.isAuthenticated();
  }
}
