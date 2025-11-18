import 'package:freezed_annotation/freezed_annotation.dart';
import '../../domain/entities/document_category.entity.dart';
import '../../domain/entities/document_template.entity.dart';

part 'document_category.model.freezed.dart';
part 'document_category.model.g.dart';

@freezed
class DocumentCategoryModel with _$DocumentCategoryModel {
  const DocumentCategoryModel._();

  const factory DocumentCategoryModel({
    required String category,
    required int count,
    required String name,
    required String nameRu,
    required String icon,
  }) = _DocumentCategoryModel;

  factory DocumentCategoryModel.fromJson(Map<String, dynamic> json) =>
      _$DocumentCategoryModelFromJson(json);

  /// Convert model to entity
  DocumentCategoryEntity toEntity() {
    return DocumentCategoryEntity(
      category: DocumentCategory.fromString(category),
      count: count,
      name: name,
      nameRu: nameRu,
      icon: icon,
    );
  }
}
