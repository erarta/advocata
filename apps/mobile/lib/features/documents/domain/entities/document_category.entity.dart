import 'package:freezed_annotation/freezed_annotation.dart';
import 'document_template.entity.dart';

part 'document_category.entity.freezed.dart';
part 'document_category.entity.g.dart';

@freezed
class DocumentCategoryEntity with _$DocumentCategoryEntity {
  const factory DocumentCategoryEntity({
    required DocumentCategory category,
    required int count,
    required String name,
    required String nameRu,
    required String icon,
  }) = _DocumentCategoryEntity;

  factory DocumentCategoryEntity.fromJson(Map<String, dynamic> json) =>
      _$DocumentCategoryEntityFromJson(json);
}
