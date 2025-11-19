import { ICommand } from '@nestjs/cqrs';

export interface ActivateLawyerDto {
  notes?: string;
}

export class ActivateLawyerCommand implements ICommand {
  constructor(
    public readonly lawyerId: string,
    public readonly dto: ActivateLawyerDto,
  ) {}
}
