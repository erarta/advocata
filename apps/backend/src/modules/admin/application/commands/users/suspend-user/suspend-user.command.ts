import { ICommand } from '@nestjs/cqrs';
import { SuspendUserDto } from '../../../../presentation/dtos/users/suspend-user.dto';

export class SuspendUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly dto: SuspendUserDto,
  ) {}
}
