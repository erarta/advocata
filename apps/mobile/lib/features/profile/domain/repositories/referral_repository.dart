import '../../../../core/utils/result.dart';
import '../entities/referral_info.entity.dart';

/// Referral repository interface
abstract class ReferralRepository {
  /// Get referral info for the current user
  Future<Result<ReferralInfoEntity>> getReferralInfo();

  /// Redeem a referral code
  Future<Result<ReferralInfoEntity>> redeemReferralCode(String code);

  /// Generate or regenerate referral code
  Future<Result<String>> generateReferralCode();
}
