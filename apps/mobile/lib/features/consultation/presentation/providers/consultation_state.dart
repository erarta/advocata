import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:advocata/features/consultation/domain/entities/consultation_entity.dart';

part 'consultation_state.freezed.dart';

/// State for consultation list
@freezed
class ConsultationListState with _$ConsultationListState {
  const factory ConsultationListState.initial() = _Initial;
  const factory ConsultationListState.loading() = _Loading;
  const factory ConsultationListState.loaded(
    List<ConsultationEntity> consultations,
  ) = _Loaded;
  const factory ConsultationListState.error(String message) = _Error;
}

/// State for consultation booking
@freezed
class BookingState with _$BookingState {
  const factory BookingState.initial() = _BookingInitial;
  const factory BookingState.loading() = _BookingLoading;
  const factory BookingState.success(ConsultationEntity consultation) =
      _BookingSuccess;
  const factory BookingState.error(String message) = _BookingError;
}

/// State for consultation cancellation
@freezed
class CancellationState with _$CancellationState {
  const factory CancellationState.initial() = _CancellationInitial;
  const factory CancellationState.loading() = _CancellationLoading;
  const factory CancellationState.success() = _CancellationSuccess;
  const factory CancellationState.error(String message) = _CancellationError;
}

/// State for consultation rating
@freezed
class RatingState with _$RatingState {
  const factory RatingState.initial() = _RatingInitial;
  const factory RatingState.loading() = _RatingLoading;
  const factory RatingState.success() = _RatingSuccess;
  const factory RatingState.error(String message) = _RatingError;
}
