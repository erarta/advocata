import { ApiProperty } from '@nestjs/swagger';
import { DocumentCategory } from '../../domain/entities/document.entity';

export class CategoryResponseDto {
  @ApiProperty({ enum: DocumentCategory })
  category: DocumentCategory;

  @ApiProperty()
  count: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ description: 'Russian name of the category' })
  nameRu: string;

  @ApiProperty({ description: 'Icon emoji for the category' })
  icon: string;
}

export class GetCategoriesResponseDto {
  @ApiProperty({ type: [CategoryResponseDto] })
  categories: CategoryResponseDto[];
}

export class GetPopularTemplatesResponseDto {
  @ApiProperty({ type: [Document] })
  templates: any[];
}
