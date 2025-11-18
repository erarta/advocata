import 'package:dio/dio.dart';
import '../../../../core/infrastructure/exceptions/exceptions.dart';
import '../../../../core/infrastructure/http/dio_client.dart';
import '../models/lawyer_model.dart';

/// Lawyer remote data source
abstract class LawyerRemoteDataSource {
  Future<List<LawyerModel>> searchLawyers({
    List<String>? specializations,
    double? minRating,
    int? minExperience,
    bool? isAvailable,
    int? limit,
    int? offset,
  });

  Future<LawyerModel> getLawyerById(String id);
  Future<List<LawyerModel>> getAvailableLawyers({int? limit});
  Future<List<LawyerModel>> getTopRatedLawyers({int? limit});
}

/// Lawyer remote data source implementation
class LawyerRemoteDataSourceImpl implements LawyerRemoteDataSource {
  final DioClient dioClient;

  LawyerRemoteDataSourceImpl({required this.dioClient});

  @override
  Future<List<LawyerModel>> searchLawyers({
    List<String>? specializations,
    double? minRating,
    int? minExperience,
    bool? isAvailable,
    int? limit,
    int? offset,
  }) async {
    try {
      final queryParams = <String, dynamic>{};

      if (specializations != null && specializations.isNotEmpty) {
        queryParams['specializations'] = specializations.join(',');
      }
      if (minRating != null) {
        queryParams['minRating'] = minRating;
      }
      if (minExperience != null) {
        queryParams['minExperience'] = minExperience;
      }
      if (isAvailable != null) {
        queryParams['isAvailable'] = isAvailable;
      }
      if (limit != null) {
        queryParams['limit'] = limit;
      }
      if (offset != null) {
        queryParams['offset'] = offset;
      }

      final response = await dioClient.get<Map<String, dynamic>>(
        '/lawyers/search',
        queryParameters: queryParams,
      );

      final data = response.data!;
      final items = data['items'] as List<dynamic>;

      return items
          .map((json) => LawyerModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw const NotFoundException(message: 'Юристы не найдены');
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw const NetworkException();
      } else {
        throw ServerException(
          message: 'Не удалось найти юристов: ${e.message}',
        );
      }
    } catch (e) {
      throw ServerException(message: 'Не удалось найти юристов: $e');
    }
  }

  @override
  Future<LawyerModel> getLawyerById(String id) async {
    try {
      final response = await dioClient.get<Map<String, dynamic>>(
        '/lawyers/$id',
      );

      return LawyerModel.fromJson(response.data!);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        throw const NotFoundException(message: 'Юрист не найден');
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        throw const NetworkException();
      } else {
        throw ServerException(
          message: 'Не удалось загрузить профиль юриста: ${e.message}',
        );
      }
    } catch (e) {
      throw ServerException(
        message: 'Не удалось загрузить профиль юриста: $e',
      );
    }
  }

  @override
  Future<List<LawyerModel>> getAvailableLawyers({int? limit}) async {
    return searchLawyers(
      isAvailable: true,
      limit: limit ?? 10,
    );
  }

  @override
  Future<List<LawyerModel>> getTopRatedLawyers({int? limit}) async {
    return searchLawyers(
      minRating: 4.5,
      limit: limit ?? 10,
    );
  }
}
