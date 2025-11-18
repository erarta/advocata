import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/document_template.entity.dart';

part 'document_template.model.freezed.dart';
part 'document_template.model.g.dart';

@freezed
class DocumentTemplateModel with _$DocumentTemplateModel {
  const DocumentTemplateModel._();

  const factory DocumentTemplateModel({
    required String id,
    required String lawyerId,
    required String title,
    String? description,
    required String fileName,
    required String fileUrl,
    required int fileSize,
    required String mimeType,
    required String type,
    required String category,
    required String status,
    required bool isPublic,
    required List<String> tags,
    required Map<String, dynamic> metadata,
    String? processedAt,
    String? errorMessage,
    int? chunkCount,
    @Default(0) int downloadCount,
    required String createdAt,
    required String updatedAt,
  }) = _DocumentTemplateModel;

  factory DocumentTemplateModel.fromJson(Map<String, dynamic> json) =>
      _$DocumentTemplateModelFromJson(json);

  /// Convert model to entity
  DocumentTemplateEntity toEntity() {
    return DocumentTemplateEntity(
      id: id,
      lawyerId: lawyerId,
      title: title,
      description: description,
      fileName: fileName,
      fileUrl: fileUrl,
      fileSize: fileSize,
      mimeType: mimeType,
      type: _parseDocumentType(type),
      category: DocumentCategory.fromString(category),
      status: _parseDocumentStatus(status),
      isPublic: isPublic,
      tags: tags,
      metadata: metadata,
      processedAt: processedAt != null ? DateTime.parse(processedAt!) : null,
      errorMessage: errorMessage,
      chunkCount: chunkCount,
      downloadCount: downloadCount,
      createdAt: DateTime.parse(createdAt),
      updatedAt: DateTime.parse(updatedAt),
    );
  }

  DocumentType _parseDocumentType(String type) {
    switch (type.toLowerCase()) {
      case 'pdf':
        return DocumentType.pdf;
      case 'image':
        return DocumentType.image;
      case 'text':
        return DocumentType.text;
      default:
        return DocumentType.pdf;
    }
  }

  DocumentStatus _parseDocumentStatus(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return DocumentStatus.pending;
      case 'processing':
        return DocumentStatus.processing;
      case 'completed':
        return DocumentStatus.completed;
      case 'failed':
        return DocumentStatus.failed;
      default:
        return DocumentStatus.pending;
    }
  }
}
