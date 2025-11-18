import 'package:flutter/material.dart';

/// Floating emergency call button
/// Large red button for quick access to emergency call feature
class EmergencyCallButton extends StatelessWidget {
  final VoidCallback onPressed;
  final bool isLoading;

  const EmergencyCallButton({
    super.key,
    required this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return FloatingActionButton.extended(
      onPressed: isLoading ? null : onPressed,
      backgroundColor: Colors.red,
      foregroundColor: Colors.white,
      elevation: 8,
      icon: isLoading
          ? const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                color: Colors.white,
                strokeWidth: 2,
              ),
            )
          : const Icon(Icons.phone, size: 28),
      label: Text(
        isLoading ? 'Вызов...' : 'Экстренный вызов',
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
