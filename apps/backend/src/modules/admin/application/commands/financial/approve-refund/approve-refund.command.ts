import { ICommand } from '@nestjs/cqrs';
import { ApproveRefundDto } from '../../../../presentation/dtos/financial/approve-refund.dto';

export class ApproveRefundCommand implements ICommand {
  constructor(
    public readonly refundId: string,
    public readonly dto: ApproveRefundDto,
  ) {}
}
