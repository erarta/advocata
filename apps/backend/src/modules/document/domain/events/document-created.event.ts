import { DomainEvent } from '../../../../shared/domain/domain-event';
import { DocumentType } from '../entities/document.entity';

export class DocumentCreatedEvent extends DomainEvent {
  constructor(
    public readonly documentId: string,
    public readonly lawyerId: string,
    public readonly title: string,
    public readonly type: DocumentType,
  ) {
    super();
  }
}
