import 'package:flutter/material.dart';

/// Lawyer detail screen placeholder
class LawyerDetailScreen extends StatelessWidget {
  final String lawyerId;

  const LawyerDetailScreen({
    super.key,
    required this.lawyerId,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Lawyer Details')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.person, size: 80),
            const SizedBox(height: 24),
            const Text(
              'Lawyer Details',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text('Lawyer ID: $lawyerId'),
            const SizedBox(height: 16),
            Text(
              'To be implemented',
              style: TextStyle(color: Colors.grey[600]),
            ),
          ],
        ),
      ),
    );
  }
}
