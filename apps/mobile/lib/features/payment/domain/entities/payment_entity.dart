import 'package:equatable/equatable.dart';

/// Payment status enum
enum PaymentStatus {
  pending,        // Payment created, awaiting processing
  processing,     // Payment is being processed
  succeeded,      // Payment successful
  failed,         // Payment failed
  refundPending,  // Refund requested
  refunded,       // Refund completed
  cancelled,      // Payment cancelled
}

/// Payment method enum
enum PaymentMethod {
  bankCard,    // Bank card (ЮКасса)
  yooMoney,    // YooMoney wallet
  qiwi,        // QIWI wallet
  sbp,         // System of Fast Payments
  sberbank,    // Sberbank Online
  tinkoff,     // Tinkoff Pay
  subscription, // Paid from subscription
}

/// Refund reason enum
enum RefundReason {
  customerRequest,        // Customer requested refund
  lawyerUnavailable,      // Lawyer didn't show up
  technicalIssues,        // Technical problems
  poorServiceQuality,     // Poor service quality
  duplicate,              // Duplicate payment
  other,                  // Other reason
}

/// Payment entity - represents a payment transaction
class PaymentEntity extends Equatable {
  final String id;
  final String userId;
  final double amount;
  final String currency;
  final PaymentStatus status;
  final PaymentMethod paymentMethod;

  /// External payment ID from payment provider (ЮКасса)
  final String? externalPaymentId;

  /// Consultation ID if payment is for consultation
  final String? consultationId;

  /// Subscription ID if payment is for subscription
  final String? subscriptionId;

  /// Refund information
  final double? refundAmount;
  final RefundReason? refundReason;
  final String? refundDescription;
  final DateTime? refundedAt;

  /// Payment metadata
  final Map<String, dynamic>? metadata;

  /// Timestamps
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? processedAt;
  final DateTime? failedAt;

  const PaymentEntity({
    required this.id,
    required this.userId,
    required this.amount,
    required this.currency,
    required this.status,
    required this.paymentMethod,
    this.externalPaymentId,
    this.consultationId,
    this.subscriptionId,
    this.refundAmount,
    this.refundReason,
    this.refundDescription,
    this.refundedAt,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
    this.processedAt,
    this.failedAt,
  });

  /// Check if payment is pending
  bool get isPending => status == PaymentStatus.pending;

  /// Check if payment is processing
  bool get isProcessing => status == PaymentStatus.processing;

  /// Check if payment succeeded
  bool get isSucceeded => status == PaymentStatus.succeeded;

  /// Check if payment failed
  bool get isFailed => status == PaymentStatus.failed;

  /// Check if refund is pending
  bool get isRefundPending => status == PaymentStatus.refundPending;

  /// Check if refunded
  bool get isRefunded => status == PaymentStatus.refunded;

  /// Check if payment is in final state
  bool get isFinal =>
      status == PaymentStatus.succeeded ||
      status == PaymentStatus.failed ||
      status == PaymentStatus.refunded ||
      status == PaymentStatus.cancelled;

  /// Check if payment can be refunded
  bool get canBeRefunded =>
      status == PaymentStatus.succeeded && consultationId != null;

  /// Get display name for status
  String get statusDisplayName {
    switch (status) {
      case PaymentStatus.pending:
        return 'Ожидает оплаты';
      case PaymentStatus.processing:
        return 'Обработка';
      case PaymentStatus.succeeded:
        return 'Оплачено';
      case PaymentStatus.failed:
        return 'Ошибка';
      case PaymentStatus.refundPending:
        return 'Возврат обрабатывается';
      case PaymentStatus.refunded:
        return 'Возвращено';
      case PaymentStatus.cancelled:
        return 'Отменено';
    }
  }

  /// Get display name for payment method
  String get paymentMethodDisplayName {
    switch (paymentMethod) {
      case PaymentMethod.bankCard:
        return 'Банковская карта';
      case PaymentMethod.yooMoney:
        return 'ЮMoney';
      case PaymentMethod.qiwi:
        return 'QIWI';
      case PaymentMethod.sbp:
        return 'СБП';
      case PaymentMethod.sberbank:
        return 'Сбербанк Онлайн';
      case PaymentMethod.tinkoff:
        return 'Тинькофф';
      case PaymentMethod.subscription:
        return 'Подписка';
    }
  }

  /// Get display name for refund reason
  String? get refundReasonDisplayName {
    if (refundReason == null) return null;

    switch (refundReason!) {
      case RefundReason.customerRequest:
        return 'По запросу клиента';
      case RefundReason.lawyerUnavailable:
        return 'Юрист не вышел на связь';
      case RefundReason.technicalIssues:
        return 'Технические проблемы';
      case RefundReason.poorServiceQuality:
        return 'Низкое качество услуги';
      case RefundReason.duplicate:
        return 'Дубликат платежа';
      case RefundReason.other:
        return 'Другая причина';
    }
  }

  /// Format amount with currency
  String get formattedAmount {
    return '${amount.toStringAsFixed(2)} $currency';
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        amount,
        currency,
        status,
        paymentMethod,
        externalPaymentId,
        consultationId,
        subscriptionId,
        refundAmount,
        refundReason,
        refundDescription,
        refundedAt,
        metadata,
        createdAt,
        updatedAt,
        processedAt,
        failedAt,
      ];

  /// Copy with method
  PaymentEntity copyWith({
    String? id,
    String? userId,
    double? amount,
    String? currency,
    PaymentStatus? status,
    PaymentMethod? paymentMethod,
    String? externalPaymentId,
    String? consultationId,
    String? subscriptionId,
    double? refundAmount,
    RefundReason? refundReason,
    String? refundDescription,
    DateTime? refundedAt,
    Map<String, dynamic>? metadata,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? processedAt,
    DateTime? failedAt,
  }) {
    return PaymentEntity(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      amount: amount ?? this.amount,
      currency: currency ?? this.currency,
      status: status ?? this.status,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      externalPaymentId: externalPaymentId ?? this.externalPaymentId,
      consultationId: consultationId ?? this.consultationId,
      subscriptionId: subscriptionId ?? this.subscriptionId,
      refundAmount: refundAmount ?? this.refundAmount,
      refundReason: refundReason ?? this.refundReason,
      refundDescription: refundDescription ?? this.refundDescription,
      refundedAt: refundedAt ?? this.refundedAt,
      metadata: metadata ?? this.metadata,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      processedAt: processedAt ?? this.processedAt,
      failedAt: failedAt ?? this.failedAt,
    );
  }
}
