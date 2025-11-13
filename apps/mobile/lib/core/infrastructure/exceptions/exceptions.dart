/// Base exception class
class AppException implements Exception {
  final String message;
  final int? code;

  const AppException({
    required this.message,
    this.code,
  });

  @override
  String toString() => message;
}

/// Server exception
class ServerException extends AppException {
  const ServerException({
    required super.message,
    super.code,
  });
}

/// Network exception
class NetworkException extends AppException {
  const NetworkException({
    super.message = 'No internet connection',
    super.code,
  });
}

/// Cache exception
class CacheException extends AppException {
  const CacheException({
    required super.message,
    super.code,
  });
}

/// Validation exception
class ValidationException extends AppException {
  const ValidationException({
    required super.message,
    super.code,
  });
}

/// Authentication exception
class AuthenticationException extends AppException {
  const AuthenticationException({
    required super.message,
    super.code,
  });
}

/// Authorization exception
class AuthorizationException extends AppException {
  const AuthorizationException({
    super.message = 'Access denied',
    super.code = 403,
  });
}

/// Not found exception
class NotFoundException extends AppException {
  const NotFoundException({
    super.message = 'Resource not found',
    super.code = 404,
  });
}
