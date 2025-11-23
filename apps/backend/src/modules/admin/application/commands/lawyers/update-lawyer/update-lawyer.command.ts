import { ICommand } from '@nestjs/cqrs';
import { UpdateLawyerDto } from '../../../../presentation/dtos/lawyers/update-lawyer.dto';

export class UpdateLawyerCommand implements ICommand {
  constructor(
    public readonly lawyerId: string,
    public readonly dto: UpdateLawyerDto,
  ) {}
}
