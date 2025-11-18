import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';
import 'package:advocata/features/consultation/domain/usecases/book_consultation_usecase.dart';
import 'package:advocata/features/consultation/domain/usecases/get_user_consultations_usecase.dart';
import 'package:advocata/features/consultation/domain/usecases/cancel_consultation_usecase.dart';
import 'package:advocata/features/consultation/domain/usecases/rate_consultation_usecase.dart';
import 'package:advocata/features/consultation/presentation/providers/consultation_state.dart';
import 'package:advocata/features/consultation/presentation/providers/consultation_providers.dart';

/// Notifier for managing consultation list
class ConsultationListNotifier extends StateNotifier<ConsultationListState> {
  final GetUserConsultationsUseCase _getUserConsultationsUseCase;

  ConsultationListNotifier(this._getUserConsultationsUseCase)
      : super(const ConsultationListState.initial());

  /// Load user's consultations
  Future<void> loadConsultations({String? status}) async {
    state = const ConsultationListState.loading();

    final params = GetUserConsultationsParams(status: status);
    final result = await _getUserConsultationsUseCase.execute(params);

    result.when(
      success: (consultations) {
        state = ConsultationListState.loaded(consultations);
      },
      failure: (error) {
        state = ConsultationListState.error(error);
      },
    );
  }

  /// Refresh consultations
  Future<void> refresh({String? status}) async {
    await loadConsultations(status: status);
  }
}

/// Provider for consultation list notifier
final consultationListNotifierProvider =
    StateNotifierProvider<ConsultationListNotifier, ConsultationListState>(
  (ref) {
    final useCase = ref.watch(getUserConsultationsUseCaseProvider);
    return ConsultationListNotifier(useCase);
  },
);

/// Notifier for booking consultation
class BookingNotifier extends StateNotifier<BookingState> {
  final BookConsultationUseCase _bookConsultationUseCase;

  BookingNotifier(this._bookConsultationUseCase)
      : super(const BookingState.initial());

  /// Book a consultation
  Future<void> bookConsultation({
    required String lawyerId,
    required String consultationType,
    required String description,
    DateTime? scheduledStart,
    DateTime? scheduledEnd,
  }) async {
    state = const BookingState.loading();

    final params = BookConsultationParams(
      lawyerId: lawyerId,
      consultationType: consultationType,
      description: description,
      scheduledStart: scheduledStart,
      scheduledEnd: scheduledEnd,
    );

    final result = await _bookConsultationUseCase.execute(params);

    result.when(
      success: (consultation) {
        state = BookingState.success(consultation);
      },
      failure: (error) {
        state = BookingState.error(error);
      },
    );
  }

  /// Reset state to initial
  void reset() {
    state = const BookingState.initial();
  }
}

/// Provider for booking notifier
final bookingNotifierProvider =
    StateNotifierProvider<BookingNotifier, BookingState>(
  (ref) {
    final useCase = ref.watch(bookConsultationUseCaseProvider);
    return BookingNotifier(useCase);
  },
);

/// Notifier for canceling consultation
class CancellationNotifier extends StateNotifier<CancellationState> {
  final CancelConsultationUseCase _cancelConsultationUseCase;

  CancellationNotifier(this._cancelConsultationUseCase)
      : super(const CancellationState.initial());

  /// Cancel a consultation
  Future<void> cancelConsultation({
    required String consultationId,
    required String reason,
  }) async {
    state = const CancellationState.loading();

    final params = CancelConsultationParams(
      consultationId: consultationId,
      reason: reason,
    );

    final result = await _cancelConsultationUseCase.execute(params);

    result.when(
      success: (_) {
        state = const CancellationState.success();
      },
      failure: (error) {
        state = CancellationState.error(error);
      },
    );
  }

  /// Reset state to initial
  void reset() {
    state = const CancellationState.initial();
  }
}

/// Provider for cancellation notifier
final cancellationNotifierProvider =
    StateNotifierProvider<CancellationNotifier, CancellationState>(
  (ref) {
    final useCase = ref.watch(cancelConsultationUseCaseProvider);
    return CancellationNotifier(useCase);
  },
);

/// Notifier for rating consultation
class RatingNotifier extends StateNotifier<RatingState> {
  final RateConsultationUseCase _rateConsultationUseCase;

  RatingNotifier(this._rateConsultationUseCase)
      : super(const RatingState.initial());

  /// Rate a consultation
  Future<void> rateConsultation({
    required String consultationId,
    required int rating,
    String? review,
  }) async {
    state = const RatingState.loading();

    final params = RateConsultationParams(
      consultationId: consultationId,
      rating: rating,
      review: review,
    );

    final result = await _rateConsultationUseCase.execute(params);

    result.when(
      success: (_) {
        state = const RatingState.success();
      },
      failure: (error) {
        state = RatingState.error(error);
      },
    );
  }

  /// Reset state to initial
  void reset() {
    state = const RatingState.initial();
  }
}

/// Provider for rating notifier
final ratingNotifierProvider =
    StateNotifierProvider<RatingNotifier, RatingState>(
  (ref) {
    final useCase = ref.watch(rateConsultationUseCaseProvider);
    return RatingNotifier(useCase);
  },
);

/// Provider for active consultation
final activeConsultationProvider =
    FutureProvider<ConsultationEntity?>((ref) async {
  final useCase = ref.watch(getActiveConsultationUseCaseProvider);
  final result = await useCase.execute();

  return result.when(
    success: (consultation) => consultation,
    failure: (_) => null,
  );
});
