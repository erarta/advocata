import 'package:freezed_annotation/freezed_annotation.dart';

part 'document_template.entity.freezed.dart';
part 'document_template.entity.g.dart';

enum DocumentType {
  pdf,
  image,
  text,
}

enum DocumentStatus {
  pending,
  processing,
  completed,
  failed,
}

enum DocumentCategory {
  contract('contract', 'Договорная работа', '📄'),
  courtDecision('court_decision', 'Судебные решения', '⚖️'),
  law('law', 'Законодательство', '📚'),
  regulation('regulation', 'Нормативные акты', '📋'),
  template('template', 'Шаблоны документов', '📝'),
  guide('guide', 'Руководства', '📖'),
  other('other', 'Иные', '📁');

  final String value;
  final String nameRu;
  final String icon;

  const DocumentCategory(this.value, this.nameRu, this.icon);

  static DocumentCategory fromString(String value) {
    return DocumentCategory.values.firstWhere(
      (e) => e.value == value,
      orElse: () => DocumentCategory.other,
    );
  }
}

@freezed
class DocumentTemplateEntity with _$DocumentTemplateEntity {
  const DocumentTemplateEntity._();

  const factory DocumentTemplateEntity({
    required String id,
    required String lawyerId,
    required String title,
    String? description,
    required String fileName,
    required String fileUrl,
    required int fileSize,
    required String mimeType,
    required DocumentType type,
    required DocumentCategory category,
    required DocumentStatus status,
    required bool isPublic,
    required List<String> tags,
    required Map<String, dynamic> metadata,
    DateTime? processedAt,
    String? errorMessage,
    int? chunkCount,
    required int downloadCount,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _DocumentTemplateEntity;

  factory DocumentTemplateEntity.fromJson(Map<String, dynamic> json) =>
      _$DocumentTemplateEntityFromJson(json);

  /// Check if document is a premium/paid template
  bool get isPremium => !isPublic;

  /// Check if document is free
  bool get isFree => isPublic;

  /// Get file extension from fileName
  String get fileExtension {
    final parts = fileName.split('.');
    return parts.length > 1 ? parts.last.toLowerCase() : '';
  }

  /// Format file size to human-readable string
  String get fileSizeFormatted {
    if (fileSize < 1024) {
      return '$fileSize B';
    } else if (fileSize < 1024 * 1024) {
      return '${(fileSize / 1024).toStringAsFixed(1)} KB';
    } else {
      return '${(fileSize / (1024 * 1024)).toStringAsFixed(1)} MB';
    }
  }

  /// Get category display name in Russian
  String get categoryNameRu => category.nameRu;

  /// Get category icon
  String get categoryIcon => category.icon;
}
