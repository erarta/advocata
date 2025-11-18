import '../../../../core/domain/result/result.dart';
import '../entities/lawyer_entity.dart';

/// Lawyer repository interface
abstract class LawyerRepository {
  /// Search lawyers with filters
  Future<Result<List<LawyerEntity>>> searchLawyers({
    List<String>? specializations,
    double? minRating,
    int? minExperience,
    bool? isAvailable,
    int? limit,
    int? offset,
  });

  /// Get lawyer by ID
  Future<Result<LawyerEntity>> getLawyerById(String id);

  /// Get available lawyers
  Future<Result<List<LawyerEntity>>> getAvailableLawyers({
    int? limit,
  });

  /// Get top rated lawyers
  Future<Result<List<LawyerEntity>>> getTopRatedLawyers({
    int? limit,
  });
}
