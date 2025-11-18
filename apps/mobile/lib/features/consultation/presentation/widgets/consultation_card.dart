import 'package:flutter/material.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';
import 'package:advocata/features/consultation/presentation/widgets/consultation_status_badge.dart';
import 'package:intl/intl.dart';

/// Card widget for displaying consultation
class ConsultationCard extends StatelessWidget {
  final ConsultationEntity consultation;
  final VoidCallback? onTap;
  final VoidCallback? onRate;

  const ConsultationCard({
    super.key,
    required this.consultation,
    this.onTap,
    this.onRate,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header: Type and Status
              Row(
                children: [
                  Icon(
                    consultation.isEmergency
                        ? Icons.emergency_rounded
                        : Icons.event_rounded,
                    size: 20,
                    color: consultation.isEmergency
                        ? Colors.red
                        : Colors.blue,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    consultation.typeDisplayName,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Spacer(),
                  ConsultationStatusBadge(status: consultation.status),
                ],
              ),
              const SizedBox(height: 12),

              // Description
              Text(
                consultation.description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 12),

              // Time info
              if (consultation.scheduledStart != null) ...[
                _buildInfoRow(
                  icon: Icons.access_time,
                  label: 'Время',
                  value: _formatDateTime(consultation.scheduledStart!),
                ),
                const SizedBox(height: 8),
              ],

              // Price
              _buildInfoRow(
                icon: Icons.attach_money,
                label: 'Цена',
                value: '${consultation.price.toStringAsFixed(0)} ${consultation.currency}',
              ),

              // Rating (if completed and rated)
              if (consultation.rating != null) ...[
                const SizedBox(height: 8),
                _buildRating(consultation.rating!),
              ],

              // Rate button (if completed and not rated)
              if (consultation.status == 'completed' && consultation.rating == null && onRate != null) ...[
                const SizedBox(height: 12),
                SizedBox(
                  width: double.infinity,
                  child: OutlinedButton.icon(
                    onPressed: onRate,
                    icon: const Icon(Icons.star_outline, size: 18),
                    label: const Text('Оценить консультацию'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.amber.shade700,
                      side: BorderSide(color: Colors.amber.shade700),
                    ),
                  ),
                ),
              ],

              // Created date
              const SizedBox(height: 8),
              Text(
                'Создано: ${_formatDateTime(consultation.createdAt)}',
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Build info row
  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, size: 16, color: Colors.grey),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: const TextStyle(
            fontSize: 13,
            color: Colors.grey,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  /// Build rating stars
  Widget _buildRating(int rating) {
    return Row(
      children: [
        const Icon(Icons.star, size: 16, color: Colors.grey),
        const SizedBox(width: 8),
        Row(
          children: List.generate(
            5,
            (index) => Icon(
              index < rating ? Icons.star : Icons.star_border,
              size: 16,
              color: Colors.amber,
            ),
          ),
        ),
      ],
    );
  }

  /// Format date time
  String _formatDateTime(DateTime dateTime) {
    return DateFormat('dd.MM.yyyy HH:mm').format(dateTime);
  }
}
