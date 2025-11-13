import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../../domain/entities/lawyer_entity.dart';
import '../../domain/repositories/lawyer_repository.dart';
import '../datasources/lawyer_remote_datasource.dart';

/// Lawyer repository implementation
class LawyerRepositoryImpl implements LawyerRepository {
  final LawyerRemoteDataSource remoteDataSource;

  LawyerRepositoryImpl({required this.remoteDataSource});

  @override
  Future<Result<List<LawyerEntity>>> searchLawyers({
    List<String>? specializations,
    double? minRating,
    int? minExperience,
    bool? isAvailable,
    int? limit,
    int? offset,
  }) async {
    try {
      final lawyerModels = await remoteDataSource.searchLawyers(
        specializations: specializations,
        minRating: minRating,
        minExperience: minExperience,
        isAvailable: isAvailable,
        limit: limit,
        offset: offset,
      );

      final lawyers = lawyerModels.map((model) => model.toEntity()).toList();
      return Result.success(lawyers);
    } on NotFoundException catch (e) {
      return Result.failure(NotFoundFailure(
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
  Future<Result<LawyerEntity>> getLawyerById(String id) async {
    try {
      final lawyerModel = await remoteDataSource.getLawyerById(id);
      return Result.success(lawyerModel.toEntity());
    } on NotFoundException catch (e) {
      return Result.failure(NotFoundFailure(
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
  Future<Result<List<LawyerEntity>>> getAvailableLawyers({
    int? limit,
  }) async {
    return searchLawyers(
      isAvailable: true,
      limit: limit,
    );
  }

  @override
  Future<Result<List<LawyerEntity>>> getTopRatedLawyers({
    int? limit,
  }) async {
    return searchLawyers(
      minRating: 4.5,
      limit: limit,
    );
  }
}
