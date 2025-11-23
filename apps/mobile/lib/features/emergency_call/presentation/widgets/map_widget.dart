import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:yandex_mapkit/yandex_mapkit.dart';
import 'package:advocata/features/emergency_call/application/providers/location_provider.dart';
import 'package:advocata/features/emergency_call/domain/entities/location.entity.dart';
import 'package:advocata/features/lawyer/domain/entities/lawyer.entity.dart';

/// Yandex Map widget for emergency call feature
/// Displays user location, selected location, and nearby lawyers
class EmergencyCallMapWidget extends ConsumerStatefulWidget {
  final LocationEntity? initialLocation;
  final List<LawyerEntity>? nearbyLawyers;
  final Function(LocationEntity location)? onLocationSelected;
  final Function(LawyerEntity lawyer)? onLawyerTapped;

  const EmergencyCallMapWidget({
    super.key,
    this.initialLocation,
    this.nearbyLawyers,
    this.onLocationSelected,
    this.onLawyerTapped,
  });

  @override
  ConsumerState<EmergencyCallMapWidget> createState() =>
      _EmergencyCallMapWidgetState();
}

class _EmergencyCallMapWidgetState
    extends ConsumerState<EmergencyCallMapWidget> {
  YandexMapController? _mapController;
  final List<PlacemarkMapObject> _placemarks = [];

  @override
  void initState() {
    super.initState();
    _initializeMap();
  }

  void _initializeMap() {
    // Initialize map when widget is created
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.initialLocation != null) {
        _updateMapLocation(widget.initialLocation!);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final mapState = ref.watch(mapStateProvider);
    final selectedLocation = ref.watch(selectedLocationProvider);

    return Stack(
      children: [
        YandexMap(
          onMapCreated: (controller) {
            _mapController = controller;
            _updatePlacemarks();
          },
          mapObjects: _placemarks,
          onCameraPositionChanged: (cameraPosition, reason, finished) {
            if (finished) {
              // Update map state when camera stops moving
              ref.read(mapStateProvider.notifier).updatePosition(
                    latitude: cameraPosition.target.latitude,
                    longitude: cameraPosition.target.longitude,
                  );
              ref.read(mapStateProvider.notifier).updateZoom(
                    cameraPosition.zoom,
                  );
              ref.read(mapStateProvider.notifier).setDragging(false);
            } else {
              ref.read(mapStateProvider.notifier).setDragging(true);
            }
          },
          onMapTap: (point) async {
            // Get address for tapped location
            final locationAsync = ref.read(
              addressFromCoordinatesProvider(CoordinatesParams(
                latitude: point.latitude,
                longitude: point.longitude,
              )).future,
            );

            final location = await locationAsync;

            // Update selected location
            ref.read(selectedLocationProvider.notifier).setLocation(location);

            // Notify parent
            widget.onLocationSelected?.call(location);

            // Update placemarks
            _updatePlacemarks();
          },
        ),

        // Center marker indicator (shows center of map)
        if (mapState.isDragging)
          Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  Icons.location_on,
                  size: 48,
                  color: Theme.of(context).colorScheme.primary,
                ),
                const SizedBox(height: 40), // Offset for marker tip
              ],
            ),
          ),

        // Map controls
        Positioned(
          right: 16,
          top: 16,
          child: Column(
            children: [
              // Current location button
              _MapButton(
                icon: Icons.my_location,
                onPressed: _centerOnCurrentLocation,
              ),
              const SizedBox(height: 8),

              // Zoom in button
              _MapButton(
                icon: Icons.add,
                onPressed: _zoomIn,
              ),
              const SizedBox(height: 8),

              // Zoom out button
              _MapButton(
                icon: Icons.remove,
                onPressed: _zoomOut,
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Updates map location and camera position
  void _updateMapLocation(LocationEntity location) {
    _mapController?.moveCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(
          target: Point(
            latitude: location.latitude,
            longitude: location.longitude,
          ),
          zoom: 15,
        ),
      ),
    );

    ref.read(mapStateProvider.notifier).centerOn(location);
  }

  /// Updates map placemarks (markers)
  void _updatePlacemarks() {
    setState(() {
      _placemarks.clear();

      // Add user's current location marker
      final currentLocation = ref.read(selectedLocationProvider);
      if (currentLocation != null) {
        _placemarks.add(
          PlacemarkMapObject(
            mapId: const MapObjectId('selected_location'),
            point: Point(
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
            ),
            icon: PlacemarkIcon.single(
              PlacemarkIconStyle(
                image: BitmapDescriptor.fromAssetImage(
                  'assets/icons/location_pin.png',
                ),
                scale: 0.5,
              ),
            ),
          ),
        );
      }

      // Add nearby lawyers markers
      if (widget.nearbyLawyers != null) {
        for (var lawyer in widget.nearbyLawyers!) {
          if (lawyer.lastKnownLatitude != null &&
              lawyer.lastKnownLongitude != null) {
            _placemarks.add(
              PlacemarkMapObject(
                mapId: MapObjectId('lawyer_${lawyer.id}'),
                point: Point(
                  latitude: lawyer.lastKnownLatitude!,
                  longitude: lawyer.lastKnownLongitude!,
                ),
                icon: PlacemarkIcon.single(
                  PlacemarkIconStyle(
                    image: BitmapDescriptor.fromAssetImage(
                      'assets/icons/lawyer_marker.png',
                    ),
                    scale: 0.5,
                  ),
                ),
                onTap: (placemark, point) {
                  widget.onLawyerTapped?.call(lawyer);
                },
              ),
            );
          }
        }
      }
    });
  }

  /// Centers map on user's current location
  Future<void> _centerOnCurrentLocation() async {
    try {
      final location = await ref.read(currentLocationProvider.future);
      _updateMapLocation(location);
      ref.read(selectedLocationProvider.notifier).setLocation(location);
      widget.onLocationSelected?.call(location);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Не удалось получить текущее местоположение: $e')),
        );
      }
    }
  }

  /// Zooms in on the map
  void _zoomIn() {
    final currentZoom = ref.read(mapStateProvider).zoom;
    _mapController?.moveCamera(
      CameraUpdate.zoomIn(),
    );
    ref.read(mapStateProvider.notifier).updateZoom(currentZoom + 1);
  }

  /// Zooms out on the map
  void _zoomOut() {
    final currentZoom = ref.read(mapStateProvider).zoom;
    _mapController?.moveCamera(
      CameraUpdate.zoomOut(),
    );
    ref.read(mapStateProvider.notifier).updateZoom(currentZoom - 1);
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}

/// Map control button widget
class _MapButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _MapButton({
    required this.icon,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(8),
      elevation: 4,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(8),
        child: Container(
          width: 48,
          height: 48,
          padding: const EdgeInsets.all(8),
          child: Icon(icon, color: Colors.black87),
        ),
      ),
    );
  }
}
