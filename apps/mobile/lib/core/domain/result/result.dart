import 'package:equatable/equatable.dart';
import '../failures/failure.dart';

/// Result type for handling success and failure cases
class Result<T> extends Equatable {
  final T? _value;
  final Failure? _failure;

  const Result._({
    T? value,
    Failure? failure,
  })  : _value = value,
        _failure = failure;

  /// Create a success result
  factory Result.success(T value) {
    return Result._(value: value);
  }

  /// Create a failure result
  factory Result.failure(Failure failure) {
    return Result._(failure: failure);
  }

  /// Check if result is successful
  bool get isSuccess => _value != null;

  /// Check if result is a failure
  bool get isFailure => _failure != null;

  /// Get the value (throws if failure)
  T get value {
    if (_value == null) {
      throw Exception('Attempted to get value from a failed result');
    }
    return _value!;
  }

  /// Get the failure (throws if success)
  Failure get failure {
    if (_failure == null) {
      throw Exception('Attempted to get failure from a successful result');
    }
    return _failure!;
  }

  /// Get value or null
  T? get valueOrNull => _value;

  /// Get failure or null
  Failure? get failureOrNull => _failure;

  /// Fold result into a single value
  R fold<R>({
    required R Function(T value) onSuccess,
    required R Function(Failure failure) onFailure,
  }) {
    if (isSuccess) {
      return onSuccess(value);
    } else {
      return onFailure(failure);
    }
  }

  /// Map the value if successful
  Result<R> map<R>(R Function(T value) mapper) {
    if (isSuccess) {
      return Result.success(mapper(value));
    } else {
      return Result.failure(failure);
    }
  }

  /// FlatMap the value if successful
  Result<R> flatMap<R>(Result<R> Function(T value) mapper) {
    if (isSuccess) {
      return mapper(value);
    } else {
      return Result.failure(failure);
    }
  }

  @override
  List<Object?> get props => [_value, _failure];
}
