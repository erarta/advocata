import { ICommand } from '@nestjs/cqrs';

export interface IssueRefundDto {
  amount: number;
  reason: string;
}

export class IssueRefundCommand implements ICommand {
  constructor(
    public readonly consultationId: string,
    public readonly dto: IssueRefundDto,
  ) {}
}
