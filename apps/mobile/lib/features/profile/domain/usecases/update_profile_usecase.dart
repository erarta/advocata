import '../../../../core/domain/failures/failure.dart';
import '../../../../core/domain/result/result.dart';
import '../entities/user_profile_entity.dart';
import '../repositories/profile_repository.dart';

/// Parameters for updating user profile
class UpdateProfileParams {
  final String? firstName;
  final String? lastName;
  final String? email;
  final String? bio;
  final String? city;
  final String? address;
  final DateTime? dateOfBirth;

  const UpdateProfileParams({
    this.firstName,
    this.lastName,
    this.email,
    this.bio,
    this.city,
    this.address,
    this.dateOfBirth,
  });

  /// Validate parameters
  Result<void> validate() {
    // First name validation
    if (firstName != null && firstName!.isNotEmpty) {
      if (firstName!.length < 2) {
        return Result.failure(
          const ValidationFailure(message: 'Имя должно содержать минимум 2 символа'),
        );
      }
      if (firstName!.length > 50) {
        return Result.failure(
          const ValidationFailure(message: 'Имя не может быть длиннее 50 символов'),
        );
      }
      if (!RegExp(r'^[а-яА-ЯёЁa-zA-Z\s-]+$').hasMatch(firstName!)) {
        return Result.failure(
          const ValidationFailure(
            message: 'Имя может содержать только буквы, пробелы и дефисы',
          ),
        );
      }
    }

    // Last name validation
    if (lastName != null && lastName!.isNotEmpty) {
      if (lastName!.length < 2) {
        return Result.failure(
          const ValidationFailure(
            message: 'Фамилия должна содержать минимум 2 символа',
          ),
        );
      }
      if (lastName!.length > 50) {
        return Result.failure(
          const ValidationFailure(
            message: 'Фамилия не может быть длиннее 50 символов',
          ),
        );
      }
      if (!RegExp(r'^[а-яА-ЯёЁa-zA-Z\s-]+$').hasMatch(lastName!)) {
        return Result.failure(
          const ValidationFailure(
            message: 'Фамилия может содержать только буквы, пробелы и дефисы',
          ),
        );
      }
    }

    // Email validation
    if (email != null && email!.isNotEmpty) {
      final emailRegex = RegExp(
        r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
      );
      if (!emailRegex.hasMatch(email!)) {
        return Result.failure(
          const ValidationFailure(message: 'Неверный формат email'),
        );
      }
    }

    // Bio validation
    if (bio != null && bio!.isNotEmpty) {
      if (bio!.length < 10) {
        return Result.failure(
          const ValidationFailure(
            message: 'О себе должно содержать минимум 10 символов',
          ),
        );
      }
      if (bio!.length > 500) {
        return Result.failure(
          const ValidationFailure(
            message: 'О себе не может быть длиннее 500 символов',
          ),
        );
      }
    }

    // City validation
    if (city != null && city!.isNotEmpty) {
      if (city!.length < 2) {
        return Result.failure(
          const ValidationFailure(message: 'Город должен содержать минимум 2 символа'),
        );
      }
      if (city!.length > 100) {
        return Result.failure(
          const ValidationFailure(
            message: 'Название города не может быть длиннее 100 символов',
          ),
        );
      }
    }

    // Address validation
    if (address != null && address!.isNotEmpty) {
      if (address!.length < 5) {
        return Result.failure(
          const ValidationFailure(message: 'Адрес должен содержать минимум 5 символов'),
        );
      }
      if (address!.length > 200) {
        return Result.failure(
          const ValidationFailure(
            message: 'Адрес не может быть длиннее 200 символов',
          ),
        );
      }
    }

    // Date of birth validation
    if (dateOfBirth != null) {
      final now = DateTime.now();
      final age = now.year - dateOfBirth!.year;

      if (dateOfBirth!.isAfter(now)) {
        return Result.failure(
          const ValidationFailure(
            message: 'Дата рождения не может быть в будущем',
          ),
        );
      }

      if (age < 18) {
        return Result.failure(
          const ValidationFailure(
            message: 'Вы должны быть старше 18 лет',
          ),
        );
      }

      if (age > 120) {
        return Result.failure(
          const ValidationFailure(
            message: 'Неверная дата рождения',
          ),
        );
      }
    }

    return Result.success(null);
  }
}

/// Use case for updating user profile
class UpdateProfileUseCase {
  final ProfileRepository repository;

  UpdateProfileUseCase(this.repository);

  /// Execute the use case
  ///
  /// Returns Result with updated UserProfileEntity or error
  Future<Result<UserProfileEntity>> execute(
    UpdateProfileParams params,
  ) async {
    // Validate parameters
    final validationResult = params.validate();
    if (validationResult.isFailure) {
      return Result.failure(validationResult.failure);
    }

    // Update profile via repository
    return await repository.updateProfile(
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      bio: params.bio,
      city: params.city,
      address: params.address,
      dateOfBirth: params.dateOfBirth,
    );
  }
}
