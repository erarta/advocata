import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';
import 'package:advocata/features/consultation/domain/repositories/consultation_repository.dart';

/// Parameters for getting user consultations
class GetUserConsultationsParams {
  final String? status; // Filter by status (optional)
  final int limit;
  final int offset;

  const GetUserConsultationsParams({
    this.status,
    this.limit = 50,
    this.offset = 0,
  });
}

/// Use case for getting user's consultations
class GetUserConsultationsUseCase {
  final ConsultationRepository repository;

  GetUserConsultationsUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with list of consultations or error
  Future<Result<List<ConsultationEntity>>> execute(
    GetUserConsultationsParams params,
  ) async {
    return await repository.getUserConsultations(
      status: params.status,
      limit: params.limit,
      offset: params.offset,
    );
  }
}
