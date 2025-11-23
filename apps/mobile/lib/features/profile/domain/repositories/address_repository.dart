import '../../../../core/utils/result.dart';
import '../entities/saved_address.entity.dart';

/// Address repository interface
abstract class AddressRepository {
  /// Get all saved addresses for the current user
  Future<Result<List<SavedAddressEntity>>> getAddresses();

  /// Get a specific address by ID
  Future<Result<SavedAddressEntity>> getAddress(String addressId);

  /// Add a new address
  Future<Result<SavedAddressEntity>> addAddress({
    required String label,
    required String address,
    required double latitude,
    required double longitude,
    bool isDefault = false,
  });

  /// Update an existing address
  Future<Result<SavedAddressEntity>> updateAddress({
    required String addressId,
    String? label,
    String? address,
    double? latitude,
    double? longitude,
    bool? isDefault,
  });

  /// Delete an address
  Future<Result<void>> deleteAddress(String addressId);

  /// Set an address as default
  Future<Result<SavedAddressEntity>> setDefaultAddress(String addressId);
}
