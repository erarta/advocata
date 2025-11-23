import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/emergency_contact_repository_impl.dart';
import '../../domain/entities/emergency_contact.entity.dart';
import '../../domain/repositories/emergency_contact_repository.dart';
import 'address_providers.dart'; // For shared data source

/// Emergency contact repository provider
final emergencyContactRepositoryProvider =
    Provider<EmergencyContactRepository>((ref) {
  return EmergencyContactRepositoryImpl(
    remoteDataSource: ref.watch(profileEnhancedDataSourceProvider),
  );
});

/// Emergency contacts list provider
final emergencyContactsProvider =
    FutureProvider<List<EmergencyContactEntity>>((ref) async {
  final repository = ref.watch(emergencyContactRepositoryProvider);
  final result = await repository.getEmergencyContacts();
  return result.fold(
    onSuccess: (contacts) => contacts,
    onFailure: (failure) => throw Exception(failure.message),
  );
});

/// Single emergency contact provider
final emergencyContactProvider =
    FutureProvider.family<EmergencyContactEntity, String>(
        (ref, contactId) async {
  final repository = ref.watch(emergencyContactRepositoryProvider);
  final result = await repository.getEmergencyContact(contactId);
  return result.fold(
    onSuccess: (contact) => contact,
    onFailure: (failure) => throw Exception(failure.message),
  );
});

/// Emergency contact operations state notifier
class EmergencyContactOperationsNotifier
    extends StateNotifier<AsyncValue<void>> {
  final EmergencyContactRepository repository;
  final Ref ref;

  EmergencyContactOperationsNotifier(this.repository, this.ref)
      : super(const AsyncValue.data(null));

  Future<bool> addContact({
    required String name,
    required String phoneNumber,
    required String relationship,
  }) async {
    state = const AsyncValue.loading();
    final result = await repository.addEmergencyContact(
      name: name,
      phoneNumber: phoneNumber,
      relationship: relationship,
    );

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(emergencyContactsProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  Future<bool> updateContact({
    required String contactId,
    String? name,
    String? phoneNumber,
    String? relationship,
  }) async {
    state = const AsyncValue.loading();
    final result = await repository.updateEmergencyContact(
      contactId: contactId,
      name: name,
      phoneNumber: phoneNumber,
      relationship: relationship,
    );

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(emergencyContactsProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  Future<bool> deleteContact(String contactId) async {
    state = const AsyncValue.loading();
    final result = await repository.deleteEmergencyContact(contactId);

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(emergencyContactsProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }
}

/// Emergency contact operations provider
final emergencyContactOperationsProvider =
    StateNotifierProvider<EmergencyContactOperationsNotifier,
        AsyncValue<void>>((ref) {
  return EmergencyContactOperationsNotifier(
    ref.watch(emergencyContactRepositoryProvider),
    ref,
  );
});
