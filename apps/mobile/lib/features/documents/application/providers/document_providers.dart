import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/repositories/document_repository_impl.dart';
import '../../domain/entities/document_category.entity.dart';
import '../../domain/entities/document_template.entity.dart';

part 'document_providers.g.dart';

/// Provider for fetching all document categories
@riverpod
Future<List<DocumentCategoryEntity>> documentCategories(
  DocumentCategoriesRef ref,
) async {
  final repository = ref.watch(documentRepositoryProvider);
  return repository.getCategories();
}

/// Provider for fetching documents by category
@riverpod
Future<List<DocumentTemplateEntity>> documentsByCategory(
  DocumentsByCategoryRef ref,
  String category, {
  int page = 1,
  int limit = 20,
}) async {
  final repository = ref.watch(documentRepositoryProvider);
  return repository.getDocumentsByCategory(
    category: category,
    page: page,
    limit: limit,
  );
}

/// Provider for searching documents
@riverpod
Future<List<DocumentTemplateEntity>> searchDocuments(
  SearchDocumentsRef ref,
  String query, {
  String? category,
  int page = 1,
  int limit = 20,
}) async {
  final repository = ref.watch(documentRepositoryProvider);
  return repository.searchDocuments(
    query: query,
    category: category,
    page: page,
    limit: limit,
  );
}

/// Provider for fetching popular templates
@riverpod
Future<List<DocumentTemplateEntity>> popularTemplates(
  PopularTemplatesRef ref, {
  int limit = 10,
  String? category,
}) async {
  final repository = ref.watch(documentRepositoryProvider);
  return repository.getPopularTemplates(
    limit: limit,
    category: category,
  );
}

/// Provider for fetching a single document by ID
@riverpod
Future<DocumentTemplateEntity> documentDetail(
  DocumentDetailRef ref,
  String documentId,
) async {
  final repository = ref.watch(documentRepositoryProvider);
  return repository.getDocumentById(documentId);
}

/// Provider for tracking download progress
@riverpod
class DownloadProgress extends _$DownloadProgress {
  @override
  double build(String documentId) {
    return 0.0;
  }

  void updateProgress(double progress) {
    state = progress;
  }

  void reset() {
    state = 0.0;
  }
}

/// Provider for downloading a document
@riverpod
Future<String> downloadDocument(
  DownloadDocumentRef ref, {
  required String documentId,
  required String fileName,
  required String fileUrl,
}) async {
  final repository = ref.watch(documentRepositoryProvider);

  return repository.downloadDocument(
    documentId: documentId,
    fileName: fileName,
    fileUrl: fileUrl,
    onProgress: (progress) {
      // Update progress provider
      ref
          .read(downloadProgressProvider(documentId).notifier)
          .updateProgress(progress);
    },
  );
}
