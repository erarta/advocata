import { ICommand } from '@nestjs/cqrs';
import { VerifyLawyerDto } from '../../../../presentation/dtos/lawyers/verify-lawyer.dto';

export class VerifyLawyerCommand implements ICommand {
  constructor(
    public readonly lawyerId: string,
    public readonly dto: VerifyLawyerDto,
  ) {}
}
