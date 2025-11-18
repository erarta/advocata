import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'dart:io';
import '../../domain/entities/document_category.entity.dart';
import '../../domain/entities/document_template.entity.dart';
import '../../domain/repositories/document_repository.dart';
import '../datasources/document_remote_datasource.dart';

part 'document_repository_impl.g.dart';

class DocumentRepositoryImpl implements DocumentRepository {
  final DocumentRemoteDataSource _remoteDataSource;
  final Dio _dio;

  DocumentRepositoryImpl(this._remoteDataSource, this._dio);

  @override
  Future<List<DocumentCategoryEntity>> getCategories() async {
    final models = await _remoteDataSource.getCategories();
    return models.map((model) => model.toEntity()).toList();
  }

  @override
  Future<List<DocumentTemplateEntity>> getDocumentsByCategory({
    required String category,
    int page = 1,
    int limit = 20,
  }) async {
    final models = await _remoteDataSource.getDocumentsByCategory(
      category: category,
      page: page,
      limit: limit,
    );
    return models.map((model) => model.toEntity()).toList();
  }

  @override
  Future<List<DocumentTemplateEntity>> searchDocuments({
    required String query,
    String? category,
    int page = 1,
    int limit = 20,
  }) async {
    final models = await _remoteDataSource.searchDocuments(
      query: query,
      category: category,
      page: page,
      limit: limit,
    );
    return models.map((model) => model.toEntity()).toList();
  }

  @override
  Future<List<DocumentTemplateEntity>> getPopularTemplates({
    int limit = 10,
    String? category,
  }) async {
    final models = await _remoteDataSource.getPopularTemplates(
      limit: limit,
      category: category,
    );
    return models.map((model) => model.toEntity()).toList();
  }

  @override
  Future<DocumentTemplateEntity> getDocumentById(String id) async {
    final model = await _remoteDataSource.getDocumentById(id);
    return model.toEntity();
  }

  @override
  Future<void> trackDownload(String documentId) async {
    await _remoteDataSource.trackDownload(documentId);
  }

  @override
  Future<String> downloadDocument({
    required String documentId,
    required String fileName,
    required String fileUrl,
    Function(double)? onProgress,
  }) async {
    try {
      // Get downloads directory
      final dir = await getApplicationDocumentsDirectory();
      final downloadDir = Directory('${dir.path}/downloads');

      // Create downloads directory if it doesn't exist
      if (!await downloadDir.exists()) {
        await downloadDir.create(recursive: true);
      }

      final filePath = '${downloadDir.path}/$fileName';

      // Download file with progress tracking
      await _dio.download(
        fileUrl,
        filePath,
        onReceiveProgress: (received, total) {
          if (total != -1 && onProgress != null) {
            final progress = received / total;
            onProgress(progress);
          }
        },
      );

      // Track download
      await trackDownload(documentId);

      return filePath;
    } catch (e) {
      throw Exception('Failed to download document: $e');
    }
  }
}

@riverpod
DocumentRepository documentRepository(DocumentRepositoryRef ref) {
  final remoteDataSource = ref.watch(documentRemoteDataSourceProvider);
  final dio = Dio(); // Create separate Dio instance for downloads
  return DocumentRepositoryImpl(remoteDataSource, dio);
}
