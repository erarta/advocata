import '../../../../core/domain/failures/failure.dart';
import '../../../../core/utils/result.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../../domain/entities/referral_info.entity.dart';
import '../../domain/repositories/referral_repository.dart';
import '../datasources/profile_enhanced_remote_datasource.dart';

/// Referral repository implementation
class ReferralRepositoryImpl implements ReferralRepository {
  final ProfileEnhancedRemoteDataSource remoteDataSource;

  ReferralRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Result<ReferralInfoEntity>> getReferralInfo() async {
    try {
      final model = await remoteDataSource.getReferralInfo();
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
  Future<Result<ReferralInfoEntity>> redeemReferralCode(String code) async {
    try {
      final model = await remoteDataSource.redeemReferralCode(code);
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
  Future<Result<String>> generateReferralCode() async {
    try {
      final info = await remoteDataSource.getReferralInfo();
      return Result.success(info.referralCode);
    } on AuthenticationException catch (e) {
      return Result.failure(AuthenticationFailure(message: e.message, code: e.code));
    } on ServerException catch (e) {
      return Result.failure(ServerFailure(message: e.message, code: e.code));
    } catch (e) {
      return Result.failure(UnknownFailure(message: 'Неизвестная ошибка: $e'));
    }
  }
}
