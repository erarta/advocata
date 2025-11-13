import { DomainEvent } from '../../../../shared/domain/domain-event';

export class DocumentProcessedEvent extends DomainEvent {
  constructor(
    public readonly documentId: string,
    public readonly lawyerId: string,
    public readonly chunkCount: number,
  ) {
    super();
  }
}
