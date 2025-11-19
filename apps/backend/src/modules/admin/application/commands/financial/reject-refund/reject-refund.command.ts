import { ICommand } from '@nestjs/cqrs';

export interface RejectRefundDto {
  reason: string;
}

export class RejectRefundCommand implements ICommand {
  constructor(
    public readonly refundId: string,
    public readonly dto: RejectRefundDto,
  ) {}
}
