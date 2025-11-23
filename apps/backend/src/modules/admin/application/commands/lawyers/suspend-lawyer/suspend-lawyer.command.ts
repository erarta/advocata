import { ICommand } from '@nestjs/cqrs';
import { SuspendLawyerDto } from '../../../../presentation/dtos/lawyers/suspend-lawyer.dto';

export class SuspendLawyerCommand implements ICommand {
  constructor(
    public readonly lawyerId: string,
    public readonly dto: SuspendLawyerDto,
  ) {}
}
