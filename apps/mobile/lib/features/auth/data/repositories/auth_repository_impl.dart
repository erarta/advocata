import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../../domain/entities/user_entity.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

/// Auth repository implementation
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Result<void>> sendOtp(String phoneNumber) async {
    try {
      await remoteDataSource.sendOtp(phoneNumber);
      return Result.success(null);
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(
        message: e.message,
        code: e.code,
      ));
    } on ValidationException catch (e) {
      return Result.failure(ValidationFailure(
        message: e.message,
        code: e.code,
      ));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(
        message: e.message,
        code: e.code,
      ));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(
        message: e.message,
        code: e.code,
      ));
    } catch (e) {
      return Result.failure(UnknownFailure(
        message: 'Неизвестная ошибка: $e',
      ));
    }
  }

  @override
  Future<Result<UserEntity>> verifyOtp(
    String phoneNumber,
    String otpCode,
  ) async {
    try {
      final userModel = await remoteDataSource.verifyOtp(phoneNumber, otpCode);
      return Result.success(userModel.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(
        message: e.message,
        code: e.code,
      ));
    } on ValidationException catch (e) {
      return Result.failure(ValidationFailure(
        message: e.message,
        code: e.code,
      ));
    } on NetworkException catch (e) {
      return Result.failure(NetworkFailure(
        message: e.message,
        code: e.code,
      ));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(
        message: e.message,
        code: e.code,
      ));
    } catch (e) {
      return Result.failure(UnknownFailure(
        message: 'Неизвестная ошибка: $e',
      ));
    }
  }

  @override
  Future<Result<UserEntity>> getCurrentUser() async {
    try {
      final userModel = await remoteDataSource.getCurrentUser();
      return Result.success(userModel.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(
        message: e.message,
        code: e.code,
      ));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(
        message: e.message,
        code: e.code,
      ));
    } catch (e) {
      return Result.failure(UnknownFailure(
        message: 'Неизвестная ошибка: $e',
      ));
    }
  }

  @override
  Future<Result<void>> signOut() async {
    try {
      await remoteDataSource.signOut();
      return Result.success(null);
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(
        message: e.message,
        code: e.code,
      ));
    } catch (e) {
      return Result.failure(UnknownFailure(
        message: 'Неизвестная ошибка: $e',
      ));
    }
  }

  @override
  Future<bool> isAuthenticated() async {
    try {
      final result = await getCurrentUser();
      return result.isSuccess;
    } catch (e) {
      return false;
    }
  }

  @override
  Stream<UserEntity?> get authStateChanges {
    return remoteDataSource.authStateChanges.map((userModel) {
      return userModel?.toEntity();
    });
  }
}
