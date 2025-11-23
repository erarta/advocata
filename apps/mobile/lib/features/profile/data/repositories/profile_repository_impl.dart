import 'dart:io';
import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../../domain/entities/user_profile_entity.dart';
import '../../domain/repositories/profile_repository.dart';
import '../datasources/profile_remote_datasource.dart';

/// Profile repository implementation
class ProfileRepositoryImpl implements ProfileRepository {
  final ProfileRemoteDataSource remoteDataSource;

  ProfileRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Result<UserProfileEntity>> getProfile() async {
    try {
      final profileModel = await remoteDataSource.getProfile();
      return Result.success(profileModel.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(
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
  Future<Result<UserProfileEntity>> updateProfile({
    String? firstName,
    String? lastName,
    String? email,
    String? bio,
    String? city,
    String? address,
    DateTime? dateOfBirth,
  }) async {
    try {
      final profileModel = await remoteDataSource.updateProfile(
        firstName: firstName,
        lastName: lastName,
        email: email,
        bio: bio,
        city: city,
        address: address,
        dateOfBirth: dateOfBirth,
      );
      return Result.success(profileModel.toEntity());
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
  Future<Result<String>> updateAvatar(File imageFile) async {
    try {
      final avatarUrl = await remoteDataSource.updateAvatar(imageFile);
      return Result.success(avatarUrl);
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
  Future<Result<void>> deleteAvatar() async {
    try {
      await remoteDataSource.deleteAvatar();
      return Result.success(null);
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(
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
  Future<Result<UserProfileEntity>> updateNotificationSettings({
    bool? notificationsEnabled,
    bool? emailNotificationsEnabled,
    bool? smsNotificationsEnabled,
    bool? pushNotificationsEnabled,
  }) async {
    try {
      final profileModel = await remoteDataSource.updateNotificationSettings(
        notificationsEnabled: notificationsEnabled,
        emailNotificationsEnabled: emailNotificationsEnabled,
        smsNotificationsEnabled: smsNotificationsEnabled,
        pushNotificationsEnabled: pushNotificationsEnabled,
      );
      return Result.success(profileModel.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(
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
  Future<Result<UserProfileEntity>> updateLanguagePreference(
    String language,
  ) async {
    try {
      final profileModel =
          await remoteDataSource.updateLanguagePreference(language);
      return Result.success(profileModel.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(
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
  Future<Result<void>> deleteAccount() async {
    try {
      await remoteDataSource.deleteAccount();
      return Result.success(null);
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(
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
}
