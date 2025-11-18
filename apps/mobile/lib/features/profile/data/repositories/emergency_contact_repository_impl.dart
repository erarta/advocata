import '../../../../core/domain/failures/failure.dart';
import '../../../../core/utils/result.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../../domain/entities/emergency_contact.entity.dart';
import '../../domain/repositories/emergency_contact_repository.dart';
import '../datasources/profile_enhanced_remote_datasource.dart';

/// Emergency contact repository implementation
class EmergencyContactRepositoryImpl implements EmergencyContactRepository {
  final ProfileEnhancedRemoteDataSource remoteDataSource;

  EmergencyContactRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Result<List<EmergencyContactEntity>>> getEmergencyContacts() async {
    try {
      final models = await remoteDataSource.getEmergencyContacts();
      final entities = models.map((m) => m.toEntity()).toList();
      return Result.success(entities);
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message, code: e.code));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message, code: e.code));
    } catch (e) {
      return Result.failure(UnknownFailure(message: 'Неизвестная ошибка: $e'));
    }
  }

  @override
  Future<Result<EmergencyContactEntity>> getEmergencyContact(String contactId) async {
    try {
      final model = await remoteDataSource.getEmergencyContact(contactId);
      return Result.success(model.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message, code: e.code));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message, code: e.code));
    } catch (e) {
      return Result.failure(UnknownFailure(message: 'Неизвестная ошибка: $e'));
    }
  }

  @override
  Future<Result<EmergencyContactEntity>> addEmergencyContact({
    required String name,
    required String phoneNumber,
    required String relationship,
  }) async {
    try {
      final model = await remoteDataSource.addEmergencyContact(
        name: name,
        phoneNumber: phoneNumber,
        relationship: relationship,
      );
      return Result.success(model.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message, code: e.code));
    } on ValidationException catch (e) {
      return Result.failure(ValidationFailure(message: e.message, code: e.code));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message, code: e.code));
    } catch (e) {
      return Result.failure(UnknownFailure(message: 'Неизвестная ошибка: $e'));
    }
  }

  @override
  Future<Result<EmergencyContactEntity>> updateEmergencyContact({
    required String contactId,
    String? name,
    String? phoneNumber,
    String? relationship,
  }) async {
    try {
      final model = await remoteDataSource.updateEmergencyContact(
        contactId: contactId,
        name: name,
        phoneNumber: phoneNumber,
        relationship: relationship,
      );
      return Result.success(model.toEntity());
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message, code: e.code));
    } on ValidationException catch (e) {
      return Result.failure(ValidationFailure(message: e.message, code: e.code));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message, code: e.code));
    } catch (e) {
      return Result.failure(UnknownFailure(message: 'Неизвестная ошибка: $e'));
    }
  }

  @override
  Future<Result<void>> deleteEmergencyContact(String contactId) async {
    try {
      await remoteDataSource.deleteEmergencyContact(contactId);
      return Result.success(null);
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message, code: e.code));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message, code: e.code));
    } catch (e) {
      return Result.failure(UnknownFailure(message: 'Неизвестная ошибка: $e'));
    }
  }
}
