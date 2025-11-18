import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/repositories/referral_repository_impl.dart';
import '../../domain/entities/referral_info.entity.dart';
import '../../domain/repositories/referral_repository.dart';
import 'address_providers.dart'; // For shared data source

/// Referral repository provider
final referralRepositoryProvider = Provider<ReferralRepository>((ref) {
  return ReferralRepositoryImpl(
    remoteDataSource: ref.watch(profileEnhancedDataSourceProvider),
  );
});

/// Referral info provider
final referralInfoProvider = FutureProvider<ReferralInfoEntity>((ref) async {
  final repository = ref.watch(referralRepositoryProvider);
  final result = await repository.getReferralInfo();
  return result.fold(
    onSuccess: (info) => info,
    onFailure: (failure) => throw Exception(failure.message),
  );
});

/// Referral operations state notifier
class ReferralOperationsNotifier extends StateNotifier<AsyncValue<void>> {
  final ReferralRepository repository;
  final Ref ref;

  ReferralOperationsNotifier(this.repository, this.ref)
      : super(const AsyncValue.data(null));

  Future<bool> redeemCode(String code) async {
    state = const AsyncValue.loading();
    final result = await repository.redeemReferralCode(code);

    return result.fold(
      onSuccess: (_) {
        state = const AsyncValue.data(null);
        ref.invalidate(referralInfoProvider);
        return true;
      },
      onFailure: (failure) {
        state = AsyncValue.error(failure.message, StackTrace.current);
        return false;
      },
    );
  }

  String? getErrorMessage() {
    return state.maybeWhen(
      error: (error, _) => error.toString(),
      orElse: () => null,
    );
  }
}

/// Referral operations provider
final referralOperationsProvider =
    StateNotifierProvider<ReferralOperationsNotifier, AsyncValue<void>>((ref) {
  return ReferralOperationsNotifier(
    ref.watch(referralRepositoryProvider),
    ref,
  );
});
