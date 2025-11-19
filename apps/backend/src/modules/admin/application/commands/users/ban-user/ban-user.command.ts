import { ICommand } from '@nestjs/cqrs';
import { BanUserDto } from '../../../../presentation/dtos/users/ban-user.dto';

export class BanUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly dto: BanUserDto,
  ) {}
}
