import 'package:json_annotation/json_annotation.dart';
import 'package:advocata/features/payment/domain/entities/payment_entity.dart';

part 'payment_model.g.dart';

@JsonSerializable()
class PaymentModel {
  final String id;
  @JsonKey(name: 'user_id')
  final String userId;
  final double amount;
  final String currency;
  final String status;
  @JsonKey(name: 'payment_method')
  final String paymentMethod;

  @JsonKey(name: 'external_payment_id')
  final String? externalPaymentId;
  @JsonKey(name: 'consultation_id')
  final String? consultationId;
  @JsonKey(name: 'subscription_id')
  final String? subscriptionId;

  @JsonKey(name: 'refund_amount')
  final double? refundAmount;
  @JsonKey(name: 'refund_reason')
  final String? refundReason;
  @JsonKey(name: 'refund_description')
  final String? refundDescription;
  @JsonKey(name: 'refunded_at')
  final DateTime? refundedAt;

  final Map<String, dynamic>? metadata;

  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(name: 'updated_at')
  final DateTime updatedAt;
  @JsonKey(name: 'processed_at')
  final DateTime? processedAt;
  @JsonKey(name: 'failed_at')
  final DateTime? failedAt;

  const PaymentModel({
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

  /// Convert model to entity
  PaymentEntity toEntity() {
    return PaymentEntity(
      id: id,
      userId: userId,
      amount: amount,
      currency: currency,
      status: _parsePaymentStatus(status),
      paymentMethod: _parsePaymentMethod(paymentMethod),
      externalPaymentId: externalPaymentId,
      consultationId: consultationId,
      subscriptionId: subscriptionId,
      refundAmount: refundAmount,
      refundReason: refundReason != null ? _parseRefundReason(refundReason!) : null,
      refundDescription: refundDescription,
      refundedAt: refundedAt,
      metadata: metadata,
      createdAt: createdAt,
      updatedAt: updatedAt,
      processedAt: processedAt,
      failedAt: failedAt,
    );
  }

  /// Convert entity to model
  factory PaymentModel.fromEntity(PaymentEntity entity) {
    return PaymentModel(
      id: entity.id,
      userId: entity.userId,
      amount: entity.amount,
      currency: entity.currency,
      status: _paymentStatusToString(entity.status),
      paymentMethod: _paymentMethodToString(entity.paymentMethod),
      externalPaymentId: entity.externalPaymentId,
      consultationId: entity.consultationId,
      subscriptionId: entity.subscriptionId,
      refundAmount: entity.refundAmount,
      refundReason: entity.refundReason != null
          ? _refundReasonToString(entity.refundReason!)
          : null,
      refundDescription: entity.refundDescription,
      refundedAt: entity.refundedAt,
      metadata: entity.metadata,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      processedAt: entity.processedAt,
      failedAt: entity.failedAt,
    );
  }

  factory PaymentModel.fromJson(Map<String, dynamic> json) =>
      _$PaymentModelFromJson(json);

  Map<String, dynamic> toJson() => _$PaymentModelToJson(this);

  /// Parse payment status from string
  static PaymentStatus _parsePaymentStatus(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return PaymentStatus.pending;
      case 'processing':
        return PaymentStatus.processing;
      case 'succeeded':
        return PaymentStatus.succeeded;
      case 'failed':
        return PaymentStatus.failed;
      case 'refund_pending':
        return PaymentStatus.refundPending;
      case 'refunded':
        return PaymentStatus.refunded;
      case 'cancelled':
        return PaymentStatus.cancelled;
      default:
        throw ArgumentError('Unknown payment status: $status');
    }
  }

  /// Parse payment method from string
  static PaymentMethod _parsePaymentMethod(String method) {
    switch (method.toLowerCase()) {
      case 'bank_card':
        return PaymentMethod.bankCard;
      case 'yoomoney':
        return PaymentMethod.yooMoney;
      case 'qiwi':
        return PaymentMethod.qiwi;
      case 'sbp':
        return PaymentMethod.sbp;
      case 'sberbank':
        return PaymentMethod.sberbank;
      case 'tinkoff':
        return PaymentMethod.tinkoff;
      case 'subscription':
        return PaymentMethod.subscription;
      default:
        throw ArgumentError('Unknown payment method: $method');
    }
  }

  /// Parse refund reason from string
  static RefundReason _parseRefundReason(String reason) {
    switch (reason.toLowerCase()) {
      case 'customer_request':
        return RefundReason.customerRequest;
      case 'lawyer_unavailable':
        return RefundReason.lawyerUnavailable;
      case 'technical_issues':
        return RefundReason.technicalIssues;
      case 'poor_service_quality':
        return RefundReason.poorServiceQuality;
      case 'duplicate':
        return RefundReason.duplicate;
      case 'other':
        return RefundReason.other;
      default:
        throw ArgumentError('Unknown refund reason: $reason');
    }
  }

  /// Convert payment status to string
  static String _paymentStatusToString(PaymentStatus status) {
    return status.toString().split('.').last;
  }

  /// Convert payment method to string
  static String _paymentMethodToString(PaymentMethod method) {
    return method.toString().split('.').last;
  }

  /// Convert refund reason to string
  static String _refundReasonToString(RefundReason reason) {
    return reason.toString().split('.').last;
  }
}
