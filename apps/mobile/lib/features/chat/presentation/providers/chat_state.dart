import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/message_entity.dart';

part 'chat_state.freezed.dart';

/// Chat state
@freezed
class ChatState with _$ChatState {
  const factory ChatState.initial() = _Initial;

  const factory ChatState.loading() = _Loading;

  const factory ChatState.loaded({
    required List<MessageEntity> messages,
    required bool hasMore,
    required bool isLoadingMore,
    @Default(false) bool isTyping,
  }) = _Loaded;

  const factory ChatState.sending({
    required List<MessageEntity> messages,
    required MessageEntity pendingMessage,
  }) = _Sending;

  const factory ChatState.error({
    required String message,
    List<MessageEntity>? messages,
  }) = _Error;
}
