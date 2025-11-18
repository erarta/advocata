import 'package:equatable/equatable.dart';

/// Referral redemption entity
class ReferralRedemption extends Equatable {
  final String id;
  final String refereeId;
  final String refereeName;
  final double bonusAmount;
  final DateTime redeemedAt;

  const ReferralRedemption({
    required this.id,
    required this.refereeId,
    required this.refereeName,
    required this.bonusAmount,
    required this.redeemedAt,
  });

  @override
  List<Object?> get props => [id, refereeId, refereeName, bonusAmount, redeemedAt];
}

/// Referral info entity
///
/// Contains user's referral code, statistics, and redemptions
class ReferralInfoEntity extends Equatable {
  final String userId;
  final String referralCode;
  final int totalInvites;
  final int successfulInvites;
  final double totalBonusEarned;
  final double currentBalance;
  final List<ReferralRedemption> redemptions;
  final DateTime createdAt;

  const ReferralInfoEntity({
    required this.userId,
    required this.referralCode,
    this.totalInvites = 0,
    this.successfulInvites = 0,
    this.totalBonusEarned = 0.0,
    this.currentBalance = 0.0,
    this.redemptions = const [],
    required this.createdAt,
  });

  /// Get bonus per referral
  double get bonusPerReferral => 500.0; // 500 руб за приглашенного друга

  /// Get referral URL for sharing
  String get referralUrl => 'https://advocata.app/ref/$referralCode';

  /// Get share text
  String get shareText =>
      'Присоединяйся к Advocata - лучшему сервису юридической помощи! '
      'Используй мой промокод: $referralCode и получи бонус 500₽ на первую консультацию. '
      'Скачать: $referralUrl';

  /// Copy with new values
  ReferralInfoEntity copyWith({
    String? userId,
    String? referralCode,
    int? totalInvites,
    int? successfulInvites,
    double? totalBonusEarned,
    double? currentBalance,
    List<ReferralRedemption>? redemptions,
    DateTime? createdAt,
  }) {
    return ReferralInfoEntity(
      userId: userId ?? this.userId,
      referralCode: referralCode ?? this.referralCode,
      totalInvites: totalInvites ?? this.totalInvites,
      successfulInvites: successfulInvites ?? this.successfulInvites,
      totalBonusEarned: totalBonusEarned ?? this.totalBonusEarned,
      currentBalance: currentBalance ?? this.currentBalance,
      redemptions: redemptions ?? this.redemptions,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  @override
  List<Object?> get props => [
        userId,
        referralCode,
        totalInvites,
        successfulInvites,
        totalBonusEarned,
        currentBalance,
        redemptions,
        createdAt,
      ];
}
