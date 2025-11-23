import 'package:flutter/material.dart';
import 'package:flutter_rating_bar/flutter_rating_bar.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../domain/usecases/rate_consultation_usecase.dart';
import '../providers/consultation_providers.dart';

/// Dialog for rating a consultation
class RateConsultationDialog extends ConsumerStatefulWidget {
  final String consultationId;
  final String lawyerName;

  const RateConsultationDialog({
    super.key,
    required this.consultationId,
    required this.lawyerName,
  });

  @override
  ConsumerState<RateConsultationDialog> createState() =>
      _RateConsultationDialogState();
}

class _RateConsultationDialogState
    extends ConsumerState<RateConsultationDialog> {
  double _rating = 5.0;
  final _reviewController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _reviewController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Оценить консультацию',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        widget.lawyerName,
                        style: TextStyle(
                          fontSize: 14,
                          color: AppColors.grey600,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Rating Stars
            Center(
              child: RatingBar.builder(
                initialRating: _rating,
                minRating: 1,
                direction: Axis.horizontal,
                allowHalfRating: false,
                itemCount: 5,
                itemSize: 48,
                itemPadding: const EdgeInsets.symmetric(horizontal: 4),
                itemBuilder: (context, _) => const Icon(
                  Icons.star,
                  color: AppColors.warning,
                ),
                onRatingUpdate: (rating) {
                  setState(() {
                    _rating = rating;
                  });
                },
              ),
            ),

            const SizedBox(height: 8),

            // Rating Label
            Center(
              child: Text(
                _getRatingLabel(_rating.toInt()),
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: _getRatingColor(_rating.toInt()),
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Review TextField
            TextField(
              controller: _reviewController,
              maxLines: 4,
              maxLength: 1000,
              decoration: InputDecoration(
                hintText: 'Напишите отзыв (необязательно)',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                filled: true,
                fillColor: AppColors.grey100,
              ),
            ),

            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: _isSubmitting ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isSubmitting
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        'Отправить отзыв',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getRatingLabel(int rating) {
    switch (rating) {
      case 1:
        return 'Ужасно';
      case 2:
        return 'Плохо';
      case 3:
        return 'Нормально';
      case 4:
        return 'Хорошо';
      case 5:
        return 'Отлично';
      default:
        return '';
    }
  }

  Color _getRatingColor(int rating) {
    if (rating <= 2) return AppColors.error;
    if (rating == 3) return AppColors.warning;
    return AppColors.success;
  }

  Future<void> _handleSubmit() async {
    setState(() {
      _isSubmitting = true;
    });

    final params = RateConsultationParams(
      consultationId: widget.consultationId,
      rating: _rating.toInt(),
      review: _reviewController.text.trim().isEmpty
          ? null
          : _reviewController.text.trim(),
    );

    final useCase = ref.read(rateConsultationUseCaseProvider);
    final result = await useCase.execute(params);

    if (!mounted) return;

    setState(() {
      _isSubmitting = false;
    });

    result.fold(
      onSuccess: (consultation) {
        // Refresh consultation list
        ref.invalidate(userConsultationsProvider);

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Отзыв успешно отправлен'),
            backgroundColor: AppColors.success,
          ),
        );

        Navigator.pop(context, true);
      },
      onFailure: (failure) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(failure.message),
            backgroundColor: AppColors.error,
          ),
        );
      },
    );
  }
}
