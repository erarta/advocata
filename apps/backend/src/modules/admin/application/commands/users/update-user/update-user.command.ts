import { ICommand } from '@nestjs/cqrs';
import { UpdateUserDto } from '../../../../presentation/dtos/users/update-user.dto';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly userId: string,
    public readonly dto: UpdateUserDto,
  ) {}
}
