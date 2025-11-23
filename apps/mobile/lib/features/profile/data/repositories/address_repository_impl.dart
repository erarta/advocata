import '../../../../core/domain/failures/failure.dart';
import '../../../../core/utils/result.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../../domain/entities/saved_address.entity.dart';
import '../../domain/repositories/address_repository.dart';
import '../datasources/profile_enhanced_remote_datasource.dart';

/// Address repository implementation
class AddressRepositoryImpl implements AddressRepository {
  final ProfileEnhancedRemoteDataSource remoteDataSource;

  AddressRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Result<List<SavedAddressEntity>>> getAddresses() async {
    try {
      final models = await remoteDataSource.getAddresses();
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
  Future<Result<SavedAddressEntity>> getAddress(String addressId) async {
    try {
      final model = await remoteDataSource.getAddress(addressId);
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
  Future<Result<SavedAddressEntity>> addAddress({
    required String label,
    required String address,
    required double latitude,
    required double longitude,
    bool isDefault = false,
  }) async {
    try {
      final model = await remoteDataSource.addAddress(
        label: label,
        address: address,
        latitude: latitude,
        longitude: longitude,
        isDefault: isDefault,
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
  Future<Result<SavedAddressEntity>> updateAddress({
    required String addressId,
    String? label,
    String? address,
    double? latitude,
    double? longitude,
    bool? isDefault,
  }) async {
    try {
      final model = await remoteDataSource.updateAddress(
        addressId: addressId,
        label: label,
        address: address,
        latitude: latitude,
        longitude: longitude,
        isDefault: isDefault,
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
  Future<Result<void>> deleteAddress(String addressId) async {
    try {
      await remoteDataSource.deleteAddress(addressId);
      return Result.success(null);
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message, code: e.code));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message, code: e.code));
    } catch (e) {
      return Result.failure(UnknownFailure(message: 'Неизвестная ошибка: $e'));
    }
  }

  @override
  Future<Result<SavedAddressEntity>> setDefaultAddress(String addressId) async {
    return updateAddress(addressId: addressId, isDefault: true);
  }
}
