import 'dart:io';
import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../repositories/profile_repository.dart';

/// Use case for updating user avatar
class UpdateAvatarUseCase {
  final ProfileRepository repository;

  UpdateAvatarUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with avatar URL or error
  Future<Result<String>> execute(File imageFile) async {
    // Validate file exists
    if (!await imageFile.exists()) {
      return Result.failure(
        const ValidationFailure(message: 'Файл не существует'),
      );
    }

    // Check file size (max 5MB)
    final fileSize = await imageFile.length();
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes

    if (fileSize > maxSize) {
      return Result.failure(
        const ValidationFailure(
          message: 'Размер файла не должен превышать 5 МБ',
        ),
      );
    }

    // Check file extension
    final fileName = imageFile.path.toLowerCase();
    final validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    final hasValidExtension = validExtensions.any(fileName.endsWith);

    if (!hasValidExtension) {
      return Result.failure(
        const ValidationFailure(
          message: 'Поддерживаются только форматы: JPG, PNG, WEBP',
        ),
      );
    }

    // Upload avatar via repository
    return await repository.updateAvatar(imageFile);
  }
}
