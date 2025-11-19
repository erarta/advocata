import { ICommand } from '@nestjs/cqrs';

export type DisputeResolution =
  | 'refund_full'
  | 'refund_partial'
  | 'no_refund'
  | 'lawyer_warning';

export interface ResolveDisputeDto {
  resolution: DisputeResolution;
  notes?: string;
  refundAmount?: number;
}

export class ResolveDisputeCommand implements ICommand {
  constructor(
    public readonly consultationId: string,
    public readonly dto: ResolveDisputeDto,
  ) {}
}
