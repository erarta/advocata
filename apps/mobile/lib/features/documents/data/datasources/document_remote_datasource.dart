import 'package:dio/dio.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../../core/infrastructure/http/http_client_provider.dart';
import '../models/document_category.model.dart';
import '../models/document_template.model.dart';

part 'document_remote_datasource.g.dart';

abstract class DocumentRemoteDataSource {
  Future<List<DocumentCategoryModel>> getCategories();
  Future<List<DocumentTemplateModel>> getDocumentsByCategory({
    required String category,
    int page = 1,
    int limit = 20,
  });
  Future<List<DocumentTemplateModel>> searchDocuments({
    required String query,
    String? category,
    int page = 1,
    int limit = 20,
  });
  Future<List<DocumentTemplateModel>> getPopularTemplates({
    int limit = 10,
    String? category,
  });
  Future<DocumentTemplateModel> getDocumentById(String id);
  Future<void> trackDownload(String documentId);
}

class DocumentRemoteDataSourceImpl implements DocumentRemoteDataSource {
  final Dio _dio;

  DocumentRemoteDataSourceImpl(this._dio);

  @override
  Future<List<DocumentCategoryModel>> getCategories() async {
    try {
      final response = await _dio.get('/documents/templates/categories');

      final List categoriesData = response.data['categories'];
      return categoriesData
          .map((json) => DocumentCategoryModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch categories: $e');
    }
  }

  @override
  Future<List<DocumentTemplateModel>> getDocumentsByCategory({
    required String category,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final response = await _dio.get('/documents', queryParameters: {
        'category': category,
        'isPublic': true,
        'page': page,
        'limit': limit,
      });

      final List documentsData = response.data['documents'];
      return documentsData
          .map((json) => DocumentTemplateModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch documents by category: $e');
    }
  }

  @override
  Future<List<DocumentTemplateModel>> searchDocuments({
    required String query,
    String? category,
    int page = 1,
    int limit = 20,
  }) async {
    try {
      final queryParams = {
        'searchTerm': query,
        'isPublic': true,
        'page': page,
        'limit': limit,
      };

      if (category != null) {
        queryParams['category'] = category;
      }

      final response = await _dio.get('/documents', queryParameters: queryParams);

      final List documentsData = response.data['documents'];
      return documentsData
          .map((json) => DocumentTemplateModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to search documents: $e');
    }
  }

  @override
  Future<List<DocumentTemplateModel>> getPopularTemplates({
    int limit = 10,
    String? category,
  }) async {
    try {
      final queryParams = {'limit': limit};

      if (category != null) {
        queryParams['category'] = category;
      }

      final response = await _dio.get(
        '/documents/templates/popular',
        queryParameters: queryParams,
      );

      final List templatesData = response.data['templates'];
      return templatesData
          .map((json) => DocumentTemplateModel.fromJson(json))
          .toList();
    } catch (e) {
      throw Exception('Failed to fetch popular templates: $e');
    }
  }

  @override
  Future<DocumentTemplateModel> getDocumentById(String id) async {
    try {
      final response = await _dio.get('/documents/$id');
      return DocumentTemplateModel.fromJson(response.data);
    } catch (e) {
      throw Exception('Failed to fetch document by ID: $e');
    }
  }

  @override
  Future<void> trackDownload(String documentId) async {
    try {
      await _dio.post('/documents/$documentId/track-download');
    } catch (e) {
      throw Exception('Failed to track download: $e');
    }
  }
}

@riverpod
DocumentRemoteDataSource documentRemoteDataSource(
  DocumentRemoteDataSourceRef ref,
) {
  final dio = ref.watch(httpClientProvider);
  return DocumentRemoteDataSourceImpl(dio);
}
