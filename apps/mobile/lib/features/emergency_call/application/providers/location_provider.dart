import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:advocata/features/emergency_call/data/datasources/geocoding_datasource.dart';
import 'package:advocata/features/emergency_call/data/repositories/geocoding_repository_impl.dart';
import 'package:advocata/features/emergency_call/domain/entities/location.entity.dart';
import 'package:advocata/features/emergency_call/domain/repositories/geocoding_repository.dart';

// ===== Data Source Providers =====

/// Provides geocoding data source
final geocodingDataSourceProvider = Provider<GeocodingDataSource>((ref) {
  return GeocodingDataSource();
});

// ===== Repository Providers =====

/// Provides geocoding repository
final geocodingRepositoryProvider = Provider<GeocodingRepository>((ref) {
  final dataSource = ref.watch(geocodingDataSourceProvider);
  return GeocodingRepositoryImpl(dataSource);
});

// ===== Location Permission Providers =====

/// Checks if location permission is granted
final locationPermissionProvider = FutureProvider<bool>((ref) async {
  final repository = ref.watch(geocodingRepositoryProvider);
  return await repository.isLocationPermissionGranted();
});

/// Requests location permission
final requestLocationPermissionProvider = FutureProvider<bool>((ref) async {
  final repository = ref.watch(geocodingRepositoryProvider);
  return await repository.requestLocationPermission();
});

// ===== Location Providers =====

/// Gets user's current location
final currentLocationProvider = FutureProvider<LocationEntity>((ref) async {
  final repository = ref.watch(geocodingRepositoryProvider);
  return await repository.getCurrentLocation();
});

/// Gets address from coordinates
final addressFromCoordinatesProvider = FutureProvider.autoDispose
    .family<LocationEntity, CoordinatesParams>(
  (ref, params) async {
    final repository = ref.watch(geocodingRepositoryProvider);
    return await repository.getAddressFromCoordinates(
      latitude: params.latitude,
      longitude: params.longitude,
    );
  },
);

/// Gets coordinates from address
final coordinatesFromAddressProvider =
    FutureProvider.autoDispose.family<LocationEntity, String>(
  (ref, address) async {
    final repository = ref.watch(geocodingRepositoryProvider);
    return await repository.getCoordinatesFromAddress(address);
  },
);

/// Searches for addresses
final searchAddressesProvider =
    FutureProvider.autoDispose.family<List<LocationEntity>, String>(
  (ref, query) async {
    final repository = ref.watch(geocodingRepositoryProvider);
    return await repository.searchAddresses(query);
  },
);

// ===== State Management =====

/// Manages selected location state
class SelectedLocationNotifier extends StateNotifier<LocationEntity?> {
  SelectedLocationNotifier() : super(null);

  /// Sets the selected location
  void setLocation(LocationEntity location) {
    state = location;
  }

  /// Updates location with address
  void updateAddress(String address) {
    if (state == null) return;
    state = state!.copyWith(address: address);
  }

  /// Clears the selected location
  void clearLocation() {
    state = null;
  }
}

/// Provides the selected location notifier
final selectedLocationProvider =
    StateNotifierProvider<SelectedLocationNotifier, LocationEntity?>((ref) {
  return SelectedLocationNotifier();
});

/// Manages map camera position and zoom
class MapStateNotifier extends StateNotifier<MapState> {
  MapStateNotifier()
      : super(const MapState(
          latitude: 59.9311, // St. Petersburg default
          longitude: 30.3609,
          zoom: 12,
          isDragging: false,
        ));

  /// Updates camera position
  void updatePosition({
    required double latitude,
    required double longitude,
  }) {
    state = state.copyWith(
      latitude: latitude,
      longitude: longitude,
    );
  }

  /// Updates zoom level
  void updateZoom(double zoom) {
    state = state.copyWith(zoom: zoom);
  }

  /// Sets dragging state
  void setDragging(bool isDragging) {
    state = state.copyWith(isDragging: isDragging);
  }

  /// Centers map on location
  void centerOn(LocationEntity location) {
    state = state.copyWith(
      latitude: location.latitude,
      longitude: location.longitude,
    );
  }
}

/// Provides the map state notifier
final mapStateProvider = StateNotifierProvider<MapStateNotifier, MapState>((ref) {
  return MapStateNotifier();
});

// ===== Data Classes =====

/// Parameters for coordinate lookup
class CoordinatesParams {
  final double latitude;
  final double longitude;

  const CoordinatesParams({
    required this.latitude,
    required this.longitude,
  });
}

/// Represents the state of the map
class MapState {
  final double latitude;
  final double longitude;
  final double zoom;
  final bool isDragging;

  const MapState({
    required this.latitude,
    required this.longitude,
    required this.zoom,
    required this.isDragging,
  });

  MapState copyWith({
    double? latitude,
    double? longitude,
    double? zoom,
    bool? isDragging,
  }) {
    return MapState(
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      zoom: zoom ?? this.zoom,
      isDragging: isDragging ?? this.isDragging,
    );
  }
}
