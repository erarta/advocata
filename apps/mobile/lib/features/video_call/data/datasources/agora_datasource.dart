/// Agora RTC data source interface
///
/// This interface abstracts the Agora SDK integration
/// TODO: Implement with actual agora_rtc_engine package
abstract class AgoraDataSource {
  /// Initialize Agora engine with app ID
  Future<void> initialize(String appId);

  /// Join a channel
  Future<void> joinChannel({
    required String token,
    required String channelName,
    required int uid,
  });

  /// Leave the channel
  Future<void> leaveChannel();

  /// Enable/disable local audio
  Future<void> enableLocalAudio(bool enabled);

  /// Enable/disable local video
  Future<void> enableLocalVideo(bool enabled);

  /// Switch camera (front/back)
  Future<void> switchCamera();

  /// Enable speaker
  Future<void> setEnableSpeakerphone(bool enabled);

  /// Set video quality
  Future<void> setVideoQuality({
    required int width,
    required int height,
    required int frameRate,
    required int bitrate,
  });

  /// Dispose engine
  Future<void> dispose();

  /// Listen to remote user joined event
  Stream<int> get onUserJoined;

  /// Listen to remote user left event
  Stream<int> get onUserLeft;

  /// Listen to network quality event
  Stream<int> get onNetworkQuality;

  /// Listen to connection state changed event
  Stream<ConnectionState> get onConnectionStateChanged;
}

/// Connection state
enum ConnectionState {
  disconnected,
  connecting,
  connected,
  reconnecting,
  failed;
}

/// Mock implementation of Agora data source
/// TODO: Replace with actual AgoraDataSourceImpl using agora_rtc_engine
class AgoraDataSourceMock implements AgoraDataSource {
  bool _isInitialized = false;
  bool _isInChannel = false;

  @override
  Future<void> initialize(String appId) async {
    await Future.delayed(const Duration(milliseconds: 500));
    _isInitialized = true;
    print('Agora: Initialized with app ID: $appId');
  }

  @override
  Future<void> joinChannel({
    required String token,
    required String channelName,
    required int uid,
  }) async {
    if (!_isInitialized) {
      throw Exception('Agora not initialized');
    }

    await Future.delayed(const Duration(seconds: 1));
    _isInChannel = true;
    print('Agora: Joined channel: $channelName with uid: $uid');
  }

  @override
  Future<void> leaveChannel() async {
    await Future.delayed(const Duration(milliseconds: 500));
    _isInChannel = false;
    print('Agora: Left channel');
  }

  @override
  Future<void> enableLocalAudio(bool enabled) async {
    print('Agora: Local audio ${enabled ? "enabled" : "disabled"}');
  }

  @override
  Future<void> enableLocalVideo(bool enabled) async {
    print('Agora: Local video ${enabled ? "enabled" : "disabled"}');
  }

  @override
  Future<void> switchCamera() async {
    print('Agora: Camera switched');
  }

  @override
  Future<void> setEnableSpeakerphone(bool enabled) async {
    print('Agora: Speaker ${enabled ? "enabled" : "disabled"}');
  }

  @override
  Future<void> setVideoQuality({
    required int width,
    required int height,
    required int frameRate,
    required int bitrate,
  }) async {
    print('Agora: Video quality set to ${width}x$height @ $frameRate fps');
  }

  @override
  Future<void> dispose() async {
    await leaveChannel();
    _isInitialized = false;
    print('Agora: Disposed');
  }

  @override
  Stream<int> get onUserJoined => Stream.empty();

  @override
  Stream<int> get onUserLeft => Stream.empty();

  @override
  Stream<int> get onNetworkQuality => Stream.periodic(
        const Duration(seconds: 5),
        (count) => 4, // Mock good quality
      );

  @override
  Stream<ConnectionState> get onConnectionStateChanged => Stream.value(
        ConnectionState.connected,
      );
}
