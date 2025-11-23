import { ICommand } from '@nestjs/cqrs';

export interface BanLawyerDto {
  reason: string;
  notes?: string;
}

export class BanLawyerCommand implements ICommand {
  constructor(
    public readonly lawyerId: string,
    public readonly dto: BanLawyerDto,
  ) {}
}
