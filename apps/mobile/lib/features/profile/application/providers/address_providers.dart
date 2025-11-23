import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../config/supabase_config.dart';
import '../../data/datasources/profile_enhanced_remote_datasource.dart';
import '../../data/repositories/address_repository_impl.dart';
import '../../domain/entities/saved_address.entity.dart';
import '../../domain/repositories/address_repository.dart';

/// Enhanced remote data source provider (shared)
final profileEnhancedDataSourceProvider =
    Provider<ProfileEnhancedRemoteDataSource>((ref) {
  return ProfileEnhancedRemoteDataSourceImpl(
    supabaseClient: SupabaseConfig.client,
  );
});

/// Address repository provider
final addressRepositoryProvider = Provider<AddressRepository>((ref) {
  return AddressRepositoryImpl(
    remoteDataSource: ref.watch(profileEnhancedDataSourceProvider),
  );
});

/// Addresses list provider
final addressesProvider =
    FutureProvider<List<SavedAddressEntity>>((ref) async {
  final repository = ref.watch(addressRepositoryProvider);
  final result = await repository.getAddresses();
  return result.fold(
    onSuccess: (addresses) => addresses,
    onFailure: (failure) => throw Exception(failure.message),
  );
});

/// Single address provider
final addressProvider =
    FutureProvider.family<SavedAddressEntity, String>((ref, addressId) async {
  final repository = ref.watch(addressRepositoryProvider);
  final result = await repository.getAddress(addressId);
  return result.fold(
    onSuccess: (address) => address,
    onFailure: (failure) => throw Exception(failure.message),
  );
});

/// Address operations state notifier
class AddressOperationsNotifier extends StateNotifier<AsyncValue<void>> {
  final AddressRepository repository;
  final Ref ref;

  AddressOperationsNotifier(this.repository, this.ref)
      : super(const AsyncValue.data(null));

  Future<bool> addAddress({
    required String label,
    required String address,
    required double latitude,
    required double longitude,
    bool isDefault = false,
  }) async {
    state = const AsyncValue.loading();
    final result = await repository.addAddress(
      label: label,
      address: address,
      latitude: latitude,
      longitude: longitude,
      isDefault: isDefault,
    );

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        // Invalidate addresses list to refresh
        ref.invalidate(addressesProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  Future<bool> updateAddress({
    required String addressId,
    String? label,
    String? address,
    double? latitude,
    double? longitude,
    bool? isDefault,
  }) async {
    state = const AsyncValue.loading();
    final result = await repository.updateAddress(
      addressId: addressId,
      label: label,
      address: address,
      latitude: latitude,
      longitude: longitude,
      isDefault: isDefault,
    );

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(addressesProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  Future<bool> deleteAddress(String addressId) async {
    state = const AsyncValue.loading();
    final result = await repository.deleteAddress(addressId);

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(addressesProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  Future<bool> setDefaultAddress(String addressId) async {
    state = const AsyncValue.loading();
    final result = await repository.setDefaultAddress(addressId);

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(addressesProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }
}

/// Address operations provider
final addressOperationsProvider =
    StateNotifierProvider<AddressOperationsNotifier, AsyncValue<void>>((ref) {
  return AddressOperationsNotifier(
    ref.watch(addressRepositoryProvider),
    ref,
  );
});
