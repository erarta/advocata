import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import 'package:advocata/features/emergency_call/application/providers/emergency_call_providers.dart';
import 'package:advocata/features/emergency_call/application/providers/location_provider.dart';
import 'package:advocata/features/emergency_call/presentation/widgets/map_widget.dart';
import 'package:advocata/features/emergency_call/presentation/widgets/location_search_bar.dart';
import 'package:advocata/features/emergency_call/presentation/widgets/location_picker_bottom_sheet.dart';
import 'package:advocata/features/emergency_call/domain/entities/location.entity.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Main screen for emergency call feature
/// Shows Yandex Map with location picker and emergency call button
class EmergencyCallScreen extends ConsumerStatefulWidget {
  const EmergencyCallScreen({super.key});

  @override
  ConsumerState<EmergencyCallScreen> createState() =>
      _EmergencyCallScreenState();
}

class _EmergencyCallScreenState extends ConsumerState<EmergencyCallScreen> {
  bool _isLoadingLocation = false;
  bool _isCreatingCall = false;

  @override
  void initState() {
    super.initState();
    _initializeLocation();
  }

  /// Initialize with user's current location
  Future<void> _initializeLocation() async {
    setState(() {
      _isLoadingLocation = true;
    });

    try {
      // Check location permission
      final hasPermission =
          await ref.read(locationPermissionProvider.future);

      if (!hasPermission) {
        // Request permission
        final granted =
            await ref.read(requestLocationPermissionProvider.future);

        if (!granted) {
          if (mounted) {
            _showPermissionDialog();
          }
          setState(() {
            _isLoadingLocation = false;
          });
          return;
        }
      }

      // Get current location
      final location = await ref.read(currentLocationProvider.future);
      ref.read(selectedLocationProvider.notifier).setLocation(location);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Не удалось получить местоположение: $e'),
            action: SnackBarAction(
              label: 'Повторить',
              onPressed: _initializeLocation,
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoadingLocation = false;
        });
      }
    }
  }

  /// Shows location permission dialog
  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Доступ к местоположению'),
        content: const Text(
          'Для вызова экстренного юриста необходим доступ к вашему местоположению. '
          'Пожалуйста, предоставьте доступ в настройках.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Отмена'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              _initializeLocation();
            },
            child: const Text('Открыть настройки'),
          ),
        ],
      ),
    );
  }

  /// Handles location selection from map or search
  void _onLocationSelected(LocationEntity location) {
    ref.read(selectedLocationProvider.notifier).setLocation(location);

    // Load nearby lawyers for this location
    ref.read(nearbyLawyersProvider(NearbyLawyersParams(
      latitude: location.latitude,
      longitude: location.longitude,
    )));
  }

  /// Shows bottom sheet to confirm location and create call
  void _showLocationConfirmation() {
    final location = ref.read(selectedLocationProvider);

    if (location == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Выберите местоположение на карте'),
        ),
      );
      return;
    }

    // Get nearby lawyers
    final nearbyLawyersAsync = ref.read(nearbyLawyersProvider(
      NearbyLawyersParams(
        latitude: location.latitude,
        longitude: location.longitude,
      ),
    ));

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => nearbyLawyersAsync.when(
        data: (lawyers) => LocationPickerBottomSheet(
          location: location,
          nearbyLawyers: lawyers,
          onConfirm: () {
            Navigator.pop(context);
            _createEmergencyCall();
          },
        ),
        loading: () => LocationPickerBottomSheet(
          location: location,
          onConfirm: () {
            Navigator.pop(context);
            _createEmergencyCall();
          },
        ),
        error: (error, _) => LocationPickerBottomSheet(
          location: location,
          onConfirm: () {
            Navigator.pop(context);
            _createEmergencyCall();
          },
        ),
      ),
    );
  }

  /// Creates emergency call with selected location
  Future<void> _createEmergencyCall() async {
    final location = ref.read(selectedLocationProvider);
    final supabase = Supabase.instance.client;
    final userId = supabase.auth.currentUser?.id;

    if (location == null || userId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Не удалось создать вызов. Попробуйте снова.'),
        ),
      );
      return;
    }

    setState(() {
      _isCreatingCall = true;
    });

    try {
      // Create emergency call
      await ref.read(emergencyCallNotifierProvider.notifier).createCall(
            userId: userId,
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.fullAddress,
          );

      if (mounted) {
        // Show success dialog
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: Row(
              children: const [
                Icon(Icons.check_circle, color: Colors.green, size: 32),
                SizedBox(width: 12),
                Text('Вызов принят'),
              ],
            ),
            content: const Text(
              'Ваш экстренный вызов принят. Ближайший юрист свяжется с вами в течение нескольких минут.',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.pop(context); // Close dialog
                  Navigator.pop(context); // Go back to previous screen
                },
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Ошибка создания вызова: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isCreatingCall = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedLocation = ref.watch(selectedLocationProvider);
    final nearbyLawyersAsync = selectedLocation != null
        ? ref.watch(nearbyLawyersProvider(NearbyLawyersParams(
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          )))
        : null;

    return Scaffold(
      body: Stack(
        children: [
          // Map
          if (_isLoadingLocation)
            const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Получение местоположения...'),
                ],
              ),
            )
          else
            EmergencyCallMapWidget(
              initialLocation: selectedLocation,
              nearbyLawyers:
                  nearbyLawyersAsync?.value,
              onLocationSelected: _onLocationSelected,
            ),

          // Top search bar
          Positioned(
            top: MediaQuery.of(context).padding.top + 16,
            left: 16,
            right: 16,
            child: Column(
              children: [
                // Back button + search bar
                Row(
                  children: [
                    // Back button
                    Material(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      elevation: 4,
                      child: InkWell(
                        onTap: () => Navigator.pop(context),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: 48,
                          height: 48,
                          padding: const EdgeInsets.all(8),
                          child: const Icon(Icons.arrow_back),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),

                    // Search bar
                    Expanded(
                      child: LocationSearchBar(
                        initialAddress: selectedLocation?.shortAddress,
                        onLocationSelected: _onLocationSelected,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Bottom emergency call button
          Positioned(
            bottom: MediaQuery.of(context).padding.bottom + 24,
            left: 0,
            right: 0,
            child: Center(
              child: Container(
                height: 60,
                margin: const EdgeInsets.symmetric(horizontal: 24),
                child: ElevatedButton(
                  onPressed: _isCreatingCall ? null : _showLocationConfirmation,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 8,
                    shadowColor: Colors.red.withOpacity(0.5),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (_isCreatingCall)
                        const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      else
                        const Icon(Icons.phone, size: 28),
                      const SizedBox(width: 12),
                      Text(
                        _isCreatingCall ? 'Создание вызова...' : 'Экстренный вызов',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
