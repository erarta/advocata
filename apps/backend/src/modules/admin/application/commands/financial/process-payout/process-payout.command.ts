import { ICommand } from '@nestjs/cqrs';
import { ProcessPayoutDto } from '../../../../presentation/dtos/financial/process-payout.dto';

export class ProcessPayoutCommand implements ICommand {
  constructor(
    public readonly lawyerId: string,
    public readonly dto: ProcessPayoutDto,
  ) {}
}
