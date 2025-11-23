import 'package:json_annotation/json_annotation.dart';
import '../../domain/entities/referral_info.entity.dart';

part 'referral_info_model.g.dart';

/// Referral redemption model
@JsonSerializable()
class ReferralRedemptionModel {
  final String id;
  @JsonKey(name: 'referee_id')
  final String refereeId;
  @JsonKey(name: 'referee_name')
  final String refereeName;
  @JsonKey(name: 'bonus_amount')
  final double bonusAmount;
  @JsonKey(name: 'redeemed_at')
  final String redeemedAt;

  const ReferralRedemptionModel({
    required this.id,
    required this.refereeId,
    required this.refereeName,
    required this.bonusAmount,
    required this.redeemedAt,
  });

  factory ReferralRedemptionModel.fromJson(Map<String, dynamic> json) =>
      _$ReferralRedemptionModelFromJson(json);

  Map<String, dynamic> toJson() => _$ReferralRedemptionModelToJson(this);

  ReferralRedemption toEntity() {
    return ReferralRedemption(
      id: id,
      refereeId: refereeId,
      refereeName: refereeName,
      bonusAmount: bonusAmount,
      redeemedAt: DateTime.parse(redeemedAt),
    );
  }
}

/// Referral info model
@JsonSerializable()
class ReferralInfoModel {
  @JsonKey(name: 'user_id')
  final String userId;
  @JsonKey(name: 'referral_code')
  final String referralCode;
  @JsonKey(name: 'total_invites')
  final int totalInvites;
  @JsonKey(name: 'successful_invites')
  final int successfulInvites;
  @JsonKey(name: 'total_bonus_earned')
  final double totalBonusEarned;
  @JsonKey(name: 'current_balance')
  final double currentBalance;
  final List<ReferralRedemptionModel> redemptions;
  @JsonKey(name: 'created_at')
  final String createdAt;

  const ReferralInfoModel({
    required this.userId,
    required this.referralCode,
    this.totalInvites = 0,
    this.successfulInvites = 0,
    this.totalBonusEarned = 0.0,
    this.currentBalance = 0.0,
    this.redemptions = const [],
    required this.createdAt,
  });

  /// From JSON
  factory ReferralInfoModel.fromJson(Map<String, dynamic> json) =>
      _$ReferralInfoModelFromJson(json);

  /// To JSON
  Map<String, dynamic> toJson() => _$ReferralInfoModelToJson(this);

  /// To entity
  ReferralInfoEntity toEntity() {
    return ReferralInfoEntity(
      userId: userId,
      referralCode: referralCode,
      totalInvites: totalInvites,
      successfulInvites: successfulInvites,
      totalBonusEarned: totalBonusEarned,
      currentBalance: currentBalance,
      redemptions: redemptions.map((r) => r.toEntity()).toList(),
      createdAt: DateTime.parse(createdAt),
    );
  }

  /// From entity
  factory ReferralInfoModel.fromEntity(ReferralInfoEntity entity) {
    return ReferralInfoModel(
      userId: entity.userId,
      referralCode: entity.referralCode,
      totalInvites: entity.totalInvites,
      successfulInvites: entity.successfulInvites,
      totalBonusEarned: entity.totalBonusEarned,
      currentBalance: entity.currentBalance,
      redemptions: [], // Redemptions are read-only from backend
      createdAt: entity.createdAt.toIso8601String(),
    );
  }
}
