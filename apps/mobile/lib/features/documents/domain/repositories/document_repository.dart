import '../entities/document_category.entity.dart';
import '../entities/document_template.entity.dart';

abstract class DocumentRepository {
  /// Get all document categories with counts
  Future<List<DocumentCategoryEntity>> getCategories();

  /// Get documents by category
  Future<List<DocumentTemplateEntity>> getDocumentsByCategory({
    required String category,
    int page = 1,
    int limit = 20,
  });

  /// Search documents
  Future<List<DocumentTemplateEntity>> searchDocuments({
    required String query,
    String? category,
    int page = 1,
    int limit = 20,
  });

  /// Get popular templates (most downloaded)
  Future<List<DocumentTemplateEntity>> getPopularTemplates({
    int limit = 10,
    String? category,
  });

  /// Get document by ID
  Future<DocumentTemplateEntity> getDocumentById(String id);

  /// Track download (increment download count)
  Future<void> trackDownload(String documentId);

  /// Download document file
  Future<String> downloadDocument({
    required String documentId,
    required String fileName,
    required String fileUrl,
    Function(double)? onProgress,
  });
}
