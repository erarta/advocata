import '../../../../core/utils/result.dart';
import '../entities/emergency_contact.entity.dart';

/// Emergency contact repository interface
abstract class EmergencyContactRepository {
  /// Get all emergency contacts for the current user
  Future<Result<List<EmergencyContactEntity>>> getEmergencyContacts();

  /// Get a specific emergency contact by ID
  Future<Result<EmergencyContactEntity>> getEmergencyContact(String contactId);

  /// Add a new emergency contact
  Future<Result<EmergencyContactEntity>> addEmergencyContact({
    required String name,
    required String phoneNumber,
    required String relationship,
  });

  /// Update an existing emergency contact
  Future<Result<EmergencyContactEntity>> updateEmergencyContact({
    required String contactId,
    String? name,
    String? phoneNumber,
    String? relationship,
  });

  /// Delete an emergency contact
  Future<Result<void>> deleteEmergencyContact(String contactId);
}
