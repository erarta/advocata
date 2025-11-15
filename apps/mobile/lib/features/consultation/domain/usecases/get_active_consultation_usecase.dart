import 'package:advocata/core/domain/result/result.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';
import 'package:advocata/features/consultation/domain/repositories/consultation_repository.dart';

/// Use case for getting user's active consultation
class GetActiveConsultationUseCase {
  final ConsultationRepository repository;

  GetActiveConsultationUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with active ConsultationEntity or null if none active
  Future<Result<ConsultationEntity?>> execute() async {
    return await repository.getActiveConsultation();
  }
}
