import 'package:flutter/material.dart';
import 'package:advocata/features/payment/domain/entities/payment_entity.dart';
import 'package:advocata/features/payment/presentation/widgets/payment_status_badge.dart';
import 'package:intl/intl.dart';

/// Card widget for displaying payment
class PaymentCard extends StatelessWidget {
  final PaymentEntity payment;
  final VoidCallback? onTap;

  const PaymentCard({
    super.key,
    required this.payment,
    this.onTap,
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
              // Header: Amount and Status
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    payment.formattedAmount,
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  PaymentStatusBadge(status: payment.status),
                ],
              ),
              const SizedBox(height: 12),

              // Payment method
              _buildInfoRow(
                icon: Icons.payment_rounded,
                label: 'Способ оплаты',
                value: payment.paymentMethodDisplayName,
              ),
              const SizedBox(height: 8),

              // Type (consultation or subscription)
              if (payment.consultationId != null)
                _buildInfoRow(
                  icon: Icons.balance_rounded,
                  label: 'Тип',
                  value: 'Оплата консультации',
                )
              else if (payment.subscriptionId != null)
                _buildInfoRow(
                  icon: Icons.card_membership_rounded,
                  label: 'Тип',
                  value: 'Оплата подписки',
                ),
              const SizedBox(height: 8),

              // Date
              _buildInfoRow(
                icon: Icons.access_time,
                label: 'Дата',
                value: _formatDateTime(payment.createdAt),
              ),

              // Refund info (if refunded)
              if (payment.isRefunded || payment.isRefundPending) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.orange.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.info_outline, size: 16, color: Colors.orange.shade700),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              payment.isRefunded ? 'Возвращено' : 'Возврат обрабатывается',
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                                color: Colors.orange.shade700,
                              ),
                            ),
                            if (payment.refundAmount != null)
                              Text(
                                'Сумма: ${payment.refundAmount!.toStringAsFixed(2)} ${payment.currency}',
                                style: const TextStyle(fontSize: 11),
                              ),
                            if (payment.refundReasonDisplayName != null)
                              Text(
                                payment.refundReasonDisplayName!,
                                style: const TextStyle(fontSize: 11),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              // External payment ID (if available)
              if (payment.externalPaymentId != null) ...[
                const SizedBox(height: 8),
                Text(
                  'ID транзакции: ${payment.externalPaymentId}',
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
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
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w500,
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
