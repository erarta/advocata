import { IQuery } from '@nestjs/cqrs';
import { GetLegalInfoPagesDto } from '../../../../presentation/dtos/content/legal-info-page.dto';

export class GetLegalInfoPagesQuery implements IQuery {
  constructor(public readonly dto: GetLegalInfoPagesDto) {}
}
